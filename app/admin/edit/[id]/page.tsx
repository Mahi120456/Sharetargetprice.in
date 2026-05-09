"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categories = ["Share Price Target","Stock Analysis","IPO","Mutual Funds","SIP","Calculator"];

export default function EditPost({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "",
    category: "Share Price Target", featured_image: "", post_type: "post",
  });

  useEffect(() => {
    fetch(`/api/admin/posts/${params.id}`)
      .then(r => { if (r.status === 401) { router.push("/admin"); return; } return r.json(); })
      .then(data => { if (data?.post) setForm(data.post); });
  }, [params.id]);

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/admin/posts/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.status === 401) { router.push("/admin"); return; }
    const data = await res.json();
    if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-gray-400">← Back</Link>
          <h1 className="font-black text-lg">✏️ Edit Article</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/${form.slug}`} target="_blank"
            className="bg-slate-700 text-white text-sm px-3 py-2 rounded-lg">👁️</Link>
          <button onClick={handleSave} disabled={loading}
            className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg">
            {saved ? "✅ Saved!" : loading ? "Saving..." : "💾 Save"}
          </button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
          <input type="text" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
              <input type="text" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Featured Image URL</label>
          <input type="text" value={form.featured_image || ""}
            onChange={e => setForm(f => ({ ...f, featured_image: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Excerpt</label>
          <textarea value={form.excerpt || ""} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none resize-none" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
          <textarea value={form.content || ""} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={25} className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none resize-none font-mono text-sm" />
        </div>
        <button onClick={handleSave} disabled={loading}
          className="w-full bg-orange-500 text-white font-black text-lg py-4 rounded-xl">
          {saved ? "✅ Saved!" : loading ? "Saving..." : "💾 Save Changes"}
        </button>
      </div>
    </div>
  );
}
