'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, ChevronDown, TrendingUp, Building2, Tag } from 'lucide-react';

export default function ComparisonsClient({ initialComparisons }: { initialComparisons: any[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [amc, setAmc] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Extract unique categories and AMCs (safe)
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    initialComparisons.forEach(c => {
      if (c?.fund1?.category) cats.add(c.fund1.category);
      if (c?.fund2?.category) cats.add(c.fund2.category);
    });
    return Array.from(cats).sort();
  }, [initialComparisons]);

  const allAmcs = useMemo(() => {
    const amcs = new Set<string>();
    initialComparisons.forEach(c => {
      if (c?.fund1?.fund_house) amcs.add(c.fund1.fund_house);
      if (c?.fund2?.fund_house) amcs.add(c.fund2.fund_house);
    });
    return Array.from(amcs).sort();
  }, [initialComparisons]);

  // Filter data (safe)
  const filtered = useMemo(() => {
    return initialComparisons.filter(item => {
      const searchLower = search.toLowerCase();
      const searchMatch = !search ||
        (item.fund1?.scheme_name?.toLowerCase().includes(searchLower)) ||
        (item.fund2?.scheme_name?.toLowerCase().includes(searchLower)) ||
        item.slug?.includes(searchLower);
      const categoryMatch = !category ||
        item.fund1?.category === category ||
        item.fund2?.category === category;
      const amcMatch = !amc ||
        item.fund1?.fund_house === amc ||
        item.fund2?.fund_house === amc;
      return searchMatch && categoryMatch && amcMatch && item.slug; // ensure slug exists
    });
  }, [initialComparisons, search, category, amc]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <Link href="/mutual-funds" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5" />
          Back to mutual funds list
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Mutual Fund Comparisons</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore <strong>{initialComparisons.length.toLocaleString()}+</strong> side‑by‑side fund comparisons.
            Filter by category, AMC, or search.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by fund name..." value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <select value={category} onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-orange-500">
                <option value="">All Categories</option>
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <select value={amc} onChange={(e) => { setAmc(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-orange-500">
                <option value="">All AMCs</option>
                {allAmcs.map(am => <option key={am} value={am}>{am}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button onClick={() => { setSearch(''); setCategory(''); setAmc(''); setCurrentPage(1); }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Reset Filters
            </button>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-500">
          Showing {paginated.length} of {filtered.length} comparisons
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map((item) => (
            <Link key={item.slug} href={`/mutual-funds/compare/${item.slug}`}
              className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-semibold text-gray-800 group-hover:text-orange-600 line-clamp-2">
                  {item.fund1?.scheme_name?.split(' - ')[0] || 'Fund A'} <span className="text-gray-400">vs</span> {item.fund2?.scheme_name?.split(' - ')[0] || 'Fund B'}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">{item.fund1?.category || 'N/A'}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">{item.fund2?.category || 'N/A'}</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-green-600" /><span>3Y: {item.fund1?.returns_3y ?? 'N/A'}%</span></div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-green-600" /><span>{item.fund2?.returns_3y ?? 'N/A'}%</span></div>
              </div>
              <div className="mt-3 text-xs text-gray-500 truncate">{item.fund1?.fund_house || 'N/A'} vs {item.fund2?.fund_house || 'N/A'}</div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50">Previous</button>
            <span className="px-4 py-2 text-gray-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
