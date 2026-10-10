import React, { useState, useEffect, useMemo } from 'react';
import { useVocab } from '../context/VocabContext';
import { wordsApi } from '../api';
import { speakWord } from '../utils/speech';
import { SpeakerButton } from '../components/SpeakerButton';
import { CheckCircle2, RotateCcw, Sparkles, BookOpen, ArrowRight, ArrowLeft, HelpCircle, Trophy, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SCORE_LABELS = [
  { score: 0, label: 'Blackout', desc: 'Complete blank' },
  { score: 1, label: 'Wrong', desc: 'Incorrect recall' },
  { score: 2, label: 'Hard', desc: 'Recalled with strain' },
  { score: 3, label: 'Good', desc: 'Correct after hesitation' },
  { score: 4, label: 'Easy', desc: 'Prompt recall' },
  { score: 5, label: 'Perfect', desc: 'Instant & effortless' },
];

export const ReviewPage = () => {
  const navigate = useNavigate();
  const { dueWords, loading, error, refreshDueWords, notifyChange } = useVocab();
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [sessionCompletedCount, setSessionCompletedCount] = useState(0);
  const [sessionScores, setSessionScores] = useState([]);

  // Available languages across due words
  const availableLanguages = useMemo(() => {
    const langs = new Set();
    dueWords.forEach((w) => {
      if (w.language) langs.add(w.language);
    });
    return Array.from(langs);
  }, [dueWords]);

  // Active queue filtered by selected language deck
  const activeQueue = useMemo(() => {
    if (selectedLanguage === 'ALL') return dueWords;
    return dueWords.filter((w) => w.language === selectedLanguage);
  }, [dueWords, selectedLanguage]);

  // Reset index when queue changes
  useEffect(() => {
    if (currentIndex >= activeQueue.length) {
      setCurrentIndex(0);
    }
  }, [activeQueue.length, currentIndex]);

  const currentWord = activeQueue[currentIndex];

  const handleScore = async (score) => {
    if (!currentWord || submitting) return;
    setSubmitting(true);
    try {
      const result = await wordsApi.reviewWord(currentWord.id, score);
      setLastFeedback({
        word: currentWord.word,
        score,
        nextInterval: result.new_interval,
      });

      setSessionCompletedCount((prev) => prev + 1);
      setSessionScores((prev) => [...prev, score]);

      // Refresh due words list and global state
      await refreshDueWords();
      notifyChange();
      setShowDefinition(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard shortcuts: Space reveals, 0-5 scores, P pronounces, Esc exits
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setShowDefinition((prev) => !prev);
      } else if (showDefinition && !submitting && ['0', '1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        handleScore(parseInt(e.key, 10));
      } else if ((e.key === 'p' || e.key === 'P') && currentWord) {
        e.preventDefault();
        speakWord(currentWord.word, currentWord.language);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDefinition, submitting, currentWord, navigate]);

  if (loading && dueWords.length === 0) {
    return (
      <div className="empty-state animate-fade-in" id="review-loading">
        <div className="empty-icon">
          <BookOpen size={32} />
        </div>
        <h2>Loading review session...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Fetching due flashcards from your deck.</p>
      </div>
    );
  }

  if (error && dueWords.length === 0) {
    return (
      <div className="glass-card animate-fade-in" style={{ maxWidth: 600, margin: '2rem auto' }}>
        <div className="alert alert-error">
          <span>Failed to load due words: {error}</span>
        </div>
        <button className="btn btn-primary" onClick={refreshDueWords} id="btn-retry-reviews">
          <RotateCcw size={18} /> Retry Connection
        </button>
      </div>
    );
  }

  // End of session / caught up state
  if (activeQueue.length === 0) {
    const sessionAccuracy =
      sessionScores.length > 0
        ? Math.round((sessionScores.filter((s) => s >= 3).length / sessionScores.length) * 100)
        : null;

    return (
      <div className="empty-state animate-fade-in" id="review-complete-state" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="empty-icon" style={{ background: 'var(--success-glow)', color: 'var(--success)', width: 72, height: 72 }}>
          <Trophy size={42} />
        </div>
        <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>
          {sessionCompletedCount > 0 ? 'Session Complete!' : "You're All Caught Up!"}
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 450, margin: '0.5rem auto 1.5rem', lineHeight: 1.5 }}>
          {sessionCompletedCount > 0
            ? `Fantastic effort! You just strengthened retention for ${sessionCompletedCount} vocabulary card${sessionCompletedCount === 1 ? '' : 's'}.`
            : 'No cards are currently due for review. Great work staying on top of your spaced repetition schedule!'}
        </p>

        {/* Session Recap Box */}
        {sessionCompletedCount > 0 && sessionAccuracy !== null && (
          <div
            className="glass-card"
            style={{
              padding: '1.25rem 2rem',
              marginBottom: '1.75rem',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Cards Reviewed
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                {sessionCompletedCount}
              </div>
            </div>
            <div style={{ height: 40, width: 1, background: 'var(--border-subtle)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Session Accuracy
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: sessionAccuracy >= 70 ? 'var(--success)' : 'var(--warning)',
                }}
              >
                {sessionAccuracy}%
              </div>
            </div>
          </div>
        )}

        {lastFeedback && (
          <div className="alert alert-success" style={{ maxWidth: 450, margin: '0 auto 1.5rem', width: '100%' }}>
            Last Card: <strong>"{lastFeedback.word}"</strong> (Score {lastFeedback.score}) &rarr; Next review in {lastFeedback.nextInterval} day{lastFeedback.nextInterval === 1 ? '' : 's'}.
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {selectedLanguage !== 'ALL' && dueWords.length > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setSelectedLanguage('ALL')}
            >
              Review Other Decks ({dueWords.length} due)
            </button>
          )}
          <Link to="/" className="btn btn-secondary" id="btn-return-dashboard">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <Link to="/progress" className="btn btn-secondary" id="btn-view-analytics">
            <BarChart2 size={16} /> View Retention Analytics
          </Link>
          <Link to="/add" className="btn btn-primary" id="btn-empty-add">
            <Sparkles size={16} /> Add More Words
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / activeQueue.length) * 100);

  return (
    <div className="animate-fade-in" id="review-container">
      {/* Review Session Header with Pause / Exit button */}
      <div
        style={{
          maxWidth: 650,
          margin: '0 auto 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Link
          to="/"
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          id="btn-pause-session"
          title="Pause session and return to Dashboard (Esc)"
        >
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Card {currentIndex + 1} of {activeQueue.length}
          </span>
          <div style={{ width: 140, height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary), var(--accent-violet))',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Language Deck Switcher if multiple languages are due */}
      {availableLanguages.length > 1 && (
        <div style={{ maxWidth: 650, margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Deck Filter:
          </span>
          <button
            type="button"
            className={`filter-tab ${selectedLanguage === 'ALL' ? 'active' : ''}`}
            onClick={() => {
              setSelectedLanguage('ALL');
              setCurrentIndex(0);
              setShowDefinition(false);
            }}
          >
            All Languages ({dueWords.length})
          </button>
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              className={`filter-tab ${selectedLanguage === lang ? 'active' : ''}`}
              onClick={() => {
                setSelectedLanguage(lang);
                setCurrentIndex(0);
                setShowDefinition(false);
              }}
            >
              {lang} ({dueWords.filter((w) => w.language === lang).length})
            </button>
          ))}
        </div>
      )}

      {/* Main Flashcard */}
      <div className="glass-card flashcard" id="active-flashcard">
        <div>
          <div className="flashcard-header">
            <span className="word-lang-pill" id="card-language">
              {currentWord.language}
            </span>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <span>Rep: {currentWord.repetition}</span>
              <span>EF: {currentWord.easiness_factor.toFixed(2)}</span>
              <span>Int: {currentWord.interval}d</span>
            </div>
          </div>

          {/* Word term + Pronunciation Audio button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', margin: '0.75rem 0' }}>
            <h1 className="word-term" id="card-word" style={{ margin: 0 }}>
              {currentWord.word}
            </h1>
            <SpeakerButton
              word={currentWord.word}
              language={currentWord.language}
              size={22}
              buttonId="btn-speak-active-word"
            />
          </div>

          {showDefinition ? (
            <div className="definition-box" id="card-definition-box">
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>
                Definition & Meaning
              </div>
              <p className="definition-text" id="card-definition">
                {currentWord.translation || currentWord.definition}
              </p>
            </div>
          ) : (
            <div style={{ margin: '3.5rem 0' }}>
              <button
                type="button"
                className="btn btn-secondary"
                id="btn-show-definition"
                onClick={() => setShowDefinition(true)}
                style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
              >
                <BookOpen size={20} /> Show Definition <span style={{ opacity: 0.6, fontSize: '0.8rem', marginLeft: 4 }}>(Space)</span>
              </button>
            </div>
          )}
        </div>

        {/* Rating buttons shown once definition is revealed */}
        <div>
          {showDefinition ? (
            <div className="animate-fade-in" id="score-selection-area">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.6rem',
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                <span>Rate recall honestly (Keys 0 - 5):</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  0-2 = Relearn • 3-5 = Advance
                </span>
              </div>
              <div className="score-buttons-grid">
                {SCORE_LABELS.map(({ score, label, desc }) => (
                  <button
                    key={score}
                    type="button"
                    id={`btn-score-${score}`}
                    className={`score-btn s-${score}`}
                    disabled={submitting}
                    onClick={() => handleScore(score)}
                    title={desc}
                  >
                    <span className="score-num">{score}</span>
                    <span className="score-label">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                color: 'var(--text-dim)',
                background: 'rgba(255,255,255,0.02)',
                padding: '0.4rem 0.85rem',
                borderRadius: 999,
              }}
            >
              <HelpCircle size={14} />
              <span>Recall translation first, or press <kbd style={{ padding: '0.1rem 0.4rem', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>P</kbd> to listen</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Keyboard Legend */}
      <div className="shortcuts-legend">
        <span className="shortcut-item">
          <kbd className="kbd-badge">Space</kbd> Flip Card
        </span>
        <span className="shortcut-item">
          <kbd className="kbd-badge">P</kbd> Pronounce
        </span>
        <span className="shortcut-item">
          <kbd className="kbd-badge">0–5</kbd> Grade Recall
        </span>
        <span className="shortcut-item">
          <kbd className="kbd-badge">Esc</kbd> Exit Session
        </span>
      </div>
    </div>
  );
};

export default ReviewPage;
