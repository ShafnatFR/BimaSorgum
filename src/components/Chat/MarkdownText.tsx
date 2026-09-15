import React from 'react';

/**
 * Lightweight markdown renderer for the AI chat responses (BIMA AI returns
 * markdown: bold, italic, headings, bullet & numbered lists, links).
 * No external dependency — handles the subset the backend actually emits.
 */

/** Parse **bold** and *italic* inline, and [text](url) links. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Order: inline code (`…`) → bold (**…**) → italic (*…*) → links ([…](…))
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
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

/** Strip leading > from a blockquote line. Handles `> `, `>`, `>text`. */
function stripQuotePrefix(line: string): string {
  // Match optional leading whitespace, then > then optional space
  const m = line.match(/^\s*>\s?(.*)$/);
  return m ? m[1] : line;
}

function MarkdownText({ text }: { text: string }) {
  // 🔧 Pre-process: split lines with multiple emoji bullets into separate lines
  const EMOJI_BULLETS = /[🌱🌿🍽️✅❌📌💡🔹🔸▪️▫️•◦⁃▶️⭐🌟✨🔥💪🎯📝🧪🔬🌾📊🏆👍👎⚡🎨🛠️🔧]/g;
  const preprocessed = text.replace(/^(\s*)(\S+\s+)((?:[🌱🌿🍽️✅❌📌💡🔹🔸▪️▫️•◦⁃▶️⭐🌟✨🔥💪🎯📝🧪🔬🌾📊🏆👍👎⚡🎨🛠️🔧]\s+.{3,}(?=\s+[🌱🌿🍽️✅❌📌💡🔹🔸▪️▫️•◦⁃▶️⭐🌟✨🔥💪🎯📝🧪🔬🌾📊🏆👍👎⚡🎨🛠️🔧]|$))+)/gm, (match) => {
    const parts = match.split(/(?=\s*[🌱🌿🍽️✅❌📌💡🔹🔸▪️▫️•◦⁃▶️⭐🌟✨🔥💪🎯📝🧪🔬🌾📊🏆👍👎⚡🎨🛠️🔧]\s+)/).filter(Boolean);
    if (parts.length > 1) return parts.map((p: string) => p.trim()).join('\n');
    return match;
  });
  const lines = preprocessed.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuffer: { type: 'ul' | 'ol'; items: string[]; startNum?: number } | null = null;
  let paragraphBuffer: string[] = [];
  // Table buffer: raw "| ... |" rows until flushed
  let tableBuffer: string[] | null = null;
  // Blockquote buffer: consecutive "> ..." lines
    let quoteBuffer: string[] | null = null;
    // Fenced code block buffer: triple-backtick ``` ... ```
    let codeBuffer: { lang: string; lines: string[] } | null = null;
    let key = 0;

  const isTableSeparator = (line: string) => {
    // Matches rows like | --- | :---: | ---: | (dashes/colons/spaces only inside pipes)
    const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    return inner.split('|').every((cell) => /^[\s:|-]+$/.test(cell) && cell.includes('-'));
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
        // Header = first row; second row (separator) is skipped if present.
        const header = parseTableRow(tableBuffer[0]);
        let startIdx = 1;
        if (tableBuffer.length > 1 && isTableSeparator(tableBuffer[1])) {
          startIdx = 2;
        }
        const body = tableBuffer.slice(startIdx)
          .map(parseTableRow)
          .filter((row) => row.length >= 2 && row.some((c) => c.trim().length > 0)); // 🔧 skip malformed/truncated rows

      blocks.push(
        <div key={`t${key++}`} className="my-2 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#163422] text-white">
                {header.map((cell, idx) => (
                  <th
                    key={idx}
                    className="px-3 py-2 text-left font-bold whitespace-nowrap border border-[#163422]/40"
                  >
                    {renderInline(cell, `th${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ridx) => (
                <tr
                  key={ridx}
                  className={ridx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f2]/70'}
                >
                  {row.map((cell, cidx) => (
                    <td
                      key={cidx}
                      className="px-3 py-2 border border-[#e2e3e1] text-[#1A1C1B] align-top"
                    >
                      {renderInline(cell, `td${ridx}-${cidx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
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
              {renderInline(ln, `bq${idx}`)}
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
              <pre key={`pre${key++}`} className="bg-[#1A1C1B] text-[#e2e3e1] rounded-xl px-4 py-3 my-2 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
                <code>{codeBuffer.lines.join('\n')}</code>
              </pre>
            );
            codeBuffer = null;
          };

        const flushList = () => {
    if (!listBuffer) return;
    if (listBuffer.type === 'ul') {
      blocks.push(
        <ul key={`l${key++}`} className="list-disc pl-5 space-y-1 my-1.5">
          {listBuffer.items.map((item, idx) => (
            <li key={idx} className="text-sm sm:text-base leading-relaxed text-justify">
              {renderInline(item, `ul${idx}`)}
            </li>
          ))}
        </ul>
      );
    } else {
          blocks.push(
            <ol key={`l${key++}`} start={listBuffer.startNum || 1} className="list-decimal pl-5 space-y-1 my-1.5">
              {listBuffer.items.map((item, idx) => (
                <li key={idx} className="text-sm sm:text-base leading-relaxed text-justify">
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

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Blank line: flush everything
        if (line.trim() === '') {
                  // 🔧 Don't flush lists on blank lines — OL items separated by blank lines
                  // should stay in the same list to preserve numbering
                  flushTable();
                  flushCode();
                  flushQuote();
                  flushParagraph();
                  continue;
                }

        // Fenced code block (```)
        if (/^\s*```/.test(line)) {
          if (codeBuffer) {
            // closing fence → flush code block
            flushCode();
          } else {
            // opening fence → start code buffer
            flushAll();
            const lang = line.trim().slice(3).trim();
            codeBuffer = { lang, lines: [] };
          }
          continue;
        }

        // Inside a fenced code block → accumulate raw lines
        if (codeBuffer) {
          codeBuffer.lines.push(raw); // preserve original line endings
          continue;
        }

        // Table row (starts with a pipe)
    if (line.trim().startsWith('|')) {
      flushList();
      flushParagraph();
      // Separator row after header: keep accumulating, it's part of table
      if (!tableBuffer) tableBuffer = [];
      tableBuffer.push(line.trim());
      continue;
    }

    // Any non-table line ends an in-progress table
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

        // Any non-quote line ends an in-progress blockquote
        if (quoteBuffer && quoteBuffer.length > 0) {
          flushQuote();
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

    // Unordered list item (standard markers or emoji bullets)
        const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/) || line.match(/^\s*[🌱🌿🍽️✅❌📌💡🔹🔸▪️▫️•◦⁃▶️⭐🌟✨🔥💪🎯📝🧪🔬🌾📊🏆👍👎⚡🎨🛠️🔧💡📌🎯]\s+(.*)$/);
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

    // Normal text line -> accumulate into paragraph
    flushList();
    paragraphBuffer.push(line.trim());
  }

  flushAll();

  return <div className="space-y-0.5">{blocks}</div>;
}

export default MarkdownText;
