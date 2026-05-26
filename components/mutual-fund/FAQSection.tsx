export default function FAQSection({ content }: { content: string }) {
  if (!content) return null;
  return <div className="my-8"><h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2><div dangerouslySetInnerHTML={{ __html: content }} /></div>;
}
