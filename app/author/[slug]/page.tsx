import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import authorsData from '@/data/authors.json';
import PostCard from '@/components/PostCard';

// ✅ Local type definition for Post (matches what PostCard expects)
interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
  featured_image: string | null;
  category: string;
}

async function getAuthor(slug: string) {
  const author = authorsData.find(a => a.slug === slug);
  if (!author) return null;
  return author;
}

async function getAuthorPosts(authorName: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, published_at, featured_image, category')
    .eq('post_type', 'post')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  // Filter by author name (case insensitive)
  const filteredPosts = data?.filter(post =>
    post.title?.toLowerCase().includes(authorName.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(authorName.toLowerCase())
  ) || [];

  return filteredPosts;
}

export async function generateStaticParams() {
  return authorsData.map(author => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const author = await getAuthor(params.slug);
  if (!author) return { title: 'Author Not Found' };
  return {
    title: `${author.name} – Author | Share Target Price`,
    description: author.bio?.substring(0, 160),
  };
}

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const author = await getAuthor(params.slug);
  if (!author) notFound();

  const posts = await getAuthorPosts(author.name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "description": author.bio,
    "image": author.avatar_url,
    "sameAs": [author.linkedin_url, author.facebook_url].filter(Boolean),
    "email": author.contact_email,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition-colors bg-white border border-gray-200 hover:border-orange-200 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>

          {/* Author Profile Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-orange-50 to-white p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
              {author.avatar_url && (
                <img
                  src={author.avatar_url}
                  alt={author.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-orange-200 shadow-md"
                />
              )}
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900">{author.name}</h1>
                {author.experience && (
                  <p className="text-orange-600 text-sm font-medium mt-1">{author.experience}</p>
                )}
                <p className="text-gray-600 mt-3 max-w-2xl">{author.bio}</p>
                <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                  {author.linkedin_url && (
                    <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">LinkedIn</a>
                  )}
                  {author.facebook_url && (
                    <a href={author.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Facebook</a>
                  )}
                  {author.contact_email && (
                    <a href={`mailto:${author.contact_email}`} className="text-gray-600 hover:text-orange-500 text-sm">Email</a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Long Bio Section */}
          {author.long_bio && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 md:p-8">
                <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: author.long_bio }} />
              </div>
            </div>
          )}

          {/* Articles List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">📝 Articles by {author.name}</h2>
            </div>
            <div className="p-6">
              {posts.length === 0 ? (
                <p className="text-gray-500">No articles published yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
