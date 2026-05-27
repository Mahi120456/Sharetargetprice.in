export default function ProsCons({ content }: { content: string }) {
  if (!content) return null;
  return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
}
