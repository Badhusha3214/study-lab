import React, { useState } from 'react';
import { AlertCircle, BookOpen, MessageSquare, HelpCircle, Loader2, Youtube, Settings } from 'lucide-react';

export default function YouTubeLearningAssistant() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [showSettings, setShowSettings] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  // API Keys from environment (CRA uses REACT_APP_ prefix)
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
  const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchYouTubeTranscript = async (videoId) => {
    try {
      // Use our backend API to fetch the transcript
      const response = await fetch(`http://localhost:5000/api/transcript/${videoId}`);
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        // Check if it's a transcript disabled error
        if (data.details && data.details.includes('Transcript is disabled')) {
          throw new Error('⚠️ Transcripts/captions are disabled for this video. Please try a different video that has captions enabled.');
        }
        throw new Error(data.error || 'Failed to fetch transcript');
      }
      
      // Return the combined transcript text
      return data.transcript;
    } catch (error) {
      console.error('Transcript fetch error:', error);
      throw error;
    }
  };

  const callGeminiAPI = async (prompt) => {
    // Updated to use Gemini 2.5 Flash model. If Google updates naming, adjust the model id below.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  };

  const callGroqAPI = async (prompt) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('Groq API request failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  const callAI = async (prompt) => {
    if (selectedModel === 'gemini') {
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not found. Please set REACT_APP_GEMINI_API_KEY in your .env file');
      }
      return await callGeminiAPI(prompt);
    } else {
      if (!GROQ_API_KEY) {
        throw new Error('Groq API key not found. Please set REACT_APP_GROQ_API_KEY in your .env file');
      }
      return await callGroqAPI(prompt);
    }
  };

  const processVideo = async () => {
    setLoading(true);
    setError('');
    try {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      setVideoId(videoId);

      // Fetch the actual YouTube transcript
      setLoadingMessage('Fetching video transcript...');
      const videoTranscript = await fetchYouTubeTranscript(videoId);
      console.log('Transcript fetched, length:', videoTranscript.length);
      setTranscript(videoTranscript);

      // Ask AI to summarize the actual transcript
      setLoadingMessage('Generating summary with AI...');
      const summaryPrompt = `Please provide a comprehensive summary of this YouTube video transcript in 3-4 paragraphs. Cover the main topic, key points, important concepts, and key takeaways:\n\nTranscript:\n${videoTranscript}`;
      
      console.log('Calling AI for summary...');
      const summaryText = await callAI(summaryPrompt);
      console.log('Summary received:', summaryText.substring(0, 100));
      setSummary(summaryText);

      // Generate quiz questions based on the actual transcript
      setLoadingMessage('Generating quiz questions...');
      const quizPrompt = `Based on this YouTube video transcript, generate 5 multiple choice questions with 4 options each. Return ONLY valid JSON in this exact format with no markdown or preamble:\n[{"question": "Question text?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0}]\n\nTranscript: ${videoTranscript.substring(0, 3000)}`;

      console.log('Calling AI for quiz...');
      const quizText = await callAI(quizPrompt);
      console.log('Quiz response received');
      const cleanQuizText = quizText.replace(/```json|```/g, '').trim();

      try {
        const quizQuestions = JSON.parse(cleanQuizText);
        setQuiz(quizQuestions.map(q => ({ ...q, userAnswer: null, showResult: false })));
      } catch (e) {
        console.error('Quiz parsing error:', e);
        setQuiz([
          {
            question: 'What is the main topic discussed in the video?',
            options: ['General overview', 'Specific concept', 'Tutorial', 'Review'],
            correct: 0,
            userAnswer: null,
            showResult: false
          }
        ]);
      }
      setActiveTab('summary');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !transcript) return;
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setChatLoading(true);
    try {
      const prompt = `Based on this YouTube video transcript, please answer the following question concisely and accurately:\n\nTranscript: ${transcript}\n\nQuestion: ${currentInput}`;
      const botResponse = await callAI(prompt);
      setChatMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuizAnswer = (questionIndex, optionIndex) => {
    setQuiz(prev => prev.map((q, i) => i === questionIndex ? { ...q, userAnswer: optionIndex, showResult: true } : q));
  };

  const getQuizScore = () => {
    const answered = quiz.filter(q => q.userAnswer !== null);
    const correct = answered.filter(q => q.userAnswer === q.correct);
    return { correct: correct.length, total: answered.length };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Youtube className="w-10 h-10 text-red-600" />
              <h1 className="text-4xl font-bold text-gray-800">YouTube Learning Assistant</h1>
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          {showSettings && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-700">AI Model Selection</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="gemini" checked={selectedModel === 'gemini'} onChange={(e) => setSelectedModel(e.target.value)} className="w-4 h-4" />
                  <span className="font-medium">Google Gemini</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="groq" checked={selectedModel === 'groq'} onChange={(e) => setSelectedModel(e.target.value)} className="w-4 h-4" />
                  <span className="font-medium">Groq (Llama 3.3)</span>
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-600">Current: <span className="font-semibold">{selectedModel === 'gemini' ? 'Gemini 2.5 Flash' : 'Llama 3.3 70B'}</span></p>
            </div>
          )}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => {
                const url = e.target.value;
                setYoutubeUrl(url);
                const id = extractVideoId(url);
                setVideoId(id);
              }}
              placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <button onClick={processVideo} disabled={loading || !youtubeUrl} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Process'}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-100 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">{loadingMessage || 'Processing...'}</span>
            </div>
          )}
          {videoId && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Video Preview</h2>
              <div className="relative w-full pb-[56.25%] bg-black rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
        {transcript && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex border-b">
              <button onClick={() => setActiveTab('summary')} className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <BookOpen className="w-5 h-5" />
                Summary
              </button>
              <button onClick={() => setActiveTab('quiz')} className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'quiz' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <HelpCircle className="w-5 h-5" />
                Quiz
              </button>
              <button onClick={() => setActiveTab('chat')} className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <MessageSquare className="w-5 h-5" />
                Q&A Chat
              </button>
            </div>
            <div className="p-8">
              {activeTab === 'summary' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Video Summary</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <div 
                      className="summary-content"
                      dangerouslySetInnerHTML={{
                        __html: summary
                          // Headers (####, ###, ##, #)
                          .replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2 text-indigo-800">$1</h4>')
                          .replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-indigo-900">$1</h3>')
                          .replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-indigo-900">$1</h2>')
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
              {activeTab === 'quiz' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Test Your Knowledge</h2>
                    {quiz.some(q => q.userAnswer !== null) && (
                      <div className="text-lg font-semibold text-blue-600">Score: {getQuizScore().correct}/{getQuizScore().total}</div>
                    )}
                  </div>
                  {quiz.length > 0 ? (
                    <div className="space-y-6">
                      {quiz.map((q, qIdx) => (
                        <div key={qIdx} className="p-6 bg-gray-50 rounded-lg">
                          <p className="font-semibold text-lg mb-4 text-gray-800">{qIdx + 1}. {q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => (
                              <button key={oIdx} onClick={() => handleQuizAnswer(qIdx, oIdx)} disabled={q.showResult} className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${q.showResult && oIdx === q.correct ? 'border-green-500 bg-green-50 font-semibold' : q.showResult && q.userAnswer === oIdx && oIdx !== q.correct ? 'border-red-500 bg-red-50' : q.userAnswer === oIdx ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-white'} ${q.showResult ? 'cursor-default' : 'cursor-pointer'}`}>{opt}{q.showResult && oIdx === q.correct && ' ✓'}{q.showResult && q.userAnswer === oIdx && oIdx !== q.correct && ' ✗'}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Generating quiz questions...</p>
                  )}
                </div>
              )}
              {activeTab === 'chat' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Ask Questions</h2>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                      {chatMessages.length === 0 ? (
                        <p className="text-gray-500 text-center">Ask any question about the video content!</p>
                      ) : (
                        chatMessages.map((msg, idx) => (
                          <div key={idx} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white ml-12' : 'bg-white text-gray-800 mr-12 border border-gray-200 whitespace-pre-wrap'}`}>{msg.content}</div>
                        ))
                      )}
                      {chatLoading && (
                        <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg mr-12">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span className="text-gray-600">Thinking...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 p-4 bg-white border-t-2 border-gray-200">
                      <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !chatLoading && handleChat()} placeholder="Type your question..." className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" disabled={chatLoading} />
                      <button onClick={handleChat} disabled={chatLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
      </div>
    </div>
  );
}
