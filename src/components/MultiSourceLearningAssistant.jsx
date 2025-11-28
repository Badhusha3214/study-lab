import React, { useState } from 'react';
import { Youtube, FileText, Layers, Loader2, AlertCircle, Plus, Trash2, BookOpen, HelpCircle, MessageSquare, Settings, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Utility: detect YouTube URL
const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Extract text from blog HTML (very naive readability-like approach)
const extractReadableText = (htmlString) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    // Remove script/style
    doc.querySelectorAll('script,style,noscript').forEach(el => el.remove());
    // Prefer article/main selectors
    const main = doc.querySelector('article, main, .post, #post, .content, #content') || doc.body;
    const text = main.innerText.replace(/\s+/g, ' ').trim();
    return text.slice(0, 15000); // limit length
  } catch (e) {
    return '';
  }
};

export default function MultiSourceLearningAssistant() {
  const { user, authFetch } = useAuth();
  const [sources, setSources] = useState([]); // {id,type,label,data,videoId}
  const [inputUrl, setInputUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'
  const [chatLoading, setChatLoading] = useState(false);

  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
  const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';

  const callGeminiAPI = async (prompt) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
    if (!response.ok) throw new Error('Gemini API request failed');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  };
  const callGroqAPI = async (prompt) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` }, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 2000 }) });
    if (!response.ok) throw new Error('Groq API request failed');
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  };
  const callAI = async (prompt) => {
    if (selectedModel === 'gemini') { if (!GEMINI_API_KEY) throw new Error('Missing REACT_APP_GEMINI_API_KEY'); return callGeminiAPI(prompt);} else { if (!GROQ_API_KEY) throw new Error('Missing REACT_APP_GROQ_API_KEY'); return callGroqAPI(prompt);} };

  const addUrlSource = () => {
    if (!inputUrl.trim()) return;
    const videoId = extractYouTubeId(inputUrl.trim());
    const type = videoId ? 'youtube' : 'blog';
    setSources(prev => [...prev, { id: Date.now() + Math.random(), type, url: inputUrl.trim(), videoId, label: type === 'youtube' ? `YouTube Video` : 'Blog Article', data: null }]);
    setInputUrl('');
  };

  const removeSource = (id) => setSources(prev => prev.filter(s => s.id !== id));

  const loadPdf = (file) => { setPdfFile(file); };

  const processPdf = async (file) => {
    if (!file) return '';
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
      // worker disabled for simplicity in CRA without config
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 30); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map(it => it.str).join(' ');
        text += `\n\n[Page ${pageNum}]\n${strings}`;
        if (text.length > 45000) break; // token safety
      }
      return text;
    } catch (e) {
      console.error(e);
      throw new Error('PDF parsing failed');
    }
  };

  const fetchBlog = async (url) => {
    try {
      const res = await fetch('https://study-lab-utf8.onrender.com/api/content/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch blog');
      }
      return data.content;
    } catch (e) {
      console.error('Blog fetch error:', e);
      return 'Blog content unavailable: ' + e.message;
    }
  };

  const fetchYouTubeTranscript = async (videoId) => {
    try {
      const res = await fetch('https://study-lab-utf8.onrender.com/api/content/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }
      return data.transcript;
    } catch (e) {
      console.error('YouTube fetch error:', e);
      return 'YouTube transcript unavailable: ' + e.message;
    }
  };

  const processSources = async () => {
    if (sources.length === 0 && !pdfFile) return;
    setLoading(true); setError(''); setSummary(''); setQuiz([]); setChatMessages([]);
    try {
      // Clone array to mutate data
      const updated = [...sources];
      setLoadingMessage(`Fetching content from ${updated.length} source(s)...`);
      for (let i = 0; i < updated.length; i++) {
        const s = updated[i];
        setLoadingMessage(`Fetching ${s.type} content (${i + 1}/${updated.length})...`);
        if (s.type === 'youtube') {
          s.data = await fetchYouTubeTranscript(s.videoId);
        } else if (s.type === 'blog') {
          s.data = await fetchBlog(s.url);
        }
      }
      let pdfText = '';
      if (pdfFile) {
        setLoadingMessage('Processing PDF...');
        pdfText = await processPdf(pdfFile);
      }

      setSources(updated);

      const combined = [
        ...updated.map(s => `\n----\nSource: ${s.type.toUpperCase()} ${s.url}\nContent:\n${s.data}`),
        pdfText ? `\n----\nSource: PDF ${pdfFile.name}\nContent:\n${pdfText}` : ''
      ].join('\n');

      setLoadingMessage('Generating combined summary...');
      const summaryPrompt = `You are an educational assistant. Create a cohesive multi-source study summary combining ALL sources below. Preserve structure with clear sections and bullet points.\n\nSources:\n${combined}`;
      const summaryText = await callAI(summaryPrompt);
      setSummary(summaryText);

      setLoadingMessage('Generating quiz questions...');
      const quizPrompt = `Generate 8 diverse multiple choice questions (4 options each) covering ALL sources. Return ONLY JSON: [{"question":"","options":["A","B","C","D"],"correct":0}]. Sources:\n${combined.slice(0,18000)}`;
      const quizText = await callAI(quizPrompt);
      const cleanQuiz = quizText.replace(/```json|```/g,'').trim();
      try {
        const parsed = JSON.parse(cleanQuiz);
        setQuiz(parsed.map(q => ({ ...q, userAnswer: null, showResult: false })));
      } catch {
        setQuiz([{ question: 'Fallback question: Which source type was included?', options: ['YouTube','Blog','PDF','All'], correct: 3, userAnswer: null, showResult: false }]);
      }
      setActiveTab('summary');
    } catch (e) {
      setError(e.message);
    } finally { 
      setLoading(false); 
      setLoadingMessage('');
    }
  };

  const handleQuizAnswer = (qi, oi) => setQuiz(prev => prev.map((q,i) => i===qi?{...q,userAnswer:oi,showResult:true}:q));
  const getQuizScore = () => { const answered = quiz.filter(q=>q.userAnswer!==null); const correct = answered.filter(q=>q.userAnswer===q.correct); return {correct:correct.length,total:answered.length}; };

  const handleChat = async () => {
    if (!chatInput.trim() || !summary) return;
    const user = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, user]);
    const prompt = `Answer the question using ONLY combined source content context.\nSources Summary:\n${summary.substring(0,15000)}\nQuestion: ${chatInput}`;
    setChatInput('');
    setChatLoading(true);
    try {
      const answer = await callAI(prompt);
      setChatMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error: '+ e.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSaveHistory = async () => {
    if (!user) {
      alert('Please log in to save your learning session');
      return;
    }
    if (!summary || sources.length === 0) {
      alert('Nothing to save yet. Process sources first!');
      return;
    }
    setSaveStatus('saving');
    try {
      const payload = {
        sources: sources.map(s => ({ type: s.type, label: s.label, url: s.label })),
        summary,
        quiz
      };
      const res = await authFetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (e) {
      setSaveStatus('error');
      alert('Save error: ' + e.message);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Layers className="w-10 h-10 text-indigo-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Multi-Source Learning Assistant</h1>
            </div>
            <button onClick={()=>setShowSettings(!showSettings)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          {showSettings && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-700">AI Model</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" value="gemini" checked={selectedModel==='gemini'} onChange={e=>setSelectedModel(e.target.value)} />
                  <span>Gemini 2.5 Flash</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="groq" checked={selectedModel==='groq'} onChange={e=>setSelectedModel(e.target.value)} />
                  <span>Llama 3.3 (Groq)</span>
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-600">Current: {selectedModel==='gemini'? 'Gemini 2.5 Flash':'Llama 3.3 70B'}</p>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex gap-3">
                <input value={inputUrl} onChange={e=>setInputUrl(e.target.value)} placeholder="Add YouTube or Blog URL" className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                <button onClick={addUrlSource} disabled={!inputUrl.trim()} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"><Plus className="w-5 h-5"/>Add</button>
              </div>
              <div className="flex items-center gap-3">
                <input type="file" accept="application/pdf" onChange={e=>loadPdf(e.target.files[0])} className="flex-1" />
                {pdfFile && <span className="text-sm text-gray-600">PDF: {pdfFile.name}</span>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={processSources} disabled={loading || (sources.length===0 && !pdfFile)} className="flex-1 px-8 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white rounded-lg hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-400 font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {loading? <Loader2 className="w-5 h-5 animate-spin"/> : 'Process All Sources'}
                </button>
                {summary && (
                  <button onClick={handleSaveHistory} disabled={saveStatus==='saving'} className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${saveStatus==='saved' ? 'bg-green-500 text-white' : saveStatus==='error' ? 'bg-red-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'} disabled:opacity-50`}>
                    {saveStatus==='saving' ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                    {saveStatus==='saving' ? 'Saving...' : saveStatus==='saved' ? 'Saved!' : 'Save to History'}
                  </button>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-100 text-red-700 rounded-lg"><AlertCircle className="w-5 h-5"/><span>{error}</span></div>
              )}
              {loading && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">{loadingMessage || 'Processing...'}</span>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-h-60 overflow-y-auto">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Layers className="w-4 h-4"/>Sources ({sources.length + (pdfFile?1:0)})</h3>
              {sources.length===0 && !pdfFile && <p className="text-sm text-gray-500">No sources added yet.</p>}
              <ul className="space-y-2">
                {sources.map(s => (
                  <li key={s.id} className="group flex items-center justify-between gap-2 text-sm bg-white rounded-md border border-gray-200 px-3 py-2">
                    <span className="truncate flex items-center gap-2">{s.type==='youtube'? <Youtube className="w-4 h-4 text-red-600"/> : <FileText className="w-4 h-4 text-indigo-600"/>}{s.type==='youtube'? `Video ${s.videoId}`: s.url}</span>
                    <button onClick={()=>removeSource(s.id)} className="opacity-60 group-hover:opacity-100 text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                  </li>
                ))}
                {pdfFile && (
                  <li className="flex items-center justify-between gap-2 text-sm bg-white rounded-md border border-gray-200 px-3 py-2">
                    <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-600"/>PDF {pdfFile.name}</span>
                    <button onClick={()=>setPdfFile(null)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        {summary && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex border-b">
              <button onClick={()=>setActiveTab('summary')} className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab==='summary'? 'bg-indigo-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <BookOpen className="w-5 h-5"/>Summary
              </button>
              <button onClick={()=>setActiveTab('quiz')} className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab==='quiz'? 'bg-indigo-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <HelpCircle className="w-5 h-5"/>Quiz
              </button>
              <button onClick={()=>setActiveTab('chat')} className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab==='chat'? 'bg-indigo-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <MessageSquare className="w-5 h-5"/>Q&A Chat
              </button>
            </div>
            <div className="p-8">
              {activeTab==='summary' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Combined Summary</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <div 
                      className="summary-content"
                      dangerouslySetInnerHTML={{
                        __html: summary
                          // Headers (####, ###, ##, #)
                          .replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2 text-indigo-800">$1</h4>')
                          .replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-indigo-900">$1</h3>')
                          .replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-indigo-900">$2</h2>')
                          .replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4 text-indigo-900">$1</h1>')
                          // Bold text **text**
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                          // Italic text *text*
                          .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
                          // Bullet points with *
                          .replace(/^\*\s+(.+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
                          // Numbered lists
                          .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-6 mb-2 list-decimal">$1</li>')
                          // Horizontal rules
                          .replace(/^---+$/gm, '<hr class="my-6 border-gray-300" />')
                          // Wrap list items in ul tags
                          .replace(/(<li class="ml-6 mb-2 list-disc">.*?<\/li>\n?)+/g, '<ul class="my-4">$&</ul>')
                          .replace(/(<li class="ml-6 mb-2 list-decimal">.*?<\/li>\n?)+/g, '<ol class="my-4">$&</ol>')
                          // Paragraphs
                          .split('\n\n')
                          .map(para => {
                            if (para.trim() && !para.match(/^<[hlu]/)) {
                              return `<p class="mb-4 leading-relaxed">${para}</p>`;
                            }
                            return para;
                          })
                          .join('\n')
                      }}
                    />
                  </div>
                </div>
              )}
              {activeTab==='quiz' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Knowledge Check</h2>
                    {quiz.some(q=>q.userAnswer!==null) && (
                      <div className="text-lg font-semibold text-indigo-600">Score: {getQuizScore().correct}/{getQuizScore().total}</div>
                    )}
                  </div>
                  {quiz.length>0 ? (
                    <div className="space-y-6">
                      {quiz.map((q,qIdx)=>(
                        <div key={qIdx} className="p-6 bg-gray-50 rounded-lg">
                          <p className="font-semibold text-lg mb-4 text-gray-800">{qIdx+1}. {q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt,oIdx)=>(
                              <button key={oIdx} onClick={()=>handleQuizAnswer(qIdx,oIdx)} disabled={q.showResult} className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${q.showResult && oIdx===q.correct ? 'border-green-500 bg-green-50 font-semibold' : q.showResult && q.userAnswer===oIdx && oIdx!==q.correct ? 'border-red-500 bg-red-50' : q.userAnswer===oIdx ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-white'} ${q.showResult? 'cursor-default':'cursor-pointer'}`}>{opt}{q.showResult && oIdx===q.correct && ' ✓'}{q.showResult && q.userAnswer===oIdx && oIdx!==q.correct && ' ✗'}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-gray-600">Generating quiz...</p>}
                </div>
              )}
              {activeTab==='chat' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Ask Questions</h2>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                      {chatMessages.length===0 ? <p className="text-gray-500 text-center">Ask any question about the combined sources.</p> : chatMessages.map((m,i)=>(
                        <div key={i} className={`p-4 rounded-lg ${m.role==='user'? 'bg-indigo-600 text-white ml-12':'bg-white text-gray-800 mr-12 border border-gray-200 whitespace-pre-wrap'}`}>{m.content}</div>
                      ))}
                      {chatLoading && (
                        <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg mr-12">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                          <span className="text-gray-600">Thinking...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 p-4 bg-white border-t-2 border-gray-200">
                      <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && !chatLoading && handleChat()} placeholder="Type your question..." className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" disabled={chatLoading} />
                      <button onClick={handleChat} disabled={chatLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {!summary && !loading && (
          <div className="text-center text-sm text-gray-600 mt-6">
            Add multiple sources (videos, blogs, PDF) then click <strong>Process All Sources</strong> to generate a combined study pack.
            <div className="mt-2 text-xs text-gray-500">Note: Blog fetching can fail due to CORS. Use a backend proxy for production reliability.</div>
          </div>
        )}
      </div>
    </div>
  );
}
