import React, { useMemo } from 'react';
import type { UserData } from '../types';
import { t } from '../locales';
import { getPrimaryInsights } from '../services/shareService';

// Helper function to get emoji icon based on key
const getEmojiIcon = (key: string): string => {
  switch(key) {
    case 'activity':
    case 'no_smoking':
    case 'low_salt':
    case 'no_alcohol':
    case 'healthy_bmi':
      return '👍'; // Thumbs Up - For positive findings
    case 'Smoking':
      return '🚭'; // No Smoking - For smoking
    case 'Weight':
      return '⚖️'; // Scale - For weight issues
    case 'Waist':
      return '⭕'; // Circle - For waist circumference
    case 'Sedentary':
      return '🪑'; // Chair - For sedentary lifestyle
    case 'Alcohol':
      return '🍺'; // Beer - For alcohol
    case 'Salt':
      return '🧂'; // Salt - For salt intake
    case 'Dna':
      return '🧬'; // DNA - For family history
    case 'Biomass':
      return '🔥'; // Fire - For biomass fuel
    default:
      return '⚫'; // Default circle
  }
};

interface KeyInsightsCardProps {
  userData: UserData;
  cbacScore: number;
}

const KeyInsightsCard: React.FC<KeyInsightsCardProps> = ({ userData, cbacScore }) => {
  const { focusArea1, focusArea2 } = useMemo(() => {
    const insights = getPrimaryInsights(userData);
    return {
      focusArea1: insights.focusAreas?.[0] ?? null,
      focusArea2: insights.focusAreas?.[1] ?? null,
    };
  }, [userData]);

  const riskMeta = useMemo(() => {
    if (cbacScore >= 7)
      return { color: 'var(--danger)', label: t('cbac_high') };
    if (cbacScore >= 4)
      return { color: 'var(--warning)', label: t('cbac_medium') };
    return { color: 'var(--success)', label: t('cbac_low') };
  }, [cbacScore]);

  return (
    <section className="key-insights-card animate-fade-in">
      <header className="insights-header">
        <span className="insights-subtitle">{t('key_insights_title')}</span>
        <h2 className="insights-name">{userData.name}</h2>
      </header>

      <div className="insights-content">
        {/* SCORE */}
        <div
          className="insights-score-circle"
          style={{ borderColor: riskMeta.color }}
        >
          <span className="insights-score-value">{cbacScore}</span>
          <span
            className="insights-score-label"
            style={{ color: riskMeta.color }}
          >
            {riskMeta.label}
          </span>
        </div>

        {/* FOCUS AREAS */}
        <div className="insights-focus">
          <h4 className="focus-title">
            {t('key_insights_risk_factors_title')}
          </h4>

          <div className="focus-grid">
            {(focusArea1 || focusArea2) ? (
              <>
                {focusArea1 && (
                  <FocusItem label={focusArea1.label}>
                    <span style={{ fontSize: '22px' }}>{getEmojiIcon(focusArea1.key)}</span>
                  </FocusItem>
                )}
                {focusArea2 && (
                  <FocusItem label={focusArea2.label}>
                    <span style={{ fontSize: '22px' }}>{getEmojiIcon(focusArea2.key)}</span>
                  </FocusItem>
                )}
              </>
            ) : (
              <FocusItem label="Maintain Healthy Lifestyle">
                <span style={{ fontSize: '22px' }}>👍</span>
              </FocusItem>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeyInsightsCard;

/* ---------- Sub Components ---------- */

const FocusItem: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="focus-item">
    <div className="focus-icon">{children}</div>
    <span className="focus-label">{label}</span>
  </div>
);
