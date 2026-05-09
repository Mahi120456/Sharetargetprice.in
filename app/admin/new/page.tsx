"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categories = ["Share Price Target","Stock Analysis","IPO","Mutual Funds","SIP","Calculator"];

export default function NewPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "",
    category: "Share Price Target", featured_image: "", post_type: "post",
  });

  function handleTitle(title: string) {
    const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    setForm(f => ({ ...f, title, slug }));
  }

  async function handleSave() {
    if (!form.title || !form.content) { alert("Title aur Content zaroori hai!"); return; }
    setLoading(true);
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, published_at: new Date().toISOString() }),
    });
    if (res.status === 401) { router.push("/admin"); return; }
    const data = await res.json();
    if (data.success) router.push("/admin/dashboard");
    else { alert("Error: " + data.error); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-gray-400">← Back</Link>
          <h1 className="font-black text-lg">✍️ New Article</h1>
        </div>
        <button onClick={handleSave} disabled={loading}
          className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50">
          {loading ? "Publishing..." : "🚀 Publish"}
        </button>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Title *</label>
          <input type="text" value={form.title} onChange={e => handleTitle(e.target.value)}
            placeholder="Jaise: Tata Motors Share Price Target 2026"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400" />
          {form.slug && <p className="text-xs text-gray-400 mt-1">URL: .../<span className="text-orange-500">{form.slug}</span></p>}
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Featured Image URL</label>
          <input type="text" value={form.featured_image}
            onChange={e => setForm(f => ({ ...f, featured_image: e.target.value }))}
            placeholder="https://example.com/image.jpg"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Short Description</label>
          <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            rows={3} placeholder="2-3 lines summary..."
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none resize-none" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Content *</label>
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={20} placeholder="Yahan apna article likho..."
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none resize-none font-mono text-sm" />
        </div>
        <button onClick={handleSave} disabled={loading}
          className="w-full bg-orange-500 text-white font-black text-lg py-4 rounded-xl disabled:opacity-50">
          {loading ? "Publishing..." : "🚀 Publish Article"}
        </button>
      </div>
    </div>
  );
}
