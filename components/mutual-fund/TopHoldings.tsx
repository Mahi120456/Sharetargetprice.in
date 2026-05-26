interface TopHoldingsProps {
  holdings: string;
  date?: string;
}

export default function TopHoldings({ holdings, date }: TopHoldingsProps) {
  if (!holdings) return null;
  // Format: "HDFC Bank Ltd. (8.73%) | ICICI Bank Ltd. (7.76%) | ..."
  const items = holdings.split('|').map(h => h.trim()).filter(Boolean);
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-2">Top Holdings</h2>
      {date && <p className="text-sm text-gray-500 mb-4">As of {date}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item, idx) => {
          const match = item.match(/(.+?)\s*\(([\d.]+)%\)/);
          const name = match ? match[1] : item;
          const weight = match ? match[2] : '';
          return (
            <div key={idx} className="flex justify-between border-b py-2">
              <span>{idx+1}. {name}</span>
              {weight && <span className="font-medium">{weight}%</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
