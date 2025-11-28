import React, { useEffect, useRef } from 'react';
import { Sparkles, Info, Shield, Wrench, FileText, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const revealRef = useRef(null);

  useEffect(() => {
    const els = revealRef.current?.querySelectorAll('[data-reveal]');
    if (!els || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-6');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100" />
      <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-indigo-200 via-blue-300 to-cyan-300 animate-shimmer bg-gradient-move" />
      <div ref={revealRef} className="relative max-w-6xl mx-auto px-6 py-16 space-y-20">
        {/* Intro */}
        <section data-reveal className="opacity-0 translate-y-6 transition-all duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm shadow-sm border border-indigo-100 mb-5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-gray-700">Learn Faster • Retain More</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
            About StudyLab
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
            StudyLab transforms educational YouTube videos into interactive learning modules. We help learners quickly digest content, self‑test understanding, and explore deeper questions—all in one place.
          </p>
        </section>

        {/* Mission & Team */}
        <section data-reveal className="opacity-0 translate-y-6 transition-all duration-700">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-indigo-100">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-gray-800"><Users className="w-5 h-5 text-indigo-600" /> Mission</h2>
              <p className="text-gray-700 text-sm leading-relaxed">Our mission is to accelerate self‑learning by converting passive video watching into an active, adaptive study workflow. We believe quality education should be accessible, efficient, and engaging.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-indigo-100">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-gray-800"><Info className="w-5 h-5 text-indigo-600" /> What We Provide</h2>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2"><FileText className="w-4 h-4 text-indigo-500 mt-0.5" /> AI‑generated multi‑paragraph summaries</li>
                <li className="flex gap-2"><FileText className="w-4 h-4 text-indigo-500 mt-0.5" /> Multiple choice quizzes with scoring</li>
                <li className="flex gap-2"><FileText className="w-4 h-4 text-indigo-500 mt-0.5" /> Contextual Q&A chat referencing transcript</li>
                <li className="flex gap-2"><FileText className="w-4 h-4 text-indigo-500 mt-0.5" /> Video embedding for focused review</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section data-reveal className="opacity-0 translate-y-6 transition-all duration-700">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-indigo-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800"><Wrench className="w-6 h-6 text-indigo-600" /> Getting Started</h2>
            <ol className="space-y-4 text-gray-700">
              <li className="flex gap-3"><span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">1</span><span>Paste a valid YouTube URL on the Assistant page.</span></li>
              <li className="flex gap-3"><span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold">2</span><span>Generate transcript, summary, and quiz automatically.</span></li>
              <li className="flex gap-3"><span className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-600 text-white font-semibold">3</span><span>Use Q&A chat to clarify concepts from the video.</span></li>
              <li className="flex gap-3"><span className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-600 text-white font-semibold">4</span><span>Review mistakes, retry quiz, and reinforce learning.</span></li>
            </ol>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/main" className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg transition">
                Go to Assistant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg border-2 border-indigo-300 bg-white/70 backdrop-blur-sm text-indigo-700 font-medium hover:border-indigo-500 transition">
                View Docs
              </a>
            </div>
          </div>
        </section>

        {/* Environment & Privacy */}
        <section data-reveal className="opacity-0 translate-y-6 transition-all duration-700">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-indigo-100">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-800"><Wrench className="w-5 h-5 text-indigo-600" /> Environment Variables</h2>
              <p className="text-sm text-gray-700 leading-relaxed">Set <code className="px-1 py-0.5 bg-gray-100 rounded">REACT_APP_GEMINI_API_KEY</code> and <code className="px-1 py-0.5 bg-gray-100 rounded">REACT_APP_GROQ_API_KEY</code> in your <code>.env</code>. Restart the dev server after changes.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-indigo-100">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-800"><Shield className="w-5 h-5 text-indigo-600" /> Privacy & Security</h2>
              <p className="text-sm text-gray-700 leading-relaxed">API keys are exposed client‑side in development; for production use a server proxy to securely manage requests and apply rate limiting.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
