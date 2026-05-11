import { createClient } from '@supabase/supabase-js'
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, Eye, Share2, MessageCircle, Twitter, Send } from 'lucide-react';

type Props = {
  params: { slug: string };
};

async function getPost(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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
  );
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, published_at, featured_image")
    .eq("category", category)
    .neq("slug", currentSlug)
    .eq("post_type", "post")
    .order("published_at", { ascending: false })
    .limit(4);
  return data || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | ShareTargetPrice.in`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      type: "article",
      publishedTime: post.published_at,
    },
  };
}

// Calculate reading time (approx 200 words per minute)
function getReadingTime(content: string): number {
  const wordCount = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(wordCount / 200));
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

function ShareButtons({ title, url }: { title: string; url: string }) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  return (
    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
      <span className="text-sm text-gray-500 flex items-center gap-1"><Share2 size={16} /> Share:</span>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition" aria-label="Twitter">
        <Twitter size={16} />
      </a>
      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-green-600 hover:text-white transition" aria-label="WhatsApp">
        <MessageCircle size={16} />
      </a>
      <a href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full hover:bg-blue-500 hover:text-white transition" aria-label="Telegram">
        <Send size={16} />
      </a>
    </div>
  );
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
  const readingTime = getReadingTime(post.content || '');
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sharetargetprice.in'}/${post.slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Article */}
          <article className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-orange-500 transition">Home</Link>
              <span>›</span>
              <Link href={`/category/${(post.category || '').toLowerCase().replace(/ /g, "-")}`} className="hover:text-orange-500 transition">
                {post.category}
              </Link>
              <span>›</span>
              <span className="text-gray-700 line-clamp-1 max-w-md">{post.title}</span>
            </nav>

            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    📈 {post.category}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {publishDate}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {readingTime} min read</span>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 pl-4 py-3 rounded-r-lg text-gray-700 text-base">
                    {post.excerpt}
                  </div>
                )}
              </div>
            </div>

            {/* Article Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
              {formattedContent ? (
                <div className="post-content" dangerouslySetInnerHTML={{ __html: formattedContent }} />
              ) : (
                <p className="text-gray-500 italic">Content is being prepared. Please check back soon.</p>
              )}
              
              {/* Share Buttons */}
              <ShareButtons title={post.title} url={postUrl} />
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              ⚠️ <strong>Disclaimer:</strong> This content is for educational and informational purposes only. 
              It is not financial advice. Please consult a SEBI-registered financial advisor before making any investment decisions.
            </div>
          </article>

          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* About the Author (placeholder) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">SP</div>
                  <div>
                    <h4 className="font-bold text-gray-800">ShareTargetPrice Team</h4>
                    <p className="text-xs text-gray-500">Research & Analysis</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Our team of financial analysts provides data-driven stock insights and investment education.
                </p>
              </div>

              {/* Related Posts Sidebar */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span>📘</span> Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((related: any) => (
                      <Link key={related.id} href={`/${related.slug}`} className="block group">
                        <div className="flex gap-3">
                          {related.featured_image && (
                            <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                              <img src={related.featured_image} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 line-clamp-2">
                              {related.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(related.published_at).toLocaleDateString("en-IN")}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action Card */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-5 text-white text-center">
                <div className="text-2xl mb-2">🚀</div>
                <h4 className="font-bold text-lg mb-1">Get Stock Updates</h4>
                <p className="text-xs text-orange-100 mb-3">Free daily stock targets & analysis</p>
                <Link href="/all-stocks" className="inline-block bg-white text-orange-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-100 transition">
                  View All Stocks →
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Posts Section (Mobile/Tablet) */}
        {relatedPosts.length > 0 && (
          <div className="mt-10 lg:hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span>📘</span> Related Articles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((related: any) => (
                <Link key={related.id} href={`/${related.slug}`} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition group">
                  <div className="flex gap-3">
                    {related.featured_image && (
                      <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={related.featured_image} alt={related.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 line-clamp-2">
                        {related.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(related.published_at).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
