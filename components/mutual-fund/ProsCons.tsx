export default function ProsCons({ content }: { content: string }) {
  if (!content) return null;
  return <div className="my-8"><h2 className="text-2xl font-bold mb-4">Pros & Cons</h2><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} /></div>;
}
