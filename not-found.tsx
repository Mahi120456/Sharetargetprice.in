import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="text-8xl mb-6">📉</div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">404</h1>
        <p className="text-xl text-gray-500 mb-8">
          Yeh page nahi mila! Stock ki tarah delist ho gaya 😅
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            🏠 Homepage
          </Link>
          <Link
            href="/category/share-price-target"
            className="bg-slate-900 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            📈 Latest Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
