import React, { useMemo } from 'react';
import type { UserData } from '../types';
import { t } from '../locales';
import { getPrimaryInsights } from '../services/shareService';

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
                    {focusArea1.Icon}
                  </FocusItem>
                )}
                {focusArea2 && (
                  <FocusItem label={focusArea2.label}>
                    {focusArea2.Icon}
                  </FocusItem>
                )}
              </>
            ) : (
              <FocusItem label="Maintain Healthy Lifestyle">
                <CheckIcon />
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

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
      10-4.48 10-10S17.52 2 12 2zm-2 
      15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 
      8l-9 9z" />
  </svg>
);
