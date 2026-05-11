"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, Eye, Edit, Trash2, Search, X, 
  FileText, Layout, TrendingUp, Calendar, 
  ChevronLeft, Home, LogOut 
} from 'lucide-react';

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  post_type: string;
  published_at: string;
};

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"post" | "page">("post");
  const router = useRouter();

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/admin/posts");
      if (res.status === 401) { router.push("/admin"); return; }
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(id: number, title: string) {
    if (!confirm(`"${title}" delete karna chahte ho?`)) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );
  const blogPosts = filtered.filter(p => p.post_type === "post");
  const pages = filtered.filter(p => p.post_type === "page");
  const currentList = tab === "post" ? blogPosts : pages;

  // Calculate stats for current tab (without search filter)
  const totalBlog = posts.filter(p => p.post_type === "post").length;
  const totalPages = posts.filter(p => p.post_type === "page").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-xl text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/new" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1">
              <Plus size={16} /> New
            </Link>
            <Link href="/" className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-xl transition flex items-center gap-1">
              <Home size={16} /> Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-800">{totalBlog}</div>
              <div className="text-xs text-gray-500">Blog Posts</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Layout className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-800">{totalPages}</div>
              <div className="text-xs text-gray-500">Pages</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-800">{posts.length}</div>
              <div className="text-xs text-gray-500">Total Content</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-700"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
          <button
            onClick={() => setTab("post")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
              tab === "post"
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText size={16} />
            Posts ({blogPosts.length})
          </button>
          <button
            onClick={() => setTab("page")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
              tab === "page"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Layout size={16} />
            Pages ({pages.length})
          </button>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading content...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-5xl mb-4">{tab === "post" ? "📝" : "📄"}</div>
            <p className="text-gray-500 mb-4">No {tab === "post" ? "posts" : "pages"} found</p>
            <Link href="/admin/new" className="inline-flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition">
              <Plus size={16} /> Create New {tab === "post" ? "Post" : "Page"}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((post) => (
              <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">{post.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        post.post_type === "post"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {post.post_type === "post" ? post.category || "Post" : "Page"}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(post.published_at).toLocaleDateString("en-IN")}
                      </span>
                      <span className="text-xs text-gray-400">/{post.slug}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/edit/${post.id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Edit">
                      <Edit size={16} />
                    </Link>
                    <Link href={`/${post.slug}`} target="_blank" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition" title="View">
                      <Eye size={16} />
                    </Link>
                    <button onClick={() => deletePost(post.id, post.title)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick tip footer */}
        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
          <p>Admin Dashboard • Manage all content • Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
