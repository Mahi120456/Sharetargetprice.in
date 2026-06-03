// components/CalculatorListClient.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function CalculatorListClient({ calculators, groups, categories }: any) {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('ranking');

  const filtered = useMemo(() => {
    let filteredList = calculators.filter((calc: any) => {
      const matchesSearch = 
        calc.title.toLowerCase().includes(search.toLowerCase()) ||
        calc.focus_keyword?.toLowerCase().includes(search.toLowerCase()) ||
        calc.description?.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = selectedGroup === 'all' || calc.calculator_group === selectedGroup;
      const matchesCategory = selectedCategory === 'all' || calc.category === selectedCategory;
      return matchesSearch && matchesGroup && matchesCategory;
    });

    if (sortBy === 'ranking') {
      filteredList.sort((a: any, b: any) => (a.ranking_priority || 5) - (b.ranking_priority || 5));
    } else if (sortBy === 'title') {
      filteredList.sort((a: any, b: any) => a.title.localeCompare(b.title));
    } else if (sortBy === 'score') {
      filteredList.sort((a: any, b: any) => (b.seo_score || 0) - (a.seo_score || 0));
    }
    return filteredList;
  }, [calculators, search, selectedGroup, selectedCategory, sortBy]);

  return (
    <>
      {/* Search + Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8 space-y-4 md:space-y-0 md:flex md:flex-wrap md:items-center md:gap-4">
        <input
          type="text"
          placeholder="Search calculators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] p-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
        />
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="p-2 border rounded-lg bg-white"
        >
          <option value="all">All Groups</option>
          {groups.map((g: string) => (
            <option key={g} value={g}>{g?.toUpperCase()}</option>
          ))}
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-lg bg-white"
        >
          <option value="all">All Categories</option>
          {categories.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded-lg bg-white"
        >
          <option value="ranking">Sort by Priority</option>
          <option value="title">Sort by Name</option>
          <option value="score">Sort by SEO Score</option>
        </select>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 mb-4">Showing {filtered.length} of {calculators.length} calculators</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((calc: any) => (
          <Link key={calc.slug} href={`/calculator/${calc.slug}`} className="group bg-white rounded-xl p-5 shadow-sm border hover:shadow-lg transition hover:-translate-y-1 block">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition">
              {calc.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{calc.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {calc.calculator_group && <span className="bg-gray-100 px-2 py-1 rounded-full">{calc.calculator_group}</span>}
              {calc.category && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{calc.category}</span>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
