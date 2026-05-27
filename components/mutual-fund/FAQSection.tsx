'use client';

import { useEffect, useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection({ content }: { content: string }) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  useEffect(() => {
    if (!content) {
      setFaqs([]);
      return;
    }

    // Try to parse as HTML – look for <h3>, <h4>, <strong> as questions
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h3, h4, strong');
    let items: FAQItem[] = [];

    if (headings.length > 0) {
      headings.forEach((heading) => {
        let answer = '';
        let next = heading.nextElementSibling;
        while (next && !['H3', 'H4', 'STRONG'].includes(next.tagName)) {
          if (next.tagName === 'P') {
            // Use textContent instead of innerText
            answer += (next.textContent || '') + ' ';
          }
          next = next.nextElementSibling;
        }
        const question = (heading.textContent || '').trim();
        const answerText = answer.trim();
        if (question && answerText) {
          items.push({ question, answer: answerText });
        }
      });
    }

    // Fallback 1: split by question mark and newlines
    if (items.length === 0 && content.includes('?')) {
      const lines = content.split(/\r?\n/);
      let currentQ = '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.endsWith('?')) {
          currentQ = trimmed;
        } else if (currentQ && trimmed) {
          items.push({ question: currentQ, answer: trimmed });
          currentQ = '';
        }
      }
      // If last question has no following line, treat remaining content as answer
      if (currentQ && items.length > 0) {
        items[items.length - 1].answer += ' ' + currentQ;
      }
    }

    // Fallback 2: treat entire content as single FAQ
    if (items.length === 0) {
      items = [{ question: 'Frequently Asked Questions', answer: content }];
    }

    setFaqs(items);
  }, [content]);

  if (!content || faqs.length === 0) {
    return <p className="text-gray-500 italic">FAQs will be added soon.</p>;
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <details key={idx} className="border-b border-gray-200 pb-3 group">
          <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-gray-800 text-lg">
            {faq.question}
            <span className="text-blue-600 text-sm transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div
            className="mt-2 text-gray-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br/>') }}
          />
        </details>
      ))}
    </div>
  );
}
