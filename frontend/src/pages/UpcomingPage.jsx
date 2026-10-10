import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { wordsApi } from '../api';
import { useVocab } from '../context/VocabContext';
import { Calendar, Trash2, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Languages } from 'lucide-react';
import { SpeakerButton } from '../components/SpeakerButton';
import { MemoryBattery } from '../components/MemoryBattery';

const PAGE_SIZE = 15;

export const UpcomingPage = () => {
  const { notifyChange } = useVocab();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('ALL');

  const fetchUpcoming = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wordsApi.getUpcomingWords(PAGE_SIZE, offset);
      setWords(data);
    } catch (err) {
      console.error('Failed to load upcoming words:', err);
      setError(err.message || 'Failed to load upcoming words');
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  const handleDelete = async (wordId, wordTerm) => {
    if (!window.confirm(`Are you sure you want to delete "${wordTerm}"? This will remove all its review history.`)) {
      return;
    }

    setDeletingId(wordId);
    try {
      await wordsApi.deleteWord(wordId);
      // Remove from state
      setWords((prev) => prev.filter((w) => w.id !== wordId));
      notifyChange();
    } catch (err) {
      alert(`Could not delete word: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Distinct languages in the current set
  const availableLanguages = useMemo(() => {
    const langs = new Set();
    words.forEach((w) => {
      if (w.language) langs.add(w.language);
    });
    return Array.from(langs);
  }, [words]);

  // Filter words if a language tab is selected
  const filteredWords = useMemo(() => {
    if (selectedLanguageFilter === 'ALL') return words;
    return words.filter((w) => w.language === selectedLanguageFilter);
  }, [words, selectedLanguageFilter]);

  // Group words by day
  const groupWordsByDay = (wordList) => {
    const groups = {};
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    wordList.forEach((word) => {
      const reviewDate = new Date(word.next_review);
      const dayKey = reviewDate.toISOString().split('T')[0];

      let label = dayKey;
      if (dayKey === todayStr) {
        label = 'Today';
      } else {
        const diffDays = Math.ceil((reviewDate - now) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          label = 'Tomorrow';
        } else if (diffDays > 1 && diffDays <= 7) {
          label = `In ${diffDays} days (${reviewDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })})`;
        } else {
          label = reviewDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(word);
    });

    return groups;
  };

  const grouped = groupWordsByDay(filteredWords);

  return (
    <div className="animate-fade-in" id="upcoming-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Upcoming Reviews</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Schedule breakdown of future SRS retention cycles grouped by date.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchUpcoming}
          disabled={loading}
          id="btn-refresh-upcoming"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Language Separation Tabs */}
      {availableLanguages.length > 1 && (
        <div className="language-filter-bar" id="upcoming-language-filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 700, marginRight: '0.5rem' }}>
            <Languages size={15} />
            <span>Language Deck:</span>
          </div>
          <button
            type="button"
            className={`filter-tab ${selectedLanguageFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedLanguageFilter('ALL')}
            id="tab-lang-all"
          >
            All Decks ({words.length})
          </button>
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              className={`filter-tab ${selectedLanguageFilter === lang ? 'active' : ''}`}
              onClick={() => setSelectedLanguageFilter(lang)}
              id={`tab-lang-${lang.toLowerCase()}`}
            >
              {lang} ({words.filter((w) => w.language === lang).length})
            </button>
          ))}
        </div>
      )}

      {loading && words.length === 0 ? (
        <div className="empty-state">
          <Calendar size={32} />
          <h3>Loading upcoming schedule...</h3>
        </div>
      ) : words.length === 0 ? (
        <div className="glass-card empty-state">
          <Calendar size={48} style={{ opacity: 0.4 }} />
          <h3>No Words Scheduled</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            You haven't scheduled any words or all words are already due in your review queue.
          </p>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="glass-card empty-state">
          <Languages size={48} style={{ opacity: 0.4 }} />
          <h3>No upcoming cards for {selectedLanguageFilter}</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            No upcoming cards in this specific language filter on this page.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSelectedLanguageFilter('ALL')}
          >
            Show All Languages
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(grouped).map(([dayLabel, dayWords]) => (
            <div key={dayLabel} className="glass-card" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{dayLabel}</h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: 'rgba(255,255,255,0.08)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 999,
                    color: 'var(--text-muted)',
                  }}
                >
                  {dayWords.length} card{dayWords.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Word</th>
                      <th>Language</th>
                      <th>Translation</th>
                      <th>Repetition</th>
                      <th>Interval</th>
                      <th>Ease Factor</th>
                      <th>Memory Health</th>
                      <th>Next Review Time</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayWords.map((w) => (
                      <tr key={w.id} id={`upcoming-row-${w.id}`}>
                        <td style={{ fontWeight: 700, color: '#fff' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span>{w.word}</span>
                            <SpeakerButton word={w.word} language={w.language} size={14} />
                          </div>
                        </td>
                        <td>
                          <span className="word-lang-pill" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                            {w.language}
                          </span>
                        </td>
                        <td style={{ maxWidth: 260, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={w.translation || w.definition}>
                          {w.translation || w.definition}
                        </td>
                        <td>{w.repetition}</td>
                        <td>{w.interval} day{w.interval === 1 ? '' : 's'}</td>
                        <td>{w.easiness_factor.toFixed(2)}</td>
                        <td>
                          <MemoryBattery word={w} compact={true} />
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(w.next_review).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-danger"
                            id={`btn-delete-word-${w.id}`}
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                            disabled={deletingId === w.id}
                            onClick={() => handleDelete(w.id, w.word)}
                            title="Delete word"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Showing {offset + 1} to {offset + words.length}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                id="btn-prev-page"
                disabled={offset === 0 || loading}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                className="btn btn-secondary"
                id="btn-next-page"
                disabled={words.length < PAGE_SIZE || loading}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingPage;
