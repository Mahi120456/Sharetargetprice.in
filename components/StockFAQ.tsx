'use client';
export default function StockFAQ({ stockName }: { stockName: string }) {
  const faqs = [
    { q: `What is the realistic ${stockName} share price target for 2026?`, a: `Based on fundamental analysis, the target range for ${stockName} in 2026 is ₹...` },
    { q: `Is ${stockName} a good long-term investment?`, a: `${stockName} operates in a growing sector and has strong fundamentals, making it a potential long-term hold.` },
    { q: `What is the 52-week range of ${stockName}?`, a: `The 52-week high/low varies; check live widget.` },
  ];
  return (
    <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="border-b pb-2">
            <summary className="font-semibold cursor-pointer list-none">{faq.q}</summary>
            <p className="text-gray-600 mt-2 pl-4">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
