import type { Recommendation } from '../types.ts';
import { t } from './index.ts';

type BaseRec = {
  category: string;
  test: string;
  frequency: string;
};

type DetailItem =
  | { title: string; content: string }
  | { interactiveComponent: 'AnimatedHeart' | 'AnimatedBloodSugar' };

export type Details = DetailItem[];

type LocalizedDetails = Record<string, Details>;

const baseRecommendations: Record<string, BaseRec> = {
  bp: { category: 'rec_cat_cardio', test: 'rec_test_bp', frequency: 'rec_freq_bp_normal' },
  sugar: { category: 'rec_cat_metabolic', test: 'rec_test_sugar', frequency: 'rec_freq_sugar' },
  oral: { category: 'rec_cat_cancer', test: 'rec_test_oral', frequency: 'rec_freq_oral' },
  cervix: { category: 'rec_cat_womens', test: 'rec_test_cervix', frequency: 'rec_freq_cervix' },
  lung: { category: 'rec_cat_cancer', test: 'rec_test_lung', frequency: 'rec_freq_lung' },
  liver_hep: { category: 'rec_cat_liver', test: 'rec_test_liver_hep', frequency: 'rec_freq_liver_hep' },
  hpv_prevention: { category: 'rec_cat_preventive', test: 'rec_test_hpv_prevention', frequency: 'rec_freq_hpv_prevention' },
  gastric_screening: { category: 'rec_cat_digestive', test: 'rec_test_gastric_screening', frequency: 'rec_freq_gastric_screening' },
  occupational_lung: { category: 'rec_cat_respiratory', test: 'rec_test_occupational_lung', frequency: 'rec_freq_occupational_lung' },
  breast_cbe: { category: 'rec_cat_womens', test: 'rec_test_breast_cbe', frequency: 'rec_freq_breast_cbe' },
  breast_general: { category: 'rec_cat_womens', test: 'rec_test_breast_general', frequency: 'rec_freq_breast_general' },
  colon_general: { category: 'rec_cat_digestive', test: 'rec_test_colon_general', frequency: 'rec_freq_colon_general' },
  prostate: { category: 'rec_cat_mens', test: 'rec_test_prostate', frequency: 'rec_freq_prostate' },
  lifestyle: { category: 'rec_cat_wellbeing', test: 'rec_test_lifestyle', frequency: 'rec_freq_lifestyle' },
  diabetic_retinopathy: { category: 'rec_cat_metabolic', test: 'rec_test_diabetic_retinopathy', frequency: 'rec_freq_diabetic_retinopathy' },
  diabetic_foot: { category: 'rec_cat_metabolic', test: 'rec_test_diabetic_foot', frequency: 'rec_freq_diabetic_foot' },
  diabetic_kidney: { category: 'rec_cat_metabolic', test: 'rec_test_diabetic_kidney', frequency: 'rec_freq_diabetic_kidney' },
  pulmonologist_consult: { category: 'rec_cat_respiratory', test: 'rec_test_pulmonologist_consult', frequency: 'rec_freq_pulmonologist_consult' },
  comprehensive_lung_assessment: {
    category: 'rec_cat_respiratory',
    test: 'rec_test_comprehensive_lung_assessment',
    frequency: 'rec_freq_comprehensive_lung_assessment',
  },
  metabolic_syndrome_protocol: {
    category: 'rec_cat_metabolic',
    test: 'rec_test_metabolic_syndrome_protocol',
    frequency: 'rec_freq_metabolic_syndrome_protocol',
  },
};

const enData = {
  reasons: {
    colon_general_reason: 'Recommended for adults aged 45–75 to screen for colorectal cancer.',
    colon_general_high_risk_reason: 'Earlier screening is recommended due to a family history of colon cancer.',
    colon_general_high_risk_reason_age:
      'Earlier screening is critical due to a close relative being diagnosed under age 50.',
    colon_general_high_risk_reason_uterine:
      'Earlier screening is recommended. A family history of uterine cancer can increase colorectal cancer risk (Lynch syndrome).',
    breast_general_reason: 'Recommended for women aged 40–74 to screen for breast cancer.',
    breast_general_high_risk_reason:
      'Earlier screening is recommended due to family history, genetic ancestry, or other risk factors.',
    breast_general_high_risk_reason_age:
      'Earlier screening is critical due to a close relative being diagnosed under age 50.',
    breast_cbe_reason: 'Recommended as part of an annual check-up for women over 30.',
    cervix_reason: 'Recommended for women aged 30–65 to screen for cervical cancer.',
    lung_reason:
      'Recommended for current or former heavy smokers aged 50–80 to screen for lung cancer.',
    bp_reason: 'Recommended for all adults over 30 to monitor for high blood pressure.',
    sugar_reason:
      'Recommended for all adults over 30 to screen for diabetes and pre-diabetes.',
    oral_reason: 'High risk due to tobacco use or observed oral patches.',
    prostate_reason:
      'Recommended for men to discuss with their doctor, typically starting at age 45.',
    prostate_high_risk_reason:
      'Earlier screening is critical due to a family history of prostate cancer.',
    liver_hep_reason:
      'Regular monitoring is crucial for individuals with a history of Hepatitis B or C.',
    hpv_prevention_reason:
      'Vaccination can prevent HPV-related cancers. Recommended if not fully vaccinated.',
    gastric_screening_reason:
      'A baseline check is advised due to a high-salt diet, a risk factor for stomach issues.',
    occupational_lung_reason:
      'Recommended due to occupational exposure to dust (biomass fuel, marble/mining).',
    lifestyle_reason:
      'General advice for improving diet, activity, and habits to reduce long-term health risks.',
    reason_diabetic_retinopathy:
      'Essential for detecting diabetic retinopathy, a leading cause of vision loss.',
    reason_diabetic_foot:
      'Crucial for early detection of ulcers and nerve damage.',
    reason_diabetic_kidney:
      'Necessary to monitor for diabetic nephropathy, a major cause of kidney failure.',
    pulmonologist_consult_reason:
      'Multiple risk factors warrant a pulmonologist evaluation.',
    comprehensive_lung_assessment_reason:
      'Combined occupational and domestic exposure requires specialist assessment.',
    metabolic_syndrome_protocol_reason:
      'Multiple metabolic risk factors require a holistic lifestyle-based approach.',
  } as const,

  details: {
    bp: [{ interactiveComponent: 'AnimatedHeart' }],
    sugar: [{ interactiveComponent: 'AnimatedBloodSugar' }],
  } as LocalizedDetails,

  disclaimer:
    'Privacy First: No data is stored. Consult a nearby doctor for clinical advice. Developed by Dr. Narendra Rathore (MD, MBBS).',
};


export const getRecommendationContent = (
  key: string,
  reasonKey: string
): Omit<Recommendation, 'key' | 'priority'> => {
  const recTpl = baseRecommendations[key];

  if (!recTpl) {
    return {
      categoryKey: 'info',
      category: 'Info',
      test: key,
      frequency: '',
      reason: 'Reason not available',
    };
  }

  const reason =
    enData.reasons[reasonKey as keyof typeof enData.reasons] ??
    'Consult your doctor for personalized advice.';

  return {
    categoryKey: recTpl.category,
    category: t(recTpl.category),
    test: t(recTpl.test),
    frequency: t(recTpl.frequency),
    reason,
  };
};

export const getRecommendationDetails = (key: string): Details => {
  return enData.details[key] ?? [];
};

export const getDisclaimer = (): string => enData.disclaimer;
