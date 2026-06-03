// components/CalculatorInteractive.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import chart components (only on client)
const LineChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });

export default function CalculatorInteractive({ inputFields, calculatorEngine, chartConfig, validationRules, title }: any) {
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const defaults: any = {};
    inputFields.forEach((field: any) => {
      defaults[field.name] = field.default ?? (field.type === 'number' ? 0 : '');
    });
    setInputs(defaults);
    calculate(defaults);
  }, [inputFields]);

  const handleChange = (name: string, value: any) => {
    const newInputs = { ...inputs, [name]: value };
    setInputs(newInputs);
    calculate(newInputs);
  };

  const calculate = (values: any) => {
    setError('');
    try {
      if (!calculatorEngine) {
        setResult({ message: 'Calculation engine not available' });
        return;
      }
      const engineFn = new Function('inputs', calculatorEngine);
      const output = engineFn(values);
      setResult(output);
      if (chartConfig && output?.chartPoints) {
        generateChart(output.chartPoints);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generateChart = (points: number[]) => {
    const labels = Array.from({ length: points.length }, (_, i) => i + 1);
    setChartData({
      labels,
      datasets: [{
        label: title,
        data: points,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.4,
      }]
    });
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
          onChange={(e) => handleChange(field.name, e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
          required={field.required}
        >
          <option value="">Select...</option>
          {field.options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    return (
      <input
        type={field.type || 'number'}
        value={value}
        onChange={(e) => handleChange(field.name, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
        min={min}
        max={max}
        step={field.step || 'any'}
        required={field.required}
      />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border overflow-hidden mb-8">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Calculate Now</h2>
        <div className="space-y-4">
          {inputFields.map((field: any) => (
            <div key={field.name}>
              <label className="block font-medium mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
              {renderField(field)}
              {field.hint && <p className="text-xs text-gray-400 mt-1">{field.hint}</p>}
            </div>
          ))}
        </div>

        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        {result && (
          <div className="mt-6 p-5 bg-green-50 rounded-xl">
            <h3 className="font-bold text-lg mb-2">Result</h3>
            {Object.entries(result).map(([key, val]) => (
              <p key={key} className="text-gray-800"><strong>{key}:</strong> {typeof val === 'number' ? val.toLocaleString('en-IN') : val}</p>
            ))}
          </div>
        )}

        {chartData && chartConfig && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            {chartConfig.type === 'line' && <LineChart data={chartData} options={{ responsive: true }} />}
            {chartConfig.type === 'bar' && <BarChart data={chartData} options={{ responsive: true }} />}
            {chartConfig.type === 'pie' && <PieChart data={chartData} options={{ responsive: true }} />}
          </div>
        )}
      </div>
    </div>
  );
}
