import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wordsApi } from '../api';
import { useVocab } from '../context/VocabContext';
import { getStarterDeck } from '../data/starterDecks';
import { PlusCircle, AlertCircle, CheckCircle, Sparkles, ArrowRight, Languages, Globe, Download, Loader2 } from 'lucide-react';

const PRESET_LANGUAGES = [
  { code: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
  { code: 'French', label: 'French', flag: '🇫🇷' },
  { code: 'German', label: 'German', flag: '🇩🇪' },
  { code: 'Japanese', label: 'Japanese', flag: '🇯🇵' },
  { code: 'Italian', label: 'Italian', flag: '🇮🇹' },
  { code: 'Russian', label: 'Russian', flag: '🇷🇺' },
  { code: 'Mandarin', label: 'Mandarin', flag: '🇨🇳' },
  { code: 'English', label: 'English', flag: '🇬🇧' },
];

export const AddWordPage = () => {
  const navigate = useNavigate();
  const { notifyChange } = useVocab();

  const [formData, setFormData] = useState({
    word: '',
    language: 'Spanish',
    definition: '',
  });

  const [customLanguage, setCustomLanguage] = useState('');
  const [isCustomLang, setIsCustomLang] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [successWord, setSuccessWord] = useState(null);
  const [importFeedback, setImportFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [importingDeck, setImportingDeck] = useState(false);

  const currentTargetLanguage = isCustomLang
    ? (customLanguage.trim() || 'Custom')
    : formData.language;

  const starterDeck = getStarterDeck(currentTargetLanguage);

  const validate = () => {
    const newErrors = {};
    const trimmedWord = formData.word.trim();
    const finalLang = (isCustomLang ? customLanguage : formData.language).trim();
    const trimmedDef = formData.definition.trim();

    if (!trimmedWord) {
      newErrors.word = 'Word term cannot be empty.';
    } else if (trimmedWord.length > 100) {
      newErrors.word = 'Word term must be 100 characters or fewer.';
    }

    if (!finalLang) {
      newErrors.language = 'Language cannot be empty.';
    } else if (finalLang.length > 50) {
      newErrors.language = 'Language must be 50 characters or fewer.';
    }

    if (!trimmedDef) {
      newErrors.definition = 'Translation / definition cannot be empty.';
    } else if (trimmedDef.length > 500) {
      newErrors.definition = 'Translation must be 500 characters or fewer.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectPreset = (lang) => {
    setIsCustomLang(false);
    setFormData({ ...formData, language: lang });
    setImportFeedback(null);
    if (errors.language) {
      setErrors({ ...errors, language: undefined });
    }
  };

  const handleSelectCustom = () => {
    setIsCustomLang(true);
    setImportFeedback(null);
  };

  const handleImportStarterDeck = async () => {
    if (!starterDeck || starterDeck.length === 0 || importingDeck) return;

    setImportingDeck(true);
    setApiError(null);
    setSuccessWord(null);
    let imported = 0;
    let duplicates = 0;

    try {
      for (const item of starterDeck) {
        try {
          await wordsApi.createWord({
            word: item.word,
            language: currentTargetLanguage,
            translation: item.translation,
          });
          imported += 1;
        } catch (err) {
          if (err.status === 409 || err.code === 'DUPLICATE_WORD') {
            duplicates += 1;
          } else {
            console.error('Error importing word:', item.word, err);
          }
        }
      }

      notifyChange();

      setImportFeedback({
        language: currentTargetLanguage,
        imported,
        duplicates,
        total: starterDeck.length,
      });
    } catch (err) {
      setApiError(`Could not import starter deck: ${err.message}`);
    } finally {
      setImportingDeck(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccessWord(null);
    setImportFeedback(null);

    if (!validate()) return;

    const payload = {
      word: formData.word.trim(),
      language: (isCustomLang ? customLanguage : formData.language).trim(),
      translation: formData.definition.trim(),
    };

    setSubmitting(true);
    try {
      const created = await wordsApi.createWord(payload);
      setSuccessWord(created);
      notifyChange(); // update due count immediately

      // Clear input fields for next entry
      setFormData({
        word: '',
        language: formData.language,
        definition: '',
      });
      setErrors({});
    } catch (err) {
      console.error('Failed to create word:', err);
      // Handles 409 Conflict duplicate error nicely
      if (err.status === 409 || err.code === 'DUPLICATE_WORD') {
        setApiError(`A word "${payload.word}" in ${payload.language} already exists in your vocabulary list.`);
      } else {
        setApiError(err.message || 'An error occurred while adding the word.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Add New Vocabulary</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Specify the foreign term, select its language deck, and provide the meaning for your flashcard.
        </p>
      </div>

      {apiError && (
        <div className="alert alert-error" id="add-word-error">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Addition Blocked:</strong> {apiError}
          </div>
        </div>
      )}

      {importFeedback && (
        <div className="alert alert-success" id="import-deck-feedback">
          <CheckCircle size={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            Imported <strong>{importFeedback.imported} starter words</strong> for {importFeedback.language}!{' '}
            {importFeedback.duplicates > 0 && (
              <span style={{ opacity: 0.85 }}>({importFeedback.duplicates} already existed).</span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            onClick={() => navigate('/review')}
          >
            Review Now <ArrowRight size={14} />
          </button>
        </div>
      )}

      {successWord && (
        <div className="alert alert-success" id="add-word-success">
          <CheckCircle size={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            Successfully added <strong>"{successWord.word}"</strong> ({successWord.language}) to your queue!
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            onClick={() => navigate('/review')}
            id="btn-goto-review-after-add"
          >
            Review Now <ArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="glass-card">
        <form onSubmit={handleSubmit} noValidate id="add-word-form">
          {/* Section 1: Word */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="input-word">
              1. Vocabulary Word / Term <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="input-word"
              name="word"
              type="text"
              className="form-input"
              placeholder="e.g. Ineluctable, Bibliothèque, Schmetterling"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              autoFocus
            />
            {errors.word && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.word}</span>}
          </div>

          {/* Section 2: Clearly Segmented Language Picker with Default Import Option */}
          <div className={`language-picker-panel ${errors.language ? 'error-panel' : 'active-panel'}`} id="language-picker-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Languages size={18} style={{ color: 'var(--primary)' }} />
                <label className="form-label" style={{ margin: 0, fontWeight: 700, color: '#fff' }}>
                  2. Target Language Deck <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 999,
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                }}
              >
                Selected: {currentTargetLanguage}
              </span>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Click a language to assign your card, or use the one-click default import:
            </p>

            {/* Language Chips Grid */}
            <div className="language-chips-grid">
              {PRESET_LANGUAGES.map(({ code, label, flag }) => {
                const isSelected = !isCustomLang && formData.language === code;
                return (
                  <button
                    key={code}
                    type="button"
                    className={`language-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(code)}
                    id={`chip-lang-${code.toLowerCase()}`}
                  >
                    <span className="chip-flag">{flag}</span>
                    <span>{label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                className={`language-chip ${isCustomLang ? 'active' : ''}`}
                onClick={handleSelectCustom}
                id="chip-lang-custom"
              >
                <Globe size={16} />
                <span>+ Custom Language</span>
              </button>
            </div>

            {/* Custom Language input field if active */}
            {isCustomLang && (
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <label htmlFor="input-custom-language" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Enter custom language name:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    id="input-custom-language"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Portuguese, Korean, Dutch, Latin..."
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsCustomLang(false)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* FEATURE: One-click Import by Default for the clicked language */}
            {starterDeck && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.9rem 1.1rem',
                  background: 'rgba(99, 102, 241, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                      Import {currentTargetLanguage} Starter Pack
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      Quickly add {starterDeck.length} curated high-frequency words for {currentTargetLanguage}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    padding: '0.45rem 1rem',
                    fontSize: '0.825rem',
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#fff',
                  }}
                  disabled={importingDeck}
                  onClick={handleImportStarterDeck}
                  id="btn-import-starter-deck"
                >
                  {importingDeck ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Importing Deck...
                    </>
                  ) : (
                    <>
                      <Download size={14} /> Import {currentTargetLanguage} ({starterDeck.length})
                    </>
                  )}
                </button>
              </div>
            )}

            {errors.language && (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem', display: 'block', marginTop: '0.5rem' }}>
                {errors.language}
              </span>
            )}
          </div>

          {/* Section 3: Definition / Translation */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="input-definition">
              3. Meaning / Translation / Definition <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="input-definition"
              name="definition"
              rows={4}
              className="form-textarea"
              placeholder="Provide a clear translation, definition, or mnemonic example..."
              value={formData.definition}
              onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
            />
            {errors.definition && (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.definition}</span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-submit-word"
              disabled={submitting}
              style={{ width: '100%', padding: '0.9rem' }}
            >
              <PlusCircle size={18} />
              {submitting ? 'Adding Word...' : 'Save Word to Deck & Queue for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWordPage;
