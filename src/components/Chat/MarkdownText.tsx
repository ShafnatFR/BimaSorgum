import React from 'react';

/**
 * Lightweight markdown renderer for the AI chat responses (BIMA AI returns
 * markdown: bold, italic, headings, bullet & numbered lists, links).
 * No external dependency — handles the subset the backend actually emits.
 */

/** Parse **bold** and *italic* inline, and [text](url) links. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Order matters: bold before italic; links before both.
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(text.slice(lastIndex, m.index));
    }
    const token = m[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i++}`} className="font-bold text-[#163422]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('[') && token.endsWith(')')) {
      const close = token.indexOf('](');
      const label = token.slice(1, close);
      const href = token.slice(close + 2, -1);
      nodes.push(
        <a
          key={`${keyPrefix}-a${i++}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#163422] underline decoration-[#163422]/40 hover:decoration-[#163422]"
        >
          {label}
        </a>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={`${keyPrefix}-i${i++}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else {
      nodes.push(token);
    }
    lastIndex = m.index + token.length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let paragraphBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (!listBuffer) return;
    if (listBuffer.type === 'ul') {
      blocks.push(
        <ul key={`l${key++}`} className="list-disc pl-5 space-y-1 my-1.5">
          {listBuffer.items.map((item, idx) => (
            <li key={idx} className="text-sm sm:text-base leading-relaxed">
              {renderInline(item, `ul${idx}`)}
            </li>
          ))}
        </ul>
      );
    } else {
      blocks.push(
        <ol key={`l${key++}`} className="list-decimal pl-5 space-y-1 my-1.5">
          {listBuffer.items.map((item, idx) => (
            <li key={idx} className="text-sm sm:text-base leading-relaxed">
              {renderInline(item, `ol${idx}`)}
            </li>
          ))}
        </ol>
      );
    }
    listBuffer = null;
  };

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const joined = paragraphBuffer.join(' ');
      blocks.push(
        <p key={`p${key++}`} className="text-sm sm:text-base leading-relaxed">
          {renderInline(joined, `p${key}`)}
        </p>
      );
      paragraphBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Blank line: flush everything
    if (line.trim() === '') {
      flushList();
      flushParagraph();
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      flushParagraph();
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const cls =
        level === 1
          ? 'text-lg font-bold text-[#163422]'
          : level === 2
          ? 'text-base font-bold text-[#163422]'
          : 'text-sm font-bold text-[#163422]';
      blocks.push(
        <div key={`h${key++}`} className={`${cls} mt-2 mb-1`}>
          {renderInline(content, `h${key}`)}
        </div>
      );
      continue;
    }

    // Unordered list item
    const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== 'ul') {
        flushList();
        listBuffer = { type: 'ul', items: [] };
      }
      listBuffer.items.push(ulMatch[1]);
      continue;
    }

    // Ordered list item
    const olMatch = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== 'ol') {
        flushList();
        listBuffer = { type: 'ol', items: [] };
      }
      listBuffer.items.push(olMatch[2]);
      continue;
    }

    // Horizontal rule
    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
      flushList();
      flushParagraph();
      blocks.push(<hr key={`hr${key++}`} className="my-2 border-[#e2e3e1]" />);
      continue;
    }

    // Normal text line -> accumulate into paragraph
    flushList();
    paragraphBuffer.push(line.trim());
  }

  flushList();
  flushParagraph();

  return <div className="space-y-0.5">{blocks}</div>;
}

export default MarkdownText;
