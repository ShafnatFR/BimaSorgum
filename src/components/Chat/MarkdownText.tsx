import React from 'react';

/**
 * Lightweight markdown renderer for the AI chat responses (BIMA AI returns
 * markdown: bold, italic, headings, bullet & numbered lists, links, tables, blockquotes, code).
 * No external dependency — handles the full subset the backend emits.
 */

/** Parse **bold** and *italic* inline, and [text](url) links. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Order: inline code (`…`) → bold (**…**) → italic (*…* or _…_) → links ([…](…))
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(text.slice(lastIndex, m.index));
    }
    const token = m[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code key={`${keyPrefix}-c${i++}`} className="bg-[#e2e3e1]/70 text-[#163422] px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
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
    } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_') && token.length > 2)) {
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

/** Strip leading > from a blockquote line. Handles `> `, `>`, `>text`. */
function stripQuotePrefix(line: string): string {
  const m = line.match(/^\s*>\s?(.*)$/);
  return m ? m[1] : line;
}

function MarkdownText({ text }: { text: string }) {
  if (!text) return null;

  // 1. Normalize line breaks and multiple empty lines
  const normalized = text.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n');

  // 2. Pre-process lines safely:
  // - Strip bare "#" artifacts
  // - Only split multiple inline emoji bullets on plain text lines (NOT inside tables, quotes, code, or headings)
  const rawLines = normalized.split('\n');
  const safeLines: string[] = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();

    // Bare "##" or "###" with nothing after → remove
    if (/^#{1,6}$/.test(trimmed)) {
      continue;
    }

    // Do NOT alter table lines (starting with '|'), headings, quotes, code blocks, or horizontal rules
    if (
      trimmed.startsWith('|') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('>') ||
      trimmed.startsWith('```') ||
      /^[-*_]{3,}$/.test(trimmed)
    ) {
      safeLines.push(rawLine);
      continue;
    }

    // Check for multiple emoji bullets on a single plain text line
    const bulletMatches = trimmed.match(/[🌱🌿🍽️✅❌📌💡🔹🔸▪️▫️•◦⁃▶️⭐🌟✨🔥💪🎯📝🧪🔬🌾📊🏆👍👎⚡🎨🛠️🔧]/g);
    if (bulletMatches && bulletMatches.length > 1) {
      const parts = trimmed.split(/(?=[🌱🌿🍽️✅❌📌💡🔹🔸▪️▫️•◦⁃▶️⭐🌟✨🔥💪🎯📝🧪🔬🌾📊🏆👍👎⚡🎨🛠️🔧]\s+)/).filter(Boolean);
      if (parts.length > 1) {
        for (const p of parts) {
          if (p.trim()) safeLines.push(p.trim());
        }
        continue;
      }
    }

    safeLines.push(rawLine);
  }

  const blocks: React.ReactNode[] = [];
  let listBuffer: { type: 'ul' | 'ol'; items: string[]; startNum?: number } | null = null;
  let paragraphBuffer: string[] = [];
  let tableBuffer: string[] | null = null;
  let quoteBuffer: string[] | null = null;
  let codeBuffer: { lang: string; lines: string[] } | null = null;
  let key = 0;

  const isTableSeparator = (line: string): boolean => {
    const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    if (!inner) return false;
    const cells = inner.split('|');
    return cells.length > 0 && cells.every((cell) => /^[\s:|-]+$/.test(cell) && cell.includes('-'));
  };

  const parseTableRow = (line: string): string[] => {
    let l = line.trim();
    if (l.startsWith('|')) l = l.slice(1);
    if (l.endsWith('|')) l = l.slice(0, -1);
    return l.split('|').map((c) => c.trim());
  };

  const flushTable = () => {
    if (!tableBuffer || tableBuffer.length === 0) {
      tableBuffer = null;
      return;
    }

    // Remove any trailing or leading purely blank lines in table buffer
    const validRows = tableBuffer.filter((r) => r.trim().length > 0);
    if (validRows.length === 0) {
      tableBuffer = null;
      return;
    }

    // Filter out rows that are purely separator lines to check data content
    const nonSeparatorRows = validRows.filter((r) => !isTableSeparator(r));
    if (nonSeparatorRows.length === 0) {
      // Entire buffer was just |---|---| -> discard
      tableBuffer = null;
      return;
    }

    // Header is the first non-separator row
    let headerRow = validRows[0];
    let startIdx = 1;
    if (isTableSeparator(headerRow)) {
      if (validRows.length > 1) {
        headerRow = validRows[1];
        startIdx = 2;
      } else {
        tableBuffer = null;
        return;
      }
    } else if (validRows.length > 1 && isTableSeparator(validRows[1])) {
      startIdx = 2;
    }

    const headerCells = parseTableRow(headerRow);
    // Header must have at least one cell with meaningful characters (not all dashed/blank)
    const hasMeaningfulHeader = headerCells.some(
      (c) => c.length > 0 && !/^[\s:|-]+$/.test(c)
    );
    if (!hasMeaningfulHeader) {
      tableBuffer = null;
      return;
    }

    const bodyRows = validRows
      .slice(startIdx)
      .filter((r) => !isTableSeparator(r))
      .map(parseTableRow)
      .filter((row) => row.some((c) => c.length > 0));

    blocks.push(
      <div key={`t${key++}`} className="my-2 overflow-x-auto">
        <table className="w-full text-xs sm:text-sm border-collapse rounded-xl overflow-hidden border border-[#e2e3e1]">
          <thead>
            <tr className="bg-[#163422] text-white">
              {headerCells.map((cell, idx) => (
                <th
                  key={idx}
                  className="px-3 py-2 text-left font-bold border border-[#163422]/40"
                >
                  {renderInline(cell, `th${key}-${idx}`)}
                </th>
              ))}
            </tr>
          </thead>
          {bodyRows.length > 0 && (
            <tbody>
              {bodyRows.map((row, ridx) => (
                <tr
                  key={ridx}
                  className={ridx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f2]/70'}
                >
                  {row.map((cell, cidx) => (
                    <td
                      key={cidx}
                      className="px-3 py-2 border border-[#e2e3e1] text-[#1A1C1B] align-top"
                    >
                      {renderInline(cell, `td${key}-${ridx}-${cidx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    );
    tableBuffer = null;
  };

  const flushQuote = () => {
    if (!quoteBuffer || quoteBuffer.length === 0) {
      quoteBuffer = null;
      return;
    }
    const lines = quoteBuffer.map(stripQuotePrefix).filter((l) => l.trim() !== '');
    if (lines.length === 0) {
      quoteBuffer = null;
      return;
    }
    blocks.push(
      <blockquote
        key={`bq${key++}`}
        className="border-l-[3px] border-[#fdc65c] bg-[#fef9ed]/60 pl-4 pr-3 py-2 my-2 rounded-r-lg italic text-sm sm:text-base leading-relaxed text-justify text-[#424843]"
      >
        {lines.map((ln, idx) => (
          <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
            {renderInline(ln, `bq${key}-${idx}`)}
          </p>
        ))}
      </blockquote>
    );
    quoteBuffer = null;
  };

  const flushCode = () => {
    if (!codeBuffer || codeBuffer.lines.length === 0) {
      codeBuffer = null;
      return;
    }
    blocks.push(
      <pre
        key={`pre${key++}`}
        className="bg-[#1A1C1B] text-[#e2e3e1] rounded-xl px-4 py-3 my-2 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed"
      >
        <code>{codeBuffer.lines.join('\n')}</code>
      </pre>
    );
    codeBuffer = null;
  };

  const flushList = () => {
    if (!listBuffer || listBuffer.items.length === 0) {
      listBuffer = null;
      return;
    }
    if (listBuffer.type === 'ul') {
      blocks.push(
        <ul key={`l${key++}`} className="list-disc pl-5 space-y-1 my-1.5">
          {listBuffer.items.map((item, idx) => (
            <li key={idx} className="text-sm sm:text-base leading-relaxed text-justify">
              {renderInline(item, `ul${key}-${idx}`)}
            </li>
          ))}
        </ul>
      );
    } else {
      blocks.push(
        <ol key={`l${key++}`} start={listBuffer.startNum || 1} className="list-decimal pl-5 space-y-1 my-1.5">
          {listBuffer.items.map((item, idx) => (
            <li key={idx} className="text-sm sm:text-base leading-relaxed text-justify">
              {renderInline(item, `ol${key}-${idx}`)}
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
        <p key={`p${key++}`} className="text-sm sm:text-base leading-relaxed text-justify">
          {renderInline(joined, `p${key}`)}
        </p>
      );
      paragraphBuffer = [];
    }
  };

  const flushAll = () => {
    flushTable();
    flushCode();
    flushQuote();
    flushList();
    flushParagraph();
  };

  for (const raw of safeLines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    // Blank line: flush table, quote, paragraph
    if (trimmed === '') {
      flushTable();
      flushCode();
      flushQuote();
      flushParagraph();
      continue;
    }

    // Fenced code block (```)
    if (/^\s*```/.test(line)) {
      if (codeBuffer) {
        flushCode();
      } else {
        flushAll();
        const lang = trimmed.slice(3).trim();
        codeBuffer = { lang, lines: [] };
      }
      continue;
    }

    // Inside a fenced code block
    if (codeBuffer) {
      codeBuffer.lines.push(raw);
      continue;
    }

    // Table row (starts with | or is table line)
    if (trimmed.startsWith('|')) {
      flushList();
      flushParagraph();
      if (!tableBuffer) tableBuffer = [];
      tableBuffer.push(trimmed);
      continue;
    }

    // If current line is not a table row, flush in-progress table
    if (tableBuffer && tableBuffer.length > 0) {
      flushTable();
    }

    // Blockquote (line starting with >)
    if (/^\s*>/.test(line)) {
      flushList();
      flushParagraph();
      if (!quoteBuffer) quoteBuffer = [];
      quoteBuffer.push(line);
      continue;
    }

    // If current line is not blockquote, flush in-progress quote
    if (quoteBuffer && quoteBuffer.length > 0) {
      flushQuote();
    }

    // Heading (##, ###, ####, etc — up to h6)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
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

    // Unordered list item (standard markers or emoji bullets)
    const ulMatch =
      line.match(/^\s*[-*+]\s+(.*)$/) ||
      line.match(/^\s*[🌱🌿🍽️✅❌📌💡🔹🔸▪️▫️•◦⁃▶️⭐🌟✨🔥💪🎯📝🧪🔬🌾📊🏆👍👎⚡🎨🛠️🔧]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== 'ul') {
        flushList();
        listBuffer = { type: 'ul', items: [] };
      }
      listBuffer.items.push(ulMatch[1]);
      continue;
    }

    // Ordered list item (1., 2., 1))
    const olMatch = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== 'ol') {
        flushList();
        listBuffer = { type: 'ol', items: [], startNum: parseInt(olMatch[1], 10) };
      }
      listBuffer.items.push(olMatch[2]);
      continue;
    }

    // Horizontal rule
    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
      flushAll();
      blocks.push(<hr key={`hr${key++}`} className="my-2 border-[#e2e3e1]" />);
      continue;
    }

    // Normal text line -> clean residual artifacts
    let cleanLine = trimmed;
    cleanLine = cleanLine.replace(/^#{1,6}\s?/, '');
    // Ignore standalone table separator artifacts
    if (/^\|?[-:\s|]+\|?$/.test(cleanLine) && cleanLine.includes('-')) {
      cleanLine = '';
    }

    if (cleanLine) {
      flushList();
      paragraphBuffer.push(cleanLine);
    }
  }

  flushAll();

  return <div className="space-y-0.5">{blocks}</div>;
}

export default MarkdownText;
