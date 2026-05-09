import { createClient } from '@supabase/supabase-js'
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

type Props = {
  params: { slug: string };
};

async function getPost(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return data;
}

async function getRelatedPosts(category: string, currentSlug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at")
    .eq("category", category)
    .neq("slug", currentSlug)
    .eq("post_type", "post")
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

function formatContent(content: string): string {
  if (!content) return "";
  let html = content
    .replace(/<!-- ?\/?wp:[^>]+ ?-->/g, "")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const lines = html.split('\n\n');
  html = lines.map(para => {
    if (para.trim().startsWith('<')) return para;
    if (para.trim() === '') return '';
    return `<p>${para.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');
  return html;
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // Redirect calculator posts to /calculator/[slug]
  if (post.category === 'Calculator') {
    redirect(`/calculator/${post.slug}`);
  }

  const relatedPosts = await getRelatedPosts(post.category || '', post.slug);
  const formattedContent = formatContent(post.content || '');
  const publishDate = new Date(post.published_at).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        <article className="flex-1 min-w-0">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span className="mx-2">›</span>
            <Link href={`/category/${(post.category || '').toLowerCase().replace(/ /g, "-")}`} className="hover:text-orange-500">
              {post.category}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700 line-clamp-1">{post.title}</span>
          </nav>

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
              <p className="text-gray-600 text-base border-l-4 border-orange-400 pl-4 bg-orange-50 py-3 rounded-r-lg">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            {formattedContent ? (
              <div className="post-content" dangerouslySetInnerHTML={{ __html: formattedContent }} />
            ) : (
              <p className="text-gray-500">Content loading...</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            ⚠️ <strong>Disclaimer:</strong> Educational purpose only. SEBI-registered advisor se consult karein.
          </div>
        </article>

        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-20">
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-gray-100">Related Posts</h3>
                <div className="space-y-3">
                  {relatedPosts.map((related: any) => (
                    <Link key={related.id} href={`/${related.slug}`} className="block hover:text-orange-600 transition-colors">
                      <p className="text-sm font-medium text-slate-700 hover:text-orange-600 line-clamp-2">{related.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(related.published_at).toLocaleDateString("en-IN")}</p>
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
