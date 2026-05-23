'use client';
import Link from 'next/link';
import { Linkedin, ExternalLink, UserCheck } from 'lucide-react';

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
    <div className="relative group mt-10">
      {/* Gradient border effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
      
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-6 md:p-7">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Avatar with ring effect */}
            {author.avatar_url && (
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 blur-md opacity-60"></div>
                <img
                  src={author.avatar_url}
                  alt={author.name}
                  className="relative w-20 h-20 rounded-full object-cover border-3 border-white shadow-md"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 text-center sm:text-left">
              {/* Name and badge */}
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h3 className="text-xl font-bold text-gray-900">{author.name}</h3>
                {author.experience && (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                    <UserCheck className="w-3 h-3" /> {author.experience}
                  </span>
                )}
              </div>
              
              {/* Bio */}
              <p className="text-gray-600 text-sm mt-2 leading-relaxed max-w-2xl">{author.bio}</p>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                <Link
                  href={`/author/${author.slug}`}
                  className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 text-sm font-medium transition-all hover:gap-2"
                >
                  View all articles <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                
                {author.linkedin_url && (
                  <a
                    href={author.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#0077b5] text-sm transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle divider */}
        <div className="h-0.5 w-full bg-gradient-to-r from-orange-50 via-orange-200 to-orange-50"></div>
        
        {/* Footer note */}
        <div className="bg-gray-50/50 px-6 py-2.5">
          <p className="text-xs text-gray-400 text-center">
            📊 Author & Founder at Share Target Price
          </p>
        </div>
      </div>
    </div>
  );
}
