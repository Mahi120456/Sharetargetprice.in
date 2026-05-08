import Link from "next/link";

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published_at: string;
  featured_image?: string | null;
};

export default function PostCard({ post }: { post: Post }) {
  const date = new Date(post.published_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const categoryColors: Record<string, string> = {
    "Share Price Target": "bg-green-100 text-green-800",
    "Stock Analysis": "bg-blue-100 text-blue-800",
    "IPO": "bg-purple-100 text-purple-800",
    "Mutual Funds": "bg-yellow-100 text-yellow-800",
    "SIP": "bg-indigo-100 text-indigo-800",
    "Calculator": "bg-orange-100 text-orange-800",
  };

  const colorClass = categoryColors[post.category] || "bg-gray-100 text-gray-800";

  return (
    <Link href={`/${post.slug}`}>
      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover h-full flex flex-col">
        {/* Category Banner */}
        <div className="bg-slate-900 px-4 py-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colorClass}`}>
            {post.category}
          </span>
        </div>

        <div className="p-5 flex flex-col flex-1">
          {/* Title */}
          <h2 className="font-bold text-slate-900 text-base leading-snug mb-3 line-clamp-3 hover:text-orange-600 transition-colors">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-4">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">📅 {date}</span>
            <span className="text-xs font-semibold text-orange-500 hover:text-orange-600">
              Read More →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
