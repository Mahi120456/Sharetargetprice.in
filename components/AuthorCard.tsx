import Link from "next/link";

interface AuthorCardProps {
  author: {
    name: string;
    slug: string;
    bio: string;
    avatar_url?: string;
    experience?: string;
    linkedin_url?: string;
  } | null;
}

export default function AuthorCard({ author }: AuthorCardProps) {
  if (!author) return null;

  return (
    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row gap-4 items-center sm:items-start mt-8">
      {author.avatar_url && (
        <img src={author.avatar_url} alt={author.name} className="w-16 h-16 rounded-full object-cover" />
      )}
      <div className="text-center sm:text-left flex-1">
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
          <h3 className="font-bold text-gray-900">{author.name}</h3>
          {author.experience && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{author.experience}</span>}
        </div>
        <p className="text-sm text-gray-600 mt-1">{author.bio}</p>
        <div className="flex flex-wrap gap-3 mt-2 justify-center sm:justify-start">
          {/* ✅ View all articles ka link dynamic route se match karega */}
          <Link href={`/author/${author.slug}`} className="text-orange-500 text-sm font-medium hover:underline">
            View all articles →
          </Link>
          {author.linkedin_url && (
            <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
