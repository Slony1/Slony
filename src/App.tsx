import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, BookOpen, Calendar, Info, Loader2, RefreshCw, ChevronRight, Zap } from 'lucide-react';
import { getWordOfTheDay, getPronunciationAudio } from './services/geminiService';
import { WordOfDay, DailyState } from './types';

export default function App() {
  const [state, setState] = useState<DailyState>({
    wordData: null,
    loading: true,
    error: null,
    audioUrl: null,
  });
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const fetchDailyWord = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const wordData = await getWordOfTheDay(today);
      const audioUrl = await getPronunciationAudio(wordData.word, wordData.phonetic);
      setState({
        wordData,
        loading: false,
        error: null,
        audioUrl,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'System error: Failed to sync with Lumira database.',
      }));
    }
  };

  useEffect(() => {
    fetchDailyWord();
  }, []);

  const playAudio = () => {
    if (state.audioUrl && !isAudioPlaying) {
      if (!audioRef.current) {
        audioRef.current = new Audio(state.audioUrl);
        audioRef.current.onended = () => setIsAudioPlaying(false);
      }
      setIsAudioPlaying(true);
      audioRef.current.play();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] font-mono selection:bg-red-900/30">
      {/* Background Glitch Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px)] bg-[size:100%_4px]"></div>
      </div>

      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center border-b border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              {/* Placeholder for Lumira Logo */}
              <img 
                src="https://picsum.photos/seed/cyberpunk/200/200" 
                alt="Lumira Logo" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-black animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Lumira Lexicon</h1>
            <p className="text-[10px] text-red-500 font-bold tracking-[0.2em] uppercase">Xyber Guardian System</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-neutral-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            System Online
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-red-600" />
            {today}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-24 relative z-10">
        <AnimatePresence mode="wait">
          {state.loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-6"
            >
              <div className="relative">
                <Loader2 className="animate-spin text-red-600" size={64} />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={24} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-red-500 font-bold tracking-[0.3em] uppercase text-sm">Initializing Sync</p>
                <p className="text-neutral-500 text-xs">Accessing Lumira's neural linguistic core...</p>
              </div>
            </motion.div>
          ) : state.error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-950/20 border border-red-900/50 p-12 rounded-3xl text-center backdrop-blur-sm"
            >
              <p className="text-red-500 font-bold mb-6 tracking-widest uppercase">{state.error}</p>
              <button
                onClick={fetchDailyWord}
                className="flex items-center gap-2 mx-auto px-8 py-3 bg-red-600 text-white font-bold rounded-none hover:bg-red-700 transition-all uppercase tracking-tighter skew-x-[-12deg]"
              >
                <RefreshCw size={18} className="skew-x-[12deg]" />
                <span className="skew-x-[12deg]">Re-establish Link</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid lg:grid-cols-[1fr_400px] gap-12 items-start"
            >
              {/* Left Column: Word & Meaning */}
              <div className="space-y-12">
                <section className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-red-500 font-bold text-xs uppercase tracking-[0.4em]">
                      <div className="w-8 h-[1px] bg-red-500"></div>
                      Today's Transmission
                    </div>
                    <div className="flex flex-wrap items-end gap-6">
                      <h2 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic text-white leading-none">
                        {state.wordData?.word}
                      </h2>
                      <div className="flex items-center gap-4 pb-2">
                        <span className="text-xl md:text-2xl text-red-600 font-bold italic opacity-70">
                          [{state.wordData?.phonetic}]
                        </span>
                        {state.audioUrl && (
                          <button
                            onClick={playAudio}
                            disabled={isAudioPlaying}
                            className={`p-4 rounded-none border border-red-600/30 hover:bg-red-600 hover:text-white transition-all group skew-x-[-12deg] ${isAudioPlaying ? 'bg-red-600 text-white' : ''}`}
                          >
                            <Volume2 
                              size={24} 
                              className={`skew-x-[12deg] ${isAudioPlaying ? 'animate-pulse' : ''}`} 
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="inline-block px-4 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] skew-x-[-12deg]">
                    <span className="inline-block skew-x-[12deg]">{state.wordData?.partOfSpeech}</span>
                  </div>
                </section>

                <section className="space-y-6 relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-red-600 to-transparent"></div>
                  <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest">
                    <BookOpen size={16} />
                    Neural Definition
                  </div>
                  <p className="text-2xl md:text-4xl leading-tight text-white font-bold tracking-tight">
                    {state.wordData?.meaning}
                  </p>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest">
                    <ChevronRight size={16} />
                    Contextual Application
                  </div>
                  <div className="bg-white/5 p-8 border-l-4 border-red-600 italic text-lg md:text-xl text-neutral-300 leading-relaxed">
                    "{state.wordData?.example}"
                  </div>
                </section>
              </div>

              {/* Right Column: Etymology & System Info */}
              <aside className="space-y-8">
                {state.wordData?.etymology && (
                  <section className="bg-red-950/10 p-8 border border-white/5 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 rotate-45 translate-x-8 -translate-y-8"></div>
                    <div className="flex items-center gap-2 text-neutral-500 font-bold text-xs uppercase tracking-widest">
                      <Info size={16} className="text-red-600" />
                      Linguistic Origin
                    </div>
                    <p className="text-neutral-400 text-sm leading-relaxed font-medium">
                      {state.wordData.etymology}
                    </p>
                  </section>
                )}

                <div className="p-8 border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Guardian Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-neutral-500">Neural Link</span>
                      <span className="text-green-500">STABLE</span>
                    </div>
                    <div className="w-full h-1 bg-white/5">
                      <div className="w-3/4 h-full bg-red-600"></div>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-neutral-500">Sync Rate</span>
                      <span className="text-red-500">98.4%</span>
                    </div>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-neutral-600 text-[10px] font-bold uppercase tracking-[0.2em] border-t border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <span className="text-red-600">Lumira Lexicon v2.0</span>
          <span className="w-1 h-1 bg-neutral-800 rounded-full"></span>
          <span>Xyber Guardian Protocol</span>
        </div>
        <div className="text-center md:text-right">
          <p>© 2026 Neural Network. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
