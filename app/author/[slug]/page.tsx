import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Linkedin, Facebook, Mail, Briefcase, BookOpen, Award, TrendingUp, Users, Shield, BarChart } from 'lucide-react';
import authorsData from '@/data/authors.json';
import PostCard from '@/components/PostCard';

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

  // Parse expertise from long_bio if present, else hardcoded
  const expertiseList = [
    'Share Price Target Analysis',
    'Fundamental Stock Research',
    'Banking & Financial Services',
    'Mutual Funds & Investment Planning',
    'Insurance & Wealth Products',
    'SME & Business Banking',
    'Financial Content Research'
  ];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-orange-200 rounded-full px-4 py-2 text-sm font-medium shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>

          {/* Hero Section – Modern Profile Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-10">
            <div className="relative bg-gradient-to-r from-orange-50 via-amber-50 to-white p-6 md:p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl -z-0"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                {author.avatar_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={author.avatar_url}
                      alt={author.name}
                      className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-orange-100"
                    />
                  </div>
                )}
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{author.name}</h1>
                  {author.experience && (
                    <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mt-3">
                      <Briefcase className="w-3.5 h-3.5" /> {author.experience}
                    </div>
                  )}
                  <p className="text-gray-600 mt-4 text-base leading-relaxed max-w-2xl">{author.bio}</p>
                  <div className="flex flex-wrap gap-3 mt-5 justify-center md:justify-start">
                    {author.linkedin_url && (
                      <a
                        href={author.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#0077b5] hover:bg-[#005e8c] text-white text-sm font-medium px-4 py-2 rounded-full transition shadow-sm"
                      >
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
                    {author.facebook_url && (
                      <a
                        href={author.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#1877f2] hover:bg-[#0d65d9] text-white text-sm font-medium px-4 py-2 rounded-full transition shadow-sm"
                      >
                        <Facebook className="w-4 h-4" /> Facebook
                      </a>
                    )}
                    {author.contact_email && (
                      <a
                        href={`mailto:${author.contact_email}`}
                        className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-full transition shadow-sm"
                      >
                        <Mail className="w-4 h-4" /> Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expertise Section – Pill Badges */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-5">
              <Award className="w-6 h-6 text-orange-500" /> My Expertise
            </h2>
            <div className="flex flex-wrap gap-3">
              {expertiseList.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-100"
                >
                  <BarChart className="w-3.5 h-3.5" /> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Long Bio / About Me – Styled Article */}
          {author.long_bio && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-10">
              <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" /> About Me
                </h2>
              </div>
              <div className="p-6 md:p-8 prose prose-slate max-w-none leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: author.long_bio }} />
              </div>
            </div>
          )}

          {/* Articles Section */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" /> Articles by {author.name}
              </h2>
            </div>
            <div className="p-6">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No articles published yet.</p>
                </div>
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
