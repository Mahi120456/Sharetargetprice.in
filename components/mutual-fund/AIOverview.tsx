interface AIOverviewProps { 
  content: string; 
  fundName?: string; // optional because not used but kept for compatibility
}

export default function AIOverview({ content }: AIOverviewProps) {
  if (!content) return <p className="text-gray-500 italic">Overview coming soon...</p>;
  return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
}
