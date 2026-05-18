'use client';

interface TechnicalSectionProps {
  stock: any;
}

export default function TechnicalSection({ stock }: TechnicalSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Technical Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Technical Indicators */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Key Indicators</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
              <span className="text-sm text-gray-600">RSI (14)</span>
              <div className="text-right">
                <span className="font-semibold">28.23</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-600">Oversold</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
              <span className="text-sm text-gray-600">MACD</span>
              <div className="text-right">
                <span className="font-semibold">-8.07</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-600">Bearish</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
              <span className="text-sm text-gray-600">Beta</span>
              <span className="font-semibold">+1.03</span>
            </div>
          </div>
        </div>

        {/* Support & Resistance */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Support & Resistance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-red-50 p-2.5 rounded-lg">
              <span className="text-red-600">Resistance 3 (R3)</span>
              <span className="font-medium">₹360.16</span>
            </div>
            <div className="flex justify-between bg-red-50 p-2.5 rounded-lg">
              <span className="text-red-600">Resistance 2 (R2)</span>
              <span className="font-medium">₹350.43</span>
            </div>
            <div className="flex justify-between bg-red-50 p-2.5 rounded-lg">
              <span className="text-red-600">Resistance 1 (R1)</span>
              <span className="font-medium">₹344.66</span>
            </div>

            <div className="flex justify-between bg-blue-50 p-2.5 rounded-lg font-semibold">
              <span>Pivot Point</span>
              <span>₹334.93</span>
            </div>

            <div className="flex justify-between bg-green-50 p-2.5 rounded-lg">
              <span className="text-green-600">Support 1 (S1)</span>
              <span className="font-medium">₹329.16</span>
            </div>
            <div className="flex justify-between bg-green-50 p-2.5 rounded-lg">
              <span className="text-green-600">Support 2 (S2)</span>
              <span className="font-medium">₹319.43</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-4">
        Technical data is for educational purpose only.
      </p>
    </div>
  );
}
