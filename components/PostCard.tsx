import Link from "next/link";
import Image from "next/image";

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
    IPO: "bg-purple-100 text-purple-800",
    "Mutual Funds": "bg-yellow-100 text-yellow-800",
    SIP: "bg-indigo-100 text-indigo-800",
    Calculator: "bg-orange-100 text-orange-800",
  };

  const colorClass = categoryColors[post.category] || "bg-gray-100 text-gray-800";

  return (
    <Link href={`/${post.slug}`}>
      <article className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100">
        {/* Thumbnail Image Section */}
        <div className="relative h-48 w-full bg-gradient-to-br from-slate-200 to-gray-300 overflow-hidden">
          {post.featured_image ? (
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm font-medium">
              📈 Share Target Price
            </div>
          )}
          {/* Category Badge on Image */}
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass} shadow-sm`}>
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h2 className="font-bold text-slate-900 text-lg leading-snug mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-4">{post.excerpt}</p>
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">📅 {date}</span>
            <span className="text-xs font-semibold text-orange-500 group-hover:translate-x-1 transition-transform">
              Read More →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
