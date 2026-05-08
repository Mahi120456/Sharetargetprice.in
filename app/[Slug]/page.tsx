import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import AdSense from "@/components/AdSense";

type Props = {
  params: { slug: string };
};

async function getPost(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}

async function getRelatedPosts(category: string, currentSlug: string) {
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at")
    .eq("category", category)
    .neq("slug", currentSlug)
    .limit(4);
  return data || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Not Found" };

  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      type: "article",
      publishedTime: post.published_at,
    },
  };
}

// Convert markdown-like content to HTML
function formatContent(content: string): string {
  if (!content) return "";

  let html = content
    // Remove WordPress gutenberg block comments
    .replace(/<!-- wp:[^>]+ -->/g, "")
    .replace(/<!-- \/wp:[^>]+ -->/g, "")
    // Convert markdown tables to HTML
    .replace(
      /\|(.+)\|\n\|[-|: ]+\|\n((?:\|.+\|\n?)+)/g,
      (_, header, rows) => {
        const ths = header
          .split("|")
          .filter(Boolean)
          .map((h: string) => `<th>${h.trim()}</th>`)
          .join("");
        const trs = rows
          .trim()
          .split("\n")
          .map((row: string) => {
            const tds = row
              .split("|")
              .filter(Boolean)
              .map((d: string) => `<td>${d.trim()}</td>`)
              .join("");
            return `<tr>${tds}</tr>`;
          })
          .join("");
        return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
      }
    )
    // H2 and H3
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Line breaks to paragraphs
    .split("\n\n")
    .map((para) => {
      if (
        para.startsWith("<h") ||
        para.startsWith("<table") ||
        para.startsWith("<ul") ||
        para.startsWith("<ol")
      )
        return para;
      return `<p>${para.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.category, post.slug);

  const formattedContent = formatContent(post.content);
  const publishDate = new Date(post.published_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <article className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span className="mx-2">›</span>
            <Link
              href={`/category/${post.category?.toLowerCase().replace(/ /g, "-")}`}
              className="hover:text-orange-500"
            >
              {post.category}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700 line-clamp-1">{post.title}</span>
          </nav>

          {/* Post Header */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                📈 {post.category}
              </span>
              <span className="text-xs text-gray-400">📅 {publishDate}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-4">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-gray-600 text-lg border-l-4 border-orange-400 pl-4 bg-orange-50 py-3 rounded-r-lg">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* AdSense - Top */}
          <AdSense slot="1234567890" className="mb-6" />

          {/* Post Content */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>

          {/* AdSense - Bottom */}
          <AdSense slot="0987654321" className="mb-6" />

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            ⚠️ <strong>Disclaimer:</strong> This article is for educational purposes only and does not constitute financial advice. Please consult a SEBI-registered financial advisor before investing.
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          {/* AdSense Sidebar */}
          <div className="sticky top-20">
            <AdSense slot="1122334455" format="vertical" className="mb-6" />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-gray-100">
                  Related Posts
                </h3>
                <div className="space-y-3">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.id}
                      href={`/${related.slug}`}
                      className="block hover:text-orange-600 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-700 hover:text-orange-600 line-clamp-2">
                        {related.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(related.published_at).toLocaleDateString("en-IN")}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
