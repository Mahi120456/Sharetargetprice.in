"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Eye, EyeOff } from 'lucide-react';

export default function EditStock({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    content: "",
    symbol: "",
    current_price: null as number | null,
  });
  const [originalSlug, setOriginalSlug] = useState("");

  useEffect(() => {
    fetch(`/api/admin/stocks/${params.id}`)
      .then(res => {
        if (res.status === 401) { router.push("/admin"); return null; }
        return res.json();
      })
      .then(data => {
        if (data?.stock) {
          setForm(data.stock);
          setOriginalSlug(data.stock.slug);
        }
      });
  }, [params.id, router]);

  async function handleSave() {
    if (!form.name || !form.content) {
      alert("Name and Content are required!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 401) { router.push("/admin"); return; }
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-orange-500 flex items-center gap-1">
            <ChevronLeft size={18} /> Back
          </Link>
          <div className="flex gap-2">
            <Link href={`/${originalSlug}`} target="_blank" className="text-gray-500 hover:text-gray-700 text-sm px-3 py-2 rounded-lg">
              <Eye size={16} /> View
            </Link>
            <button onClick={() => setPreviewMode(!previewMode)} className="text-gray-500 hover:text-gray-700 text-sm px-3 py-2 rounded-lg">
              {previewMode ? <EyeOff size={16} /> : <Eye size={16} />} {previewMode ? "Edit" : "Preview"}
            </button>
            <button onClick={handleSave} disabled={loading} className="bg-orange-500 text-white px-5 py-2 rounded-xl flex items-center gap-1 disabled:opacity-60">
              <Save size={16} /> {saved ? "Saved!" : loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {!previewMode ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label className="block font-bold mb-2">Stock Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-xl px-4 py-3" />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label className="block font-bold mb-2">Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full border rounded-xl px-4 py-2 font-mono" />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label className="block font-bold mb-2">Symbol</label>
              <input type="text" value={form.symbol || ""} onChange={e => setForm({...form, symbol: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label className="block font-bold mb-2">Current Price</label>
              <input type="number" value={form.current_price || ""} onChange={e => setForm({...form, current_price: parseFloat(e.target.value)})} className="w-full border rounded-xl px-4 py-2" />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label className="block font-bold mb-2">Content (HTML)</label>
              <textarea value={form.content || ""} onChange={e => setForm({...form, content: e.target.value})} rows={28} className="w-full border rounded-xl px-4 py-3 font-mono text-sm" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 prose max-w-none">
            <h1>{form.name}</h1>
            <div dangerouslySetInnerHTML={{ __html: form.content || "<p>No content</p>" }} />
          </div>
        )}
        {!previewMode && (
          <div className="mt-8">
            <button onClick={handleSave} disabled={loading} className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-xl flex justify-center gap-2">
              <Save size={18} /> {saved ? "Saved!" : loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
