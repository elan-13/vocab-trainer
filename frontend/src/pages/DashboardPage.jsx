import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVocab } from '../context/VocabContext';
import { wordsApi } from '../api';
import { STARTER_DECKS } from '../data/starterDecks';
import {
  Zap,
  BookOpen,
  PlusCircle,
  Calendar,
  BarChart2,
  CheckCircle2,
  Flame,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles,
  BrainCircuit,
  Eye,
  Award,
  Download,
  Loader2,
  Languages
} from 'lucide-react';
import { SpeakerButton } from '../components/SpeakerButton';

const LANGUAGE_FLAGS = {
  Spanish: '🇪🇸',
  French: '🇫🇷',
  German: '🇩🇪',
  Japanese: '🇯🇵',
  Italian: '🇮🇹',
  Russian: '🇷🇺',
  Mandarin: '🇨🇳',
  English: '🇬🇧',
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { dueWords, dueCount, loading, notifyChange } = useVocab();
  const [stats, setStats] = useState({ accuracy: 0, streak: 0, totalReviews: 0, totalWords: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [importingLang, setImportingLang] = useState(null);
  const [importToast, setImportToast] = useState(null);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [historyData, upcomingData] = await Promise.all([
          wordsApi.getHistory(50, 0),
          wordsApi.getUpcomingWords(100, 0),
        ]);

        setStats({
          accuracy: historyData.accuracy || 0,
          streak: historyData.streak || 0,
          totalReviews: historyData.recent_reviews ? historyData.recent_reviews.length : 0,
          totalWords: (upcomingData ? upcomingData.length : 0) + (dueWords ? dueWords.length : 0),
        });
      } catch (err) {
        console.error('Failed to load dashboard overview stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadOverviewData();
  }, [dueWords]);

  const handleImportLanguage = async (language) => {
    const deck = STARTER_DECKS[language];
    if (!deck || importingLang) return;

    setImportingLang(language);
    setImportToast(null);
    let imported = 0;
    let duplicates = 0;

    try {
      for (const item of deck) {
        try {
          await wordsApi.createWord({
            word: item.word,
            language: language,
            translation: item.translation,
          });
          imported += 1;
        } catch (err) {
          if (err.status === 409 || err.code === 'DUPLICATE_WORD') {
            duplicates += 1;
          }
        }
      }

      notifyChange();

      setImportToast({
        language,
        imported,
        duplicates,
      });

      // Clear toast after 6 seconds
      setTimeout(() => {
        setImportToast((prev) => (prev?.language === language ? null : prev));
      }, 6000);
    } catch (err) {
      alert(`Could not import starter deck for ${language}: ${err.message}`);
    } finally {
      setImportingLang(null);
    }
  };

  const estimatedMinutes = Math.max(1, Math.ceil(dueCount * 0.5));

  return (
    <div className="animate-fade-in" id="dashboard-container" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Toast Alert for Default Deck Import */}
      {importToast && (
        <div className="alert alert-success animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            Imported <strong>{importToast.imported} starter words</strong> for {importToast.language}!{' '}
            {importToast.duplicates > 0 && <span>({importToast.duplicates} were already in your deck).</span>}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            onClick={() => navigate('/review')}
          >
            Review Now ({dueCount}) <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(18, 24, 38, 0.9) 0%, rgba(30, 27, 75, 0.4) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 650 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 999,
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            <BrainCircuit size={14} /> Spaced Repetition Mastery
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.85rem', color: '#fff' }}>
            Retain Vocabulary Permanently.
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.8rem' }}>
            Welcome! Instead of stressful cramming, SRS schedules each word for review right before you are about to forget it.
            Grade your recall honestly, and the algorithm adapts automatically.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {dueCount > 0 ? (
              <button
                type="button"
                className="btn btn-primary"
                id="btn-hero-start-review"
                style={{ padding: '0.9rem 1.8rem', fontSize: '1.05rem' }}
                onClick={() => navigate('/review')}
              >
                <BookOpen size={20} />
                <span>Start Review Session ({dueCount} Due)</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                id="btn-hero-add-word"
                style={{ padding: '0.9rem 1.8rem', fontSize: '1.05rem' }}
                onClick={() => navigate('/add')}
              >
                <PlusCircle size={20} />
                <span>Add Your First Words</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              id="btn-hero-add-secondary"
              onClick={() => navigate('/add')}
            >
              <PlusCircle size={18} /> Add Word
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div
          style={{
            position: 'absolute',
            right: -60,
            bottom: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Primary Status & Action Card */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2.5rem',
          padding: '1.75rem 2rem',
          borderLeft: dueCount > 0 ? '4px solid #f43f5e' : '4px solid var(--success)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: dueCount > 0 ? 'rgba(244, 63, 94, 0.15)' : 'var(--success-glow)',
              color: dueCount > 0 ? '#f43f5e' : 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {dueCount > 0 ? <Zap size={28} /> : <CheckCircle2 size={28} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: '#fff' }}>
              {dueCount > 0
                ? `You have ${dueCount} flashcard${dueCount === 1 ? '' : 's'} ready for review`
                : "You're all caught up on reviews today!"}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {dueCount > 0
                ? `Estimated session time: ~${estimatedMinutes} minute${estimatedMinutes === 1 ? '' : 's'}. Regular reviews strengthen neural retention.`
                : 'Great job maintaining your schedule. Add new words or check your upcoming reviews below.'}
            </p>
          </div>
        </div>

        <div>
          {dueCount > 0 ? (
            <Link to="/review" className="btn btn-primary" id="btn-status-review">
              Review Now ({dueCount}) <ArrowRight size={16} />
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/add" className="btn btn-secondary">
                <PlusCircle size={16} /> Add Word
              </Link>
              <Link to="/upcoming" className="btn btn-secondary">
                <Calendar size={16} /> View Schedule
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Snapshot Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card" id="dashboard-stat-due">
          <div className="stat-label">Due Today</div>
          <div className="stat-value" style={{ color: dueCount > 0 ? '#f43f5e' : 'var(--success)' }}>
            {dueCount}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {dueCount > 0 ? 'Pending your review' : 'Zero backlog'}
          </span>
        </div>

        <div className="stat-card" id="dashboard-stat-streak">
          <div className="stat-label">Daily Streak</div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
            <Flame size={28} /> {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Consecutive practice days
          </span>
        </div>

        <div className="stat-card" id="dashboard-stat-accuracy">
          <div className="stat-label">Overall Accuracy</div>
          <div className="stat-value" style={{ color: stats.accuracy >= 70 ? 'var(--success)' : 'var(--warning)' }}>
            {stats.accuracy}%
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Successful recall rate (Score ≥ 3)
          </span>
        </div>

        <div className="stat-card" id="dashboard-stat-words">
          <div className="stat-label">Total Vocabulary</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {stats.totalWords}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Words managed by SRS
          </span>
        </div>
      </div>

      {/* FEATURE: Quick Default Import by Language */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Download size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>One-Click Starter Decks</h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Click any language below to import a curated set of 8–10 essential vocabulary cards instantly:
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
          {Object.entries(STARTER_DECKS).map(([lang, wordsList]) => {
            const flag = LANGUAGE_FLAGS[lang] || '🌐';
            const isImporting = importingLang === lang;
            return (
              <div
                key={lang}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{flag}</span>
                    <strong style={{ fontSize: '1rem', color: '#fff' }}>{lang}</strong>
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {wordsList.length} high-frequency cards
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderColor: 'rgba(255,255,255,0.1)' }}
                  disabled={importingLang !== null}
                  onClick={() => handleImportLanguage(lang)}
                  id={`btn-import-dashboard-${lang.toLowerCase()}`}
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Importing...
                    </>
                  ) : (
                    <>
                      <Download size={13} /> Import Default Deck
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* How Spaced Repetition Works - Step by Step Beginner Guide */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <HelpCircle size={22} style={{ color: 'var(--primary)' }} />
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#fff' }}>How It Works in 3 Simple Steps</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No guesswork. Scientific memory pacing adapted to your learning speed.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {/* Step 1 */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>See the Word</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              A flashcard appears showing the target vocabulary term. Before revealing the answer, actively test your recall in your mind.
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.15)',
                color: 'var(--accent-violet)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>Flip the Card</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Click <strong>"Show Definition"</strong> (or press <kbd style={{ padding: '0.1rem 0.4rem', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>Space</kbd>)
              to inspect the true translation and notes.
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>Rate Recall (0–5)</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              • <strong>0–2 (Struggled):</strong> Card repeats today/tomorrow.<br />
              • <strong>3–5 (Remembered):</strong> Next review jumps into the future (5 days, 12 days, months).
            </p>
          </div>
        </div>
      </div>

      {/* Due Words Queue Preview (if any due) */}
      {dueWords.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Cards Waiting in Today's Queue</h3>
            </div>
            <Link to="/review" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Start Session &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {dueWords.slice(0, 8).map((word) => (
              <div
                key={word.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontWeight: 700, color: '#fff' }}>{word.word}</span>
                <span className="word-lang-pill" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                  {word.language}
                </span>
                <SpeakerButton word={word.word} language={word.language} size={14} />
              </div>
            ))}
            {dueWords.length > 8 && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 1rem',
                  color: 'var(--text-dim)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                +{dueWords.length - 8} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
