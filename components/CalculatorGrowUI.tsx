// components/CalculatorGrowUI.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Calculator, TrendingUp, Info, Lightbulb, CheckCircle, 
  ThumbsUp, AlertCircle, ChevronDown, ChevronUp, 
  FileText, HelpCircle 
} from 'lucide-react';

// Dynamic charts (client-side only)
const LineChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });

interface CalculatorData {
  id?: number;
  slug: string;
  title: string;
  input_fields: any;
  calculator_engine?: string;
  chart_config?: any;
  validation_rules?: any;
  result_explanation?: string;
  output_fields?: any;
  what_is?: string;
  how_to_use?: string;
  formula_explanation?: string;
  benefits?: string;
  pro_tips?: string;
  important_notes?: string;
  faq?: any; // JSON array
}

export default function CalculatorGrowUI({ calculator }: { calculator: CalculatorData }) {
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Parse input_fields (could be JSONB or string)
  const inputFields = (() => {
    const fields = calculator.input_fields;
    if (!fields) return [];
    if (Array.isArray(fields)) return fields;
    if (typeof fields === 'string') {
      try { return JSON.parse(fields); } catch { return []; }
    }
    return [];
  })();

  // Parse validation_rules
  const validationRules = (() => {
    const rules = calculator.validation_rules;
    if (!rules) return {};
    if (typeof rules === 'object') return rules;
    try { return JSON.parse(rules); } catch { return {}; }
  })();

  // Parse chart_config
  const chartConfig = (() => {
    const config = calculator.chart_config;
    if (!config) return null;
    if (typeof config === 'object') return config;
    try { return JSON.parse(config); } catch { return null; }
  })();

  // Parse FAQ
  const faqItems = (() => {
    const faq = calculator.faq;
    if (!faq) return [];
    if (Array.isArray(faq)) return faq;
    try { return JSON.parse(faq); } catch { return []; }
  })();

  // Set default values
  useEffect(() => {
    const defaults: Record<string, any> = {};
    inputFields.forEach((field: any) => {
      defaults[field.name] = field.default ?? (field.type === 'number' ? 0 : '');
    });
    setInputs(defaults);
  }, [inputFields]);

  const calculate = useCallback(() => {
    if (!calculator.calculator_engine) {
      setResult({ message: 'Calculation engine not available' });
      return;
    }
    setError('');
    setIsCalculating(true);
    try {
      const engineFn = new Function('inputs', calculator.calculator_engine);
      const output = engineFn(inputs);
      if (output && typeof output === 'object') {
        setResult(output);
        // Handle chart data if engine provides yearly points
        if (chartConfig && output.chartPoints) {
          generateChart(output.chartPoints);
        } else if (chartConfig && output.yearlyData) {
          generateChart(output.yearlyData);
        }
      } else {
        setResult(null);
        setError('Engine did not return a valid result');
      }
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [calculator.calculator_engine, inputs, chartConfig]);

  const generateChart = (points: number[]) => {
    const labels = Array.from({ length: points.length }, (_, i) => i + 1);
    setChartData({
      labels,
      datasets: [{
        label: calculator.title,
        data: points,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.3,
      }],
    });
  };

  const handleInputChange = (name: string, value: any) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const formatValue = (val: unknown): string => {
    if (typeof val === 'number') {
      if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`;
      if (val >= 1e5) return `₹${(val / 1e5).toFixed(2)} L`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    if (val === null || val === undefined) return '';
    return String(val);
  };

  const renderField = (field: any) => {
    const value = inputs[field.name] ?? '';
    const rules = validationRules?.[field.name] || {};
    const min = rules.min ?? field.min;
    const max = rules.max ?? field.max;

    if (field.type === 'select' && field.options) {
      return (
        <select
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
        >
          <option value="">Select...</option>
          {field.options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    // Range slider for numeric with min/max
    if (field.type === 'number' && min !== undefined && max !== undefined) {
      return (
        <div>
          <input
            type="range"
            value={value}
            onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
            min={min}
            max={max}
            step={field.step || 1}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
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
        onChange={(e) => handleInputChange(field.name, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        min={min}
        max={max}
        step={field.step || 'any'}
        required={field.required}
      />
    );
  };

  // Section components for rich text (using dangerouslySetInnerHTML but safe)
  const Section = ({ id, title, icon: Icon, content }: { id: string, title: string, icon: any, content?: string }) => {
    if (!content) return null;
    const isOpen = openSections.includes(id);
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex justify-between items-center p-5 text-left font-semibold text-gray-800 hover:bg-gray-50 transition"
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

        {/* Result Section */}
        {result && (
          <div className="border-t border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Your Result
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(result).map(([key, val]) => (
                <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{formatValue(val)}</p>
                </div>
              ))}
            </div>
            {calculator.result_explanation && (
              <p className="mt-4 text-sm text-gray-600 bg-white/60 p-3 rounded-lg">{calculator.result_explanation}</p>
            )}
          </div>
        )}

        {error && (
          <div className="border-t border-gray-100 p-6 bg-red-50">
            <div className="flex items-center gap-2 text-red-700"><AlertCircle className="w-5 h-5" />{error}</div>
          </div>
        )}

        {chartData && chartConfig && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <h4 className="font-semibold mb-3">{chartConfig.title || 'Growth Over Time'}</h4>
            <div className="h-64">
              {chartConfig.type === 'line' && <LineChart data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
              {chartConfig.type === 'bar' && <BarChart data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
              {chartConfig.type === 'pie' && <PieChart data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
            </div>
          </div>
        )}
      </div>

      {/* Educational Sections - Accordion */}
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

      {/* FAQ Section with Schema */}
      {faqItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-orange-500" />Frequently Asked Questions</h3>
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
