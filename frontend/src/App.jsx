import React, { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import ResultCard from './components/ResultCard';
import LanguageSelector from './components/LanguageSelector';
import PaywallModal from './components/PaywallModal';
import { TRANSLATIONS, getLanguageName } from './constants/languages';
import { analyzeText } from './utils/analysis';
import { isPro as getInitialPro, PRO_STATUS_CHANGED_EVENT } from './utils/usageTracker';
import { PrivacyPolicy, TermsOfService, RefundPolicy } from './components/LegalDocs';
import { FaLinkedin, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';

function App() {
  const [transcription, setTranscription] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [currentLang, setCurrentLang] = useState('EN');
  const [activeView, setActiveView] = useState('main'); // 'main', 'privacy', 'terms', 'refund'
  const [showToast, setShowToast] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPro, setIsPro] = useState(getInitialPro());

  // Reactive Pro Status
  React.useEffect(() => {
    const handleProChange = (e) => {
      setIsPro(e.detail.isPro);
    };
    window.addEventListener(PRO_STATUS_CHANGED_EVENT, handleProChange);
    return () => window.removeEventListener(PRO_STATUS_CHANGED_EVENT, handleProChange);
  }, []);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.EN;

  const handleUploadSuccess = async (text) => {
    setTranscription(text);
    try {
      const analysisResult = analyzeText(text);
      setAnalysis(analysisResult);
    } catch (err) {
      console.error("Analysis failed", err);
    }
  };

  const handleReset = () => {
    setTranscription(null);
    setAnalysis(null);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GhostNote Pro',
          text: "I'm using GhostNote Pro to transmute my thoughts. Try it here:",
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="font-serif text-2xl font-bold tracking-tighter text-[#D4AF37]">
          GHOSTNOTE PRO
        </div>
        <div className="flex items-center space-x-8">
          <LanguageSelector
            currentLang={currentLang}
            onLanguageChange={setCurrentLang}
          />
          {/* Get Pro Button */}
          {!isPro && (
            <button
              onClick={() => setShowPaywall(true)}
              className="text-xs font-medium bg-[#A88E65] text-[#1A1A1A] px-4 py-2 rounded-full tracking-widest hover:bg-[#8F7650] transition-all"
            >
              GET PRO
            </button>
          )}
          {/* Version Badge */}
          <span className="text-xs font-medium opacity-50 border border-white/10 px-3 py-1 rounded-full tracking-widest">
            v1.0
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto flex-1 w-full px-6 py-12">

        {/* Hero Section */}
        {!transcription && (
          <section className="text-center mb-24 fade-in">
            <h1 className="font-serif text-5xl md:text-7xl mb-6 tracking-tight leading-tight">
              Turn Chaos Into <span className="italic text-[#D4AF37]">Strategy.</span>
            </h1>
            <p className="font-sans text-lg md:text-xl opacity-60 max-w-xl mx-auto mb-12 font-light">
              The private engine to transmute executive voice notes into a strategic suite.
            </p>

            {/* The Machine (AudioRecorder) */}
            <div className="luxury-glow rounded-3xl p-8 bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl">
              <AudioRecorder
                onUploadSuccess={handleUploadSuccess}
                t={t}
                languageName={getLanguageName(currentLang)}
                isPro={isPro}
              />
            </div>

            {/* Social Proof */}
            <div className="mt-24 opacity-40 text-sm tracking-[0.3em] uppercase flex flex-col items-center space-y-4">
              <span className="h-px w-12 bg-white/20"></span>
              <p>No typing. No hallucinations. Just your intent, crystallized.</p>
            </div>
          </section>
        )}

        {/* Results View */}
        {transcription && (
          <main className="space-y-12 fade-in">
            <ResultCard
              text={transcription}
              analysis={analysis}
              languageName={getLanguageName(currentLang)}
              onReset={handleReset}
              isPro={isPro}
            />
          </main>
        )}

      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-12 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">

          <div className="flex space-x-8 text-[11px] uppercase tracking-[0.2em] text-[#444]">
            <button onClick={() => setActiveView('privacy')} className="hover:text-[#D4AF37] transition-colors">Privacy</button>
            <button onClick={() => setActiveView('terms')} className="hover:text-[#D4AF37] transition-colors">Terms</button>
            <button onClick={() => setActiveView('refund')} className="hover:text-[#D4AF37] transition-colors">Refunds</button>
          </div>

          <div className="flex space-x-6 text-[#444]">
            <a href="#" className="hover:text-[#D4AF37] transition-colors"><FaLinkedin size={18} /></a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors"><FaXTwitter size={18} /></a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors"><FaWhatsapp size={18} /></a>
          </div>

          <button
            onClick={handleShare}
            className="text-[11px] uppercase tracking-widest text-[#444] hover:text-[#D4AF37] transition-colors"
          >
            {t.gift}
          </button>
        </div>
      </footer>

      {/* Legal Views */}
      {activeView === 'privacy' && <PrivacyPolicy onClose={() => setActiveView('main')} />}
      {activeView === 'terms' && <TermsOfService onClose={() => setActiveView('main')} />}
      {activeView === 'refund' && <RefundPolicy onClose={() => setActiveView('main')} />}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full text-xs font-bold shadow-2xl tracking-widest uppercase">
          Link copied to clipboard
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          scenario="upsell"
        />
      )}
    </div>
  );
}

export default App;
