import type { UserData } from '../types.ts';
import { CLINICAL_THRESHOLDS } from '../constants.ts';
import { t } from '../locales/index.ts';

interface Insight {
    key: string;
    label: string;
    Icon: string;
}

export interface PrimaryInsights {
    positiveFinding: Insight | null;
    focusAreas: Insight[];
}

export function getPrimaryInsights(data: UserData): PrimaryInsights {
    const POSITIVE_FINDINGS_RANKED = [
        { key: 'activity', labelKey: 'positive_finding_activity', condition: (d: UserData) => d.physicalActivity === 'active' || d.physicalActivity === 'moderate' },
        { key: 'no_smoking', labelKey: 'positive_finding_no_smoking', condition: (d: UserData) => d.smokingStatus === 'never' && !d.usesSmokelessTobacco },
        { key: 'low_salt', labelKey: 'positive_finding_low_salt', condition: (d: UserData) => d.saltIntake === 'low' },
        { key: 'no_alcohol', labelKey: 'positive_finding_no_alcohol', condition: (d: UserData) => d.alcoholFrequency === 'none' },
        { key: 'healthy_bmi', labelKey: 'positive_finding_healthy_bmi', condition: (d: UserData) => { if (!d.height || !d.weight) return false; const bmi = d.weight / ((d.height / 100) ** 2); return bmi >= 18.5 && bmi < CLINICAL_THRESHOLDS.BMI_NORMAL_UPPER; }},
    ];

    const RISK_FACTORS_RANKED = [
      { key: 'Smoking', labelKey: 'risk_insight_smoking', condition: (d: UserData) => d.smokingStatus === 'current' || d.usesSmokelessTobacco },
      { key: 'Weight', labelKey: 'risk_insight_obesity', condition: (d: UserData) => { if (!d.height || !d.weight) return false; const bmi = d.weight / ((d.height / 100) ** 2); return bmi >= CLINICAL_THRESHOLDS.BMI_OVERWEIGHT_UPPER; }},
      { key: 'Waist', labelKey: 'risk_insight_waist', condition: (d: UserData) => { const isMale = d.gender === 'male'; return (isMale && d.waistCircumference > CLINICAL_THRESHOLDS.WAIST_MALE_HIGH) || (!isMale && d.waistCircumference > CLINICAL_THRESHOLDS.WAIST_FEMALE_HIGH); }},
      { key: 'Sedentary', labelKey: 'risk_insight_sedentary', condition: (d: UserData) => d.physicalActivity === 'sedentary' },
      { key: 'Alcohol', labelKey: 'risk_insight_alcohol', condition: (d: UserData) => d.alcoholFrequency === 'high' },
      { key: 'Salt', labelKey: 'risk_insight_salt', condition: (d: UserData) => d.saltIntake === 'high' },
      { key: 'Dna', labelKey: 'risk_insight_family_history', condition: (d: UserData) => !d.familyHistoryUnsure && d.familyHistory.length > 0 },
      { key: 'Biomass', labelKey: 'risk_insight_biomass', condition: (d: UserData) => d.cookingFuelType === 'biomass' },
    ];

    const positiveFinding = POSITIVE_FINDINGS_RANKED.find(p => p.condition(data)) || null;
    const focusAreas = RISK_FACTORS_RANKED.filter(r => r.condition(data)).slice(0, 2);

    return {
        positiveFinding: positiveFinding ? { key: positiveFinding.key, label: t(positiveFinding.labelKey), Icon: '' } : null,
        focusAreas: focusAreas.map(r => ({ key: r.key, label: t(r.labelKey), Icon: '' }))
    };
}

export function generateShareableCardDataUrl(userData: UserData, cbacScore: number, theme: { primary: string; primaryDark: string; accent: string }): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');

    // --- Background ---
    const grad = ctx.createLinearGradient(0, 0, 800, 500);
    grad.addColorStop(0, theme.primary);
    grad.addColorStop(1, theme.primaryDark);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 500);

    // Decorative circle top-right
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.arc(700, 100, 250, 0, Math.PI * 2);
    ctx.fill();

    // --- Header ---
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Lato", sans-serif';
    ctx.fillText('HEALTH ASSESSMENT SUMMARY', 50, 60);
    
    // Sub-header (Date)
    ctx.font = '16px "Lato", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(new Date().toLocaleDateString(), 50, 90);

    // --- User Name ---
    ctx.font = 'bold 48px "Playfair Display", serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(userData.name, 50, 160);

    // --- Score Circle (Right Side) ---
    const cx = 650, cy = 250, r = 100;
    
    // Outer glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    
    // Circle background
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Border ring
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Score Value
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 90px sans-serif';
    ctx.fillText(String(cbacScore), cx, cy + 30);
    
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('RISK SCORE', cx, cy + 60);

    // --- Insights Section (Left Side) ---
    const insights = getPrimaryInsights(userData);
    let yPos = 240;
    ctx.textAlign = 'left';
    
    // Helper to draw an insight row with simple icons
    const drawInsightRow = (label: string, iconType: string, color: string) => {
        // Draw Icon Background
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.roundRect(50, yPos - 30, 50, 50, 12);
        ctx.fill();
        
        // Draw Simple Icon (using shapes instead of complex SVG paths)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        const iconX = 75;
        const iconY = yPos - 5;
        
        switch(iconType) {
            case 'activity':
            case 'no_smoking':
            case 'low_salt':
            case 'no_alcohol':
            case 'healthy_bmi':
                // 👍 Thumbs Up - For positive findings
                ctx.font = '24px sans-serif';
                ctx.fillText('👍', iconX - 12, iconY + 8);
                break;
            case 'Smoking':
                // ⚫ Circle with X - For smoking
                ctx.font = '20px sans-serif';
                ctx.fillText('🚭', iconX - 10, iconY + 6);
                break;
            case 'Weight':
                // ⚖️ Scale - For weight issues
                ctx.font = '20px sans-serif';
                ctx.fillText('⚖️', iconX - 10, iconY + 6);
                break;
            case 'Waist':
                // ⭕ Oval - For waist circumference
                ctx.font = '20px sans-serif';
                ctx.fillText('⭕', iconX - 10, iconY + 6);
                break;
            case 'Sedentary':
                // 🪑 Chair - For sedentary lifestyle
                ctx.font = '20px sans-serif';
                ctx.fillText('🪑', iconX - 10, iconY + 6);
                break;
            case 'Alcohol':
                // 🍺 Bottle - For alcohol
                ctx.font = '20px sans-serif';
                ctx.fillText('🍺', iconX - 10, iconY + 6);
                break;
            case 'Salt':
                // 🧂 Salt - For salt intake
                ctx.font = '20px sans-serif';
                ctx.fillText('🧂', iconX - 10, iconY + 6);
                break;
            case 'Dna':
                // 🧬 DNA - For family history
                ctx.font = '20px sans-serif';
                ctx.fillText('🧬', iconX - 10, iconY + 6);
                break;
            case 'Biomass':
                // 🔥 Fire - For biomass fuel
                ctx.font = '20px sans-serif';
                ctx.fillText('🔥', iconX - 10, iconY + 6);
                break;
            default:
                // Default circle
                ctx.beginPath();
                ctx.arc(iconX, iconY, 6, 0, Math.PI * 2);
                ctx.fill();
        }

        // Draw Text
        ctx.font = 'bold 22px "Lato", sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(label, 120, yPos + 2);
        
        yPos += 70;
    };

    // 1. Positive Finding
    if (insights.positiveFinding) {
         drawInsightRow(insights.positiveFinding.label, insights.positiveFinding.key, '#a5d6a7'); // Light green text
    }

    // 2. Risk Areas
    insights.focusAreas.forEach(area => {
        drawInsightRow(area.label, area.key, '#ffffff');
    });

    // --- Footer ---
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '16px sans-serif';
    ctx.fillText('Preventive Health Advisor - Udaipur', 50, 460);
    
    // Doctor Credit
    ctx.textAlign = 'right';
    ctx.fillText('Dr. Narendra Rathore', 750, 460);

    resolve(canvas.toDataURL('image/png'));
  });
}
