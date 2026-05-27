export default function FAQSection({ content }: { content: string }) {
  if (!content) return <p className="text-gray-500 italic">FAQs will be added soon.</p>;
  return <div className="post-content" dangerouslySetInnerHTML={{ __html: content }} />;
}
