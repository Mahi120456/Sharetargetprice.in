// components/CalculatorGrowUI.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Calculator, TrendingUp, Info, Lightbulb, CheckCircle,
  ThumbsUp, AlertCircle, ChevronDown, ChevronUp, HelpCircle,
} from 'lucide-react';

const LineChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });

// ==========================================
// 1. Helper: parse JSON fields safely
// ==========================================
function safeJsonParse(value: any, fallback: any = null) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

// ==========================================
// 2. Pre-process inputs before sending to engine
// ==========================================
function preprocessInputs(inputs: Record<string, any>, inputFields: any[]) {
  const processed = { ...inputs };
  for (const field of inputFields) {
    const value = processed[field.name];
    if (value === undefined || value === null) continue;

    // Textarea → split into array
    if (field.type === 'textarea' && typeof value === 'string') {
      const lines = value.split(/\r?\n/).filter(l => l.trim() !== '');
      if (field.name === 'cashFlows' || field.name === 'cashflows') {
        processed[field.name] = lines.map(l => parseFloat(l.trim())).filter(v => !isNaN(v));
      } else if (field.name === 'dates') {
        processed[field.name] = lines.map(l => {
          // Support DD/MM/YYYY and ISO
          const parts = l.trim().split('/');
          if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0])).getTime();
          }
          return new Date(l.trim()).getTime();
        });
      } else {
        processed[field.name] = lines; // generic string array
      }
    }
    // Number field → ensure number
    else if (field.type === 'number' && typeof value === 'string') {
      processed[field.name] = parseFloat(value) || 0;
    }
  }
  return processed;
}

// ==========================================
// 3. Wrap old-style engine (multi-param) to new-style (single inputs object)
// ==========================================
function wrapOldEngine(engineStr: string, inputFields: any[]): string | null {
  // Extract parameter names: function name(param1, param2, ...)
  const match = engineStr.match(/function\s+\w*\s*\(\s*([^)]*)\s*\)/);
  if (!match) return null;
  const params = match[1].split(',').map(p => p.trim()).filter(p => p);
  if (params.length === 0) return null;

  // Build mapping: param -> input field name
  const mapping: string[] = [];
  for (const param of params) {
    const lower = param.toLowerCase();
    const aliasMap: Record<string, string> = {
      'p': 'monthlyInvestment',
      'principal': 'monthlyInvestment',
      'annualrate': 'annualReturn',
      'rate': 'annualReturn',
      'returnrate': 'annualReturn',
      'years': 'years',
      'n': 'years',
      'tenure': 'years',
      'duration': 'years',
      'time': 'years',
      'cashflows': 'cashFlows',
      'dates': 'dates',
    };
    if (aliasMap[lower]) {
      mapping.push(aliasMap[lower]);
      continue;
    }
    // Try exact match with input field names
    const matchedField = inputFields.find(f => f.name.toLowerCase() === lower);
    mapping.push(matchedField ? matchedField.name : param);
  }

  // Build destructuring: { monthlyInvestment: P, annualReturn: annualRate, years }
  const destructure = params.map((p, idx) =>
    mapping[idx] === p ? p : `${mapping[idx]}: ${p}`
  ).join(', ');

  // Extract function body (everything after first { and before last })
  const bodyMatch = engineStr.match(/\{([\s\S]*)\}/);
  if (!bodyMatch) return null;
  let body = bodyMatch[1];
  return `function(inputs) {
  const { ${destructure} } = inputs;
  ${body}
}`;
}

// ==========================================
// 4. Main Component
// ==========================================
export default function CalculatorGrowUI({ calculator }: { calculator: any }) {
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);

  const inputFields = safeJsonParse(calculator.input_fields, []);
  const validationRules = safeJsonParse(calculator.validation_rules, {});
  const chartConfig = safeJsonParse(calculator.chart_config, null);
  const faqItems = safeJsonParse(calculator.faq, []);

  // Set default values
  useEffect(() => {
    const defaults: Record<string, any> = {};
    for (const field of inputFields) {
      defaults[field.name] = field.default ?? (field.type === 'number' ? 0 : '');
    }
    setInputs(defaults);
  }, [inputFields]);

  const calculate = useCallback(() => {
    if (!calculator.calculator_engine) {
      setError('Calculation engine not available');
      return;
    }
    setError('');
    setIsCalculating(true);
    try {
      // Step 1: preprocess inputs (textarea → array, numbers)
      const processed = preprocessInputs(inputs, inputFields);

      // Step 2: get engine string, wrap if old-style
      let engine = calculator.calculator_engine.trim();
      const isNewStyle = /function\s*\(\s*inputs\s*\)/.test(engine);
      if (!isNewStyle) {
        const wrapped = wrapOldEngine(engine, inputFields);
        if (wrapped) engine = wrapped;
        else throw new Error('Cannot parse engine – unsupported format');
      }

      // Step 3: Convert engine string to executable function
      // 🔥 FIX: Use eval with parentheses to treat as expression, avoiding "Function statements require a function name"
      let engineFn;
      if (engine.trim().startsWith('function')) {
        // Wrap in parentheses to make it a function expression
        engineFn = eval(`(${engine})`);
      } else {
        engineFn = new Function('inputs', engine);
      }
      const output = engineFn(processed);

      if (output && typeof output === 'object') {
        setResult(output);
        // handle chart data if provided by engine
        const points = output.chartPoints || output.yearlyData;
        if (chartConfig && points && Array.isArray(points)) {
          const labels = Array.from({ length: points.length }, (_, i) => i + 1);
          setChartData({
            labels,
            datasets: [{
              label: calculator.title,
              data: points,
              borderColor: '#f97316',
              backgroundColor: 'rgba(249,115,22,0.1)',
              fill: true,
              tension: 0.3,
            }],
          });
        } else {
          setChartData(null);
        }
      } else {
        setResult(null);
        setError('Engine returned invalid result (expected an object)');
      }
    } catch (err: any) {
      console.error('Calculation error:', err);
      setError(err.message || 'Calculation failed');
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [calculator, inputs, inputFields, chartConfig]);

  const handleInputChange = (name: string, value: any) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const formatValue = (val: any): string => {
    if (typeof val === 'number') {
      if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`;
      if (val >= 1e5) return `₹${(val / 1e5).toFixed(2)} L`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    if (val && typeof val === 'object') return JSON.stringify(val);
    return val ?? '';
  };

  const renderField = (field: any) => {
    const value = inputs[field.name] ?? '';
    const rules = validationRules[field.name] || {};
    const min = rules.min ?? field.min;
    const max = rules.max ?? field.max;

    if (field.type === 'select' && field.options) {
      return (
        <select
          value={value}
          onChange={e => handleInputChange(field.name, e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="">Select...</option>
          {field.options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={e => handleInputChange(field.name, e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-mono text-sm"
          placeholder={field.hint || 'Enter one value per line'}
        />
      );
    }

    if (field.type === 'number' && min !== undefined && max !== undefined) {
      return (
        <div>
          <input
            type="range"
            value={value}
            onChange={e => handleInputChange(field.name, parseFloat(e.target.value))}
            min={min}
            max={max}
            step={field.step || 1}
            className="w-full h-2 bg-gray-200 rounded-lg accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{min.toLocaleString()}</span>
            <span className="font-medium text-orange-600">{value.toLocaleString()}</span>
            <span>{max.toLocaleString()}</span>
          </div>
        </div>
      );
    }

    return (
      <input
        type={field.type || 'number'}
        value={value}
        onChange={e => handleInputChange(field.name, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
        min={min}
        max={max}
        step={field.step || 'any'}
      />
    );
  };

  const Section = ({ id, title, icon: Icon, content }: { id: string; title: string; icon: any; content?: string }) => {
    if (!content) return null;
    const isOpen = openSections.includes(id);
    return (
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex justify-between items-center p-5 text-left font-semibold text-gray-800 hover:bg-gray-50"
        >
          <span className="flex items-center gap-2"><Icon className="w-5 h-5 text-orange-500" />{title}</span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {isOpen && (
          <div className="p-5 pt-0 border-t border-gray-100 prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Calculator Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <Calculator className="w-6 h-6 text-orange-500" />
            Calculate Now
          </h2>
          <div className="space-y-5">
            {inputFields.map((field: any) => (
              <div key={field.name}>
                <label className="block font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
                {field.hint && <p className="text-xs text-gray-400 mt-1">{field.hint}</p>}
              </div>
            ))}
          </div>
          <button
            onClick={calculate}
            disabled={isCalculating}
            className="mt-8 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition disabled:opacity-50 shadow-md"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Now →'}
          </button>
        </div>

        {result && (
          <div className="border-t border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Your Result
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(result).map(([key, val]) => {
                let displayKey = key;
                if (key === 'invested') displayKey = 'Total Invested Amount';
                else if (key === 'returns') displayKey = 'Estimated Returns';
                else if (key === 'maturity') displayKey = 'Maturity Value';
                else if (key === 'xirr') displayKey = 'XIRR (%)';
                else displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="bg-white rounded-xl p-4 shadow-sm border">
                    <p className="text-sm text-gray-500">{displayKey}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{formatValue(val)}</p>
                  </div>
                );
              })}
            </div>
            {calculator.result_explanation && (
              <p className="mt-4 text-sm text-gray-600 bg-white/60 p-3 rounded-lg">
                {calculator.result_explanation}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="border-t p-6 bg-red-50">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          </div>
        )}

        {chartData && chartConfig && (
          <div className="border-t p-6 bg-gray-50">
            <h4 className="font-semibold mb-3">{chartConfig.title || 'Growth Over Time'}</h4>
            <div className="h-64">
              {chartConfig.type === 'line' && <LineChart data={chartData} options={{ maintainAspectRatio: false }} />}
              {chartConfig.type === 'bar' && <BarChart data={chartData} options={{ maintainAspectRatio: false }} />}
              {chartConfig.type === 'pie' && <PieChart data={chartData} options={{ maintainAspectRatio: false }} />}
            </div>
          </div>
        )}
      </div>

      {/* Educational Sections */}
      <div className="space-y-3">
        <Section id="what" title="What is this calculator?" icon={Info} content={calculator.what_is} />
        <Section id="how" title="How to use" icon={Lightbulb} content={calculator.how_to_use} />
        <Section id="formula" title="Formula & Calculation" icon={Calculator} content={calculator.formula_explanation} />
        <Section id="benefits" title="Key Benefits" icon={CheckCircle} content={calculator.benefits} />
        <Section id="protips" title="Pro Tips" icon={ThumbsUp} content={calculator.pro_tips} />
        {calculator.important_notes && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
            <p className="text-amber-800 text-sm">{calculator.important_notes}</p>
          </div>
        )}
      </div>

      {/* FAQ */}
      {faqItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            Frequently Asked Questions
          </h3>
          <div itemScope itemType="https://schema.org/FAQPage" className="space-y-4">
            {faqItems.map((item: any, idx: number) => (
              <div key={idx} itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="border-b pb-3 last:border-0">
                <h4 itemProp="name" className="font-semibold text-gray-800">{item.q}</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div itemProp="text" className="text-gray-600 mt-1">{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
