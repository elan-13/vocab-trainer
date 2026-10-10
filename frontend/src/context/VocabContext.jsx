import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wordsApi } from '../api';

const VocabContext = createContext(null);

export const VocabProvider = ({ children }) => {
  const [dueWords, setDueWords] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchDueWords = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await wordsApi.getDueWords();
      setDueWords(data);
      setDueCount(data.length);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch due words:', err);
      setError(err.message || 'Failed to fetch due words');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Initial fetch and manual refresh dependency
  useEffect(() => {
    fetchDueWords(false);
  }, [fetchDueWords, refreshTrigger]);

  // Phase 10: Real-time updates - Poll every 30 seconds, pause when tab hidden
  useEffect(() => {
    let intervalId = null;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (document.visibilityState === 'visible') {
            fetchDueWords(true);
          }
        }, 30000); // 30 seconds
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Fetch immediately upon returning to tab
        fetchDueWords(true);
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDueWords]);

  const notifyChange = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <VocabContext.Provider
      value={{
        dueWords,
        dueCount,
        loading,
        error,
        refreshDueWords: () => fetchDueWords(false),
        notifyChange,
      }}
    >
      {children}
    </VocabContext.Provider>
  );
};

export const useVocab = () => {
  const context = useContext(VocabContext);
  if (!context) {
    throw new Error('useVocab must be used within a VocabProvider');
  }
  return context;
};
