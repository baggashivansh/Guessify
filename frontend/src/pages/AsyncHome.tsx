import { Link } from 'react-router-dom';
import { PageHeader } from '../components/Layout';
import { DIFFICULTIES } from '../types';

export function AsyncHome() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Async Challenge"
        subtitle="Play on your time. Challenge friends. Beat the daily puzzle."
      />

      <div className="space-y-4">
        <Link to="/async/play" className="block glass-card-hover p-8 group">
          <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center text-2xl mb-4">
            🎯
          </div>
          <h2 className="font-display text-xl font-bold text-ink group-hover:text-accent transition-colors">
            Play & Share Challenge
          </h2>
          <p className="text-ink-muted mt-2 leading-relaxed">
            Play solo, then share a link so friends try to beat your score on the same number.
          </p>
        </Link>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-2 text-ink">Daily Puzzle</h3>
          <p className="text-ink-muted text-sm mb-4">
            One puzzle per difficulty each day. Same number for everyone. Share your result!
          </p>
          <div className="grid gap-3">
            {DIFFICULTIES.map((d) => (
              <Link
                key={d.key}
                to={`/daily/${d.key}`}
                className="flex items-center justify-between px-4 py-4 rounded-xl bg-surface-subtle border border-surface-border hover:border-accent/30 hover:bg-accent-soft/30 transition-all"
              >
                <div>
                  <div className="font-semibold text-ink">{d.label}</div>
                  <div className="text-sm text-ink-muted">{d.range}</div>
                </div>
                <span className="text-accent font-semibold text-sm">Play →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
