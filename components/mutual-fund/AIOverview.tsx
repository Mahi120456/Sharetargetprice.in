interface AIOverviewProps { content: string; fundName: string; }
export default function AIOverview({ content, fundName }: AIOverviewProps) {
  if (!content) return <div className="my-8"><p>Overview coming soon...</p></div>;
  return <div className="my-8"><h2 className="text-2xl font-bold mb-4">Overview</h2><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} /></div>;
}
