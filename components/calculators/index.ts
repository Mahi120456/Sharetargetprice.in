import dynamic from 'next/dynamic';

export const calculatorComponents: Record<string, any> = {
  'sip-calculator': dynamic(() => import('./SIPCalculator')),
  'monthly-sip-return-calculator': dynamic(() => import('./SIPCalculator')),
};

export function getCalculatorComponent(slug: string) {
  return calculatorComponents[slug] || null;
}
