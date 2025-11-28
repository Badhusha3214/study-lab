import React, { useEffect, useRef } from 'react';
import { Youtube, Sparkles, ArrowRight, BookOpen, Users, GraduationCap, Play, Briefcase, Library, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const revealContainer = useRef(null);
  const navigate = useNavigate();

  const handleOpenSignUp = () => {
    navigate('/register');
  };

  useEffect(() => {
    const els = revealContainer.current?.querySelectorAll('[data-reveal]');
    if (!els || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
      {/* Animated Background Layers */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 animate-shimmer bg-gradient-move" />
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-0 -right-24 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-20 animate-float" />
      
      <div ref={revealContainer} className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Hero Content */}
          <div data-reveal className="relative z-10 opacity-0 translate-y-8 transition-all duration-700">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Transform Any Content Into
              <br />
              <span className="mt-2 flex items-baseline gap-2">
                <span className="relative">
                  <span className="relative z-10 text-indigo-300">
                    Interactive Learning
                  </span>
                </span>
              </span>
            </h1>
            <p className="mb-8 max-w-lg text-lg text-white/80">
              Turn YouTube videos, blog articles, and PDFs into structured study sessions. Get AI-powered summaries, auto-generated quizzes, and interactive Q&A—all in one platform.
            </p>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
              <button
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/50"
                onClick={handleOpenSignUp}
              >
                Start Learning Free
              </button>
              <Link
                to="/multi"
                className="rounded-lg border border-indigo-300/30 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500/20 text-center"
              >
                Try Multi-Source
              </Link>
            </div>
            <div className="flex flex-col gap-6 text-white/80 sm:flex-row">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <span className="text-sm">AI-Powered Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                <span className="text-sm">Multi-Source Support</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Save Your Progress</span>
              </div>
            </div>
          </div>

          {/* Right Column - Floating Cards */}
          <div data-reveal className="relative h-[500px] opacity-0 translate-y-8 transition-all duration-700 delay-150">
            {/* Floating Card 1 - Video Support */}
            <div className="absolute left-0 top-8 z-20 animate-float">
              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-lg border border-white/20 shadow-xl">
                <div className="rounded-full bg-red-100 p-3">
                  <Youtube className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-white">YouTube</div>
                  <div className="text-sm text-white/70">Video Learning</div>
                </div>
              </div>
            </div>

            {/* Floating Card 2 - Multi-Source */}
            <div className="absolute right-0 top-32 z-20 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-lg border border-white/20 shadow-xl">
                <div className="rounded-full bg-indigo-100 p-3">
                  <Library className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="font-semibold text-white">Multi-Source</div>
                  <div className="text-sm text-white/70">Blogs + PDFs + Videos</div>
                </div>
              </div>
            </div>

            {/* Floating Card 3 - AI Powered */}
            <div className="absolute bottom-20 left-8 z-20 animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-lg border border-white/20 shadow-xl">
                <div className="rounded-full bg-purple-100 p-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-white">AI-Powered</div>
                  <div className="text-sm text-white/70">Smart Summaries & Quizzes</div>
                </div>
              </div>
            </div>

            {/* Center Hero Image Placeholder */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <img
                src="/olabsboy.svg"
                alt="Student learning"
                className="w-80 h-80 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div data-reveal className="opacity-0 translate-y-8 transition-all duration-700 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
            <Sparkles className="w-10 h-10 text-indigo-300 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI Summaries</h3>
            <p className="text-white/70">Extract key concepts from videos, blogs, and PDFs with Gemini 2.5 Flash AI for instant comprehension.</p>
          </div>
          <div data-reveal className="opacity-0 translate-y-8 transition-all duration-700 delay-100 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
            <BookOpen className="w-10 h-10 text-purple-300 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Auto-Generated Quizzes</h3>
            <p className="text-white/70">Test your knowledge with intelligent multiple-choice questions created from your learning materials.</p>
          </div>
          <div data-reveal className="opacity-0 translate-y-8 transition-all duration-700 delay-200 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
            <Users className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Save Your Progress</h3>
            <p className="text-white/70">Create an account to save your study sessions, quizzes, and summaries for future reference.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
