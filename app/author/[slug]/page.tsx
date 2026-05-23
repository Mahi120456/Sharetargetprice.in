import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

async function getAuthor(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: author, error } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error || !author) return null;

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, title, excerpt, published_at')
    .eq('author_id', author.id)
    .order('published_at', { ascending: false });
  return { ...author, posts: posts || [] };
}

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: authors } = await supabase.from('authors').select('slug');
  return authors?.map(a => ({ slug: a.slug })) || [];
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
          {author.avatar_url && <img src={author.avatar_url} alt={author.name} className="w-32 h-32 rounded-full object-cover border-4 border-orange-100" />}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black">{author.name}</h1>
            <p className="text-orange-600 text-sm">{author.experience}</p>
            <p className="text-gray-600 mt-2">{author.bio}</p>
            <div className="flex gap-3 mt-3 justify-center md:justify-start">
              {author.linkedin_url && <a href={author.linkedin_url} target="_blank" rel="noopener" className="text-blue-600 text-sm">LinkedIn</a>}
              {author.facebook_url && <a href={author.facebook_url} target="_blank" rel="noopener" className="text-blue-600 text-sm">Facebook</a>}
              {author.contact_email && <a href={`mailto:${author.contact_email}`} className="text-gray-600 text-sm">Email</a>}
            </div>
          </div>
        </div>

        {/* Long Bio (HTML content) */}
        {author.long_bio && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 prose max-w-none" dangerouslySetInnerHTML={{ __html: author.long_bio }} />
        )}

        {/* Articles List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Articles by {author.name}</h2>
          {author.posts.length === 0 ? <p>No articles yet.</p> : (
            <div className="space-y-3">
              {author.posts.map(post => (
                <Link key={post.slug} href={`/${post.slug}`} className="block p-3 border rounded-xl hover:border-orange-200">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-500">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
