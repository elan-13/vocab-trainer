import React, { useState, useEffect, useMemo } from 'react';
import { wordsApi } from '../api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Award, Flame, AlertTriangle, TrendingUp, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { SpeakerButton } from '../components/SpeakerButton';

const SCORE_COLORS = ['#7f1d1d', '#dc2626', '#ea580c', '#2563eb', '#7c3aed', '#059669'];

export const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch up to 100 recent reviews to build comprehensive charts
      const stats = await wordsApi.getHistory(100, 0);
      setData(stats);
    } catch (err) {
      console.error('Failed to load history stats:', err);
      setError(err.message || 'Failed to load progress statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Compute Bar Chart data: Score distribution (0 to 5)
  const scoreDistribution = useMemo(() => {
    if (!data || !data.recent_reviews) return [];

    const counts = [0, 1, 2, 3, 4, 5].map((s) => ({
      score: `Score ${s}`,
      scoreVal: s,
      count: 0,
    }));

    data.recent_reviews.forEach((r) => {
      if (r.score >= 0 && r.score <= 5) {
        counts[r.score].count += 1;
      }
    });

    return counts;
  }, [data]);

  // Compute Line Chart data: Accuracy per day
  const dailyAccuracy = useMemo(() => {
    if (!data || !data.recent_reviews || data.recent_reviews.length === 0) return [];

    const daysMap = {};

    data.recent_reviews.forEach((r) => {
      const day = new Date(r.review_date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      if (!daysMap[day]) {
        daysMap[day] = { total: 0, correct: 0, rawDate: new Date(r.review_date) };
      }
      daysMap[day].total += 1;
      if (r.score >= 3) {
        daysMap[day].correct += 1;
      }
    });

    return Object.entries(daysMap)
      .sort((a, b) => a[1].rawDate - b[1].rawDate)
      .map(([day, val]) => ({
        date: day,
        accuracy: Math.round((val.correct / val.total) * 100),
        reviews: val.total,
      }));
  }, [data]);

  if (loading) {
    return (
      <div className="empty-state animate-fade-in" id="progress-loading">
        <TrendingUp size={36} />
        <h2>Calculating learning analytics...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error" id="progress-error">
        <span>Failed to load stats: {error}</span>
      </div>
    );
  }

  const { accuracy = 0, streak = 0, difficult_words = [], recent_reviews = [] } = data || {};

  return (
    <div className="animate-fade-in" id="progress-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Learning Analytics & Retention</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Detailed performance metrics, retention accuracy trends, and spaced repetition charts.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card" id="stat-accuracy">
          <div className="stat-label">Retention Accuracy</div>
          <div className="stat-value" style={{ color: accuracy >= 70 ? 'var(--success)' : 'var(--warning)' }}>
            {accuracy}%
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Target: ≥ 85% long-term recall
          </span>
        </div>

        <div className="stat-card" id="stat-streak">
          <div className="stat-label">Review Streak</div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
            <Flame size={32} />
            {streak} {streak === 1 ? 'Day' : 'Days'}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Consecutive days with completed reviews
          </span>
        </div>

        <div className="stat-card" id="stat-total-reviews">
          <div className="stat-label">Total Reviews Logged</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {recent_reviews.length}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Active practice interactions
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Line Chart: Accuracy per day */}
        <div className="glass-card" id="chart-accuracy-trend">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.15rem' }}>Daily Retention Accuracy (%)</h3>
          </div>

          {dailyAccuracy.length > 0 ? (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyAccuracy} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="var(--text-dim)" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--text-dim)" fontSize={12} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(18, 24, 38, 0.95)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: 8,
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p style={{ color: 'var(--text-dim)' }}>Not enough review sessions to display daily trend.</p>
            </div>
          )}
        </div>

        {/* Bar Chart: Score Distribution */}
        <div className="glass-card" id="chart-score-distribution">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={20} style={{ color: 'var(--accent-violet)' }} />
            <h3 style={{ fontSize: '1.15rem' }}>Score Distribution (0 - 5)</h3>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="scoreVal" stroke="var(--text-dim)" fontSize={12} tickLine={false} />
                <YAxis allowDecimals={false} stroke="var(--text-dim)" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val) => [val, 'Reviews']}
                  contentStyle={{
                    backgroundColor: 'rgba(18, 24, 38, 0.95)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Difficult Words Table */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }} id="difficult-words-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Words Needing Attention</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Ranked by lowest Easiness Factor (EF) and frequent review failures.
            </p>
          </div>
        </div>

        {difficult_words.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', padding: '1rem 0' }}>No difficult words identified yet.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Language</th>
                  <th>Definition</th>
                  <th>Easiness Factor</th>
                  <th>Interval</th>
                  <th>Repetitions</th>
                </tr>
              </thead>
              <tbody>
                {difficult_words.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 700, color: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span>{w.word}</span>
                        <SpeakerButton word={w.word} language={w.language} size={14} />
                      </div>
                    </td>
                    <td>
                      <span className="word-lang-pill" style={{ fontSize: '0.7rem' }}>
                        {w.language}
                      </span>
                    </td>
                    <td>{w.translation || w.definition}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: w.easiness_factor <= 1.5 ? 'var(--danger)' : 'var(--warning)',
                        }}
                      >
                        {w.easiness_factor.toFixed(2)}
                      </span>
                    </td>
                    <td>{w.interval}d</td>
                    <td>{w.repetition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Reviews Activity Log */}
      <div className="glass-card" id="recent-reviews-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Clock size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.25rem' }}>Recent Review Activity</h3>
        </div>

        {recent_reviews.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', padding: '1rem 0' }}>No recent reviews logged.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Review ID</th>
                  <th>Word ID</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {recent_reviews.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-dim)' }}>#{r.id}</td>
                    <td>Word #{r.word_id}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 6,
                          fontWeight: 700,
                          backgroundColor: SCORE_COLORS[r.score],
                          color: '#fff',
                          fontSize: '0.8rem',
                        }}
                      >
                        {r.score}
                      </span>
                    </td>
                    <td style={{ color: r.score >= 3 ? 'var(--success)' : 'var(--danger)' }}>
                      {r.score >= 3 ? 'Recalled' : 'Failed'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(r.review_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
