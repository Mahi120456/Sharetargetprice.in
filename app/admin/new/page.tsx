"use client";
export const dynamic = 'force-dynamic';   // 👈 ADD THIS LINE

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send, Image as ImageIcon, FileText, Eye, EyeOff } from 'lucide-react';

const categories = ["Share Price Target", "Stock Analysis", "IPO", "Mutual Funds", "SIP", "Calculator"];

export default function NewPost() {
  // ... rest of your code remains exactly the same

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Share Price Target",
    featured_image: "",
    post_type: "post",
  });

  function handleTitle(title: string) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setForm(f => ({ ...f, title, slug }));
  }

  async function handleSave() {
    if (!form.title || !form.content) {
      alert("Title and Content are required!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published_at: new Date().toISOString() }),
      });
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      if (data.success) {
        router.push("/admin/dashboard");
      } else {
        alert("Error: " + data.error);
        setLoading(false);
      }
    } catch (err) {
      alert("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-orange-500 transition flex items-center gap-1">
              <ChevronLeft size={18} /> Back
            </Link>
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <h1 className="font-bold text-xl text-gray-800">Create New Article</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="text-gray-500 hover:text-gray-700 text-sm px-3 py-2 rounded-lg transition flex items-center gap-1"
            >
              {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
              {previewMode ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition shadow-sm flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {!previewMode ? (
          <div className="space-y-6">
            {/* Title & Slug */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block font-bold text-gray-800 mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => handleTitle(e.target.value)}
                placeholder="e.g., Tata Motors Share Price Target 2026"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                autoFocus
              />
              {form.slug && (
                <div className="mt-2 text-xs text-gray-400">
                  🔗 URL: /<span className="text-orange-500 font-mono">{form.slug}</span>
                </div>
              )}
            </div>

            {/* Category & Post Type */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold text-gray-800 mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-2">Content Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="post"
                        checked={form.post_type === "post"}
                        onChange={() => setForm(f => ({ ...f, post_type: "post" }))}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span>📝 Blog Post</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="page"
                        checked={form.post_type === "page"}
                        onChange={() => setForm(f => ({ ...f, post_type: "page" }))}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span>📄 Static Page</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block font-bold text-gray-800 mb-2 flex items-center gap-1">
                <ImageIcon size={16} /> Featured Image URL
              </label>
              <input
                type="text"
                value={form.featured_image}
                onChange={e => setForm(f => ({ ...f, featured_image: e.target.value }))}
                placeholder="https://example.com/stock-image.jpg"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block font-bold text-gray-800 mb-2">Short Description</label>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={3}
                placeholder="2-3 line summary for meta description and cards..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-bold text-gray-800">Content * (HTML or Markdown-friendly)</label>
                <span className="text-xs text-gray-400">Supports HTML tags</span>
              </div>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={24}
                placeholder="Write your article here. Use HTML tags for formatting: &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a&gt; etc."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y"
              />
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                💡 Tip: Use headings (H2, H3) for structure, and add internal links to other stocks or calculators.
              </div>
            </div>
          </div>
        ) : (
          // Preview Mode
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 prose max-w-none">
            <h1 className="text-3xl font-bold">{form.title || "Untitled"}</h1>
            {form.featured_image && (
              <img src={form.featured_image} alt={form.title} className="rounded-xl my-4 max-w-full" />
            )}
            {form.excerpt && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 italic my-4">{form.excerpt}</div>
            )}
            <div dangerouslySetInnerHTML={{ __html: form.content || "<p>No content yet.</p>" }} />
            <div className="mt-8 text-xs text-gray-400 border-t pt-4">Category: {form.category}</div>
          </div>
        )}

        {/* Bottom Publish Button */}
        {!previewMode && (
          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {loading ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
