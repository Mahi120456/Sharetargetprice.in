"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    const res = await fetch("/api/admin/posts");
    if (res.status === 401) { router.push("/admin"); return; }
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-black text-lg">🛠️ Admin Panel</h1>
        <div className="flex gap-2">
          <Link href="/admin/new"
            className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg">
            + New
          </Link>
          <Link href="/" className="bg-slate-700 text-white text-sm px-3 py-2 rounded-lg">
            🌐 Site
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-black text-orange-500">{blogPosts.length}</div>
            <div className="text-xs text-gray-500">Blog Posts</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-black text-blue-500">{pages.length}</div>
            <div className="text-xs text-gray-500">Pages</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-black text-green-500">{posts.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>

        {/* Search */}
        <input type="text" placeholder="🔍 Search..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400" />

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("post")}
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${
              tab === "post"
                ? "bg-orange-500 text-white"
                : "bg-white text-slate-700 border border-gray-200"
            }`}>
            📝 Blog Posts ({blogPosts.length})
          </button>
          <button onClick={() => setTab("page")}
            className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${
              tab === "page"
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-700 border border-gray-200"
            }`}>
            📄 Pages ({pages.length})
          </button>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : currentList.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400">
            <div className="text-3xl mb-2">{tab === "post" ? "📝" : "📄"}</div>
            <p>Koi {tab === "post" ? "post" : "page"} nahi mila</p>
            <Link href="/admin/new"
              className="inline-block mt-4 bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg">
              + New {tab === "post" ? "Post" : "Page"}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((post) => (
              <div key={post.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm line-clamp-1">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.post_type === "post"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {post.post_type === "post" ? post.category : "Page"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.published_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href={`/admin/edit/${post.id}`}
                    className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                    ✏️
                  </Link>
                  <Link href={`/${post.slug}`} target="_blank"
                    className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                    👁️
                  </Link>
                  <button onClick={() => deletePost(post.id, post.title)}
                    className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
