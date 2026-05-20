import dynamic from 'next/dynamic';

export const calculatorComponents: Record<string, any> = {
  'sip-calculator': dynamic(() => import('./SIPCalculator')),
  'monthly-sip-return-calculator': dynamic(() => import('./SIPCalculator')),
  // ✅ Annuity Calculator – testing ke liye
  'annuity-calculator': dynamic(() => import('./AnnuityCalculator')),
};

export function getCalculatorComponent(slug: string) {
  return calculatorComponents[slug] || null;
}
