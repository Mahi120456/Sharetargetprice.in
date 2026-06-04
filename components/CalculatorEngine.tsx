'use client'

import { useState } from 'react'

type InputField = {
  name: string
  label: string
  type: string
  min?: number
  max?: number
  default?: number | string
  required?: boolean
}

export default function CalculatorEngine({
  inputFields,
  outputFields,
  engineCode,
  chartConfig,
  validationRules,
}: {
  inputFields: InputField[]
  outputFields: string[]
  engineCode: string
  chartConfig: any
  validationRules: any
}) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(inputFields.map((f) => [f.name, Number(f.default ?? 0)]))
  )
  const [result, setResult] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    try {
      const fnNameMatch = engineCode.match(/^function\s+(\w+)\s*\(([^)]*)\)/)
      if (!fnNameMatch) throw new Error('Invalid calculator engine')
      const fnName = fnNameMatch[1]
      const paramNames = fnNameMatch[2].split(',').map((p) => p.trim())
      const args = paramNames.map((_, i) => {
        const field = inputFields[i]
        return field ? values[field.name] ?? 0 : 0
      })
      const fn = new Function(`${engineCode}; return ${fnName}`)()
      const output = fn(...args)
      setResult(output)
      setError('')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {inputFields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            <input
              type="number"
              min={field.min}
              max={field.max}
              value={values[field.name] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: Number(e.target.value) }))}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        ))}
      </div>
      <button onClick={calculate} className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition">
        Calculate
      </button>
      {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
      {result && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(result).map(([key, val]) => (
            <div key={key} className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-xl font-bold text-orange-700">{typeof val === 'number' ? formatINR(val) : String(val)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
