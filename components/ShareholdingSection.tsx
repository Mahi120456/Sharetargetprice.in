'use client';

interface ShareholdingSectionProps {
  shareholding: any[];
}

export default function ShareholdingSection({ shareholding }: ShareholdingSectionProps) {
  if (!shareholding || shareholding.length === 0) {
    return null;
  }

  // Latest quarter ka data lo
  const latest = shareholding[0];

  const holders = [
    { label: 'Promoters', value: latest.promoter_pct, color: 'bg-green-500' },
    { label: 'FIIs', value: latest.fii_pct, color: 'bg-blue-500' },
    { label: 'DIIs', value: latest.dii_pct, color: 'bg-purple-500' },
    { label: 'Public', value: latest.public_pct, color: 'bg-gray-400' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Shareholding Pattern</h2>

      <div className="space-y-4">
        {holders.map((holder, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{holder.label}</span>
              <span className="font-semibold">{holder.value || 0}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-3 rounded-full ${holder.color} transition-all`} 
                style={{ width: `${holder.value || 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Latest quarter data
      </p>
    </div>
  );
}
