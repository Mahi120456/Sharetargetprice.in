"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Eye, EyeOff, Image as ImageIcon, FileText, Calendar } from 'lucide-react';

const categories = ["Share Price Target", "Stock Analysis", "IPO", "Mutual Funds", "SIP", "Calculator"];

export default function EditPost({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
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
  const [originalSlug, setOriginalSlug] = useState("");

  useEffect(() => {
    fetch(`/api/admin/posts/${params.id}`)
      .then(res => {
        if (res.status === 401) { router.push("/admin"); return null; }
        return res.json();
      })
      .then(data => {
        if (data?.post) {
          setForm(data.post);
          setOriginalSlug(data.post.slug);
        }
      });
  }, [params.id, router]);

  async function handleSave() {
    if (!form.title || !form.content) {
      alert("Title and Content are required!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${params.id}`, {
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
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-orange-500 transition flex items-center gap-1">
              <ChevronLeft size={18} /> Back
            </Link>
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <h1 className="font-bold text-xl text-gray-800">Edit Article</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/${originalSlug}`} target="_blank" className="text-gray-500 hover:text-gray-700 text-sm px-3 py-2 rounded-lg transition flex items-center gap-1">
              <Eye size={16} /> View
            </Link>
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
              <Save size={16} />
              {saved ? "Saved!" : loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {!previewMode ? (
          <div className="space-y-6">
            {/* Title */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block font-bold text-gray-800 mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Article title"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>

            {/* Category & Slug */}
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
                  <label className="block font-bold text-gray-800 mb-2">Slug (URL)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">/{form.slug}</p>
                </div>
              </div>
              <div className="mt-4">
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

            {/* Featured Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block font-bold text-gray-800 mb-2 flex items-center gap-1">
                <ImageIcon size={16} /> Featured Image URL
              </label>
              <input
                type="text"
                value={form.featured_image || ""}
                onChange={e => setForm(f => ({ ...f, featured_image: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {form.featured_image && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 max-w-xs">
                  <img src={form.featured_image} alt="preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block font-bold text-gray-800 mb-2">Short Description (Excerpt)</label>
              <textarea
                value={form.excerpt || ""}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={3}
                placeholder="Brief summary for meta description and cards"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-bold text-gray-800">Content (HTML / Markdown)</label>
                <span className="text-xs text-gray-400">Supports HTML tags: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, etc.</span>
              </div>
              <textarea
                value={form.content || ""}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={28}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y"
              />
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
            <div className="mt-8 text-xs text-gray-400 border-t pt-4">
              Category: {form.category} | Type: {form.post_type === "post" ? "Blog Post" : "Page"} | Slug: /{form.slug}
            </div>
          </div>
        )}

        {/* Bottom Save Button */}
        {!previewMode && (
          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {saved ? "Saved Successfully!" : loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
