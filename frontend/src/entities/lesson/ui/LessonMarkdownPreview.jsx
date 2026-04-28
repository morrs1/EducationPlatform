function renderInlineMarkdown(text) {
  const lines = text.split("\n");

  return lines.flatMap((line, lineIndex) => {
    const parts = line
    .split(/(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
      .map((part, partIndex) => {
        const key = `${lineIndex}-${partIndex}-${part}`;

        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={key} className="lesson-markdown-inline-code">
              {part.slice(1, -1)}
            </code>
          );
        }

        if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
          const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

          if (linkMatch) {
            return (
              <a
                key={key}
                href={linkMatch[2]}
                target="_blank"
                rel="noreferrer"
                className="lesson-markdown-link"
              >
                {linkMatch[1]}
              </a>
            );
          }
        }

        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={key}>{part.slice(2, -2)}</strong>;
        }

        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={key}>{part.slice(1, -1)}</em>;
        }

        return <span key={key}>{part}</span>;
      });

    if (lineIndex === lines.length - 1) {
      return parts;
    }

    return [
      ...parts,
      <br key={`line-break-${lineIndex}`} />,
    ];
  });
}

function renderMarkdownBlock(block, index) {
  if (block.type === "spacer") {
    return (
      <div
        key={`spacer-${index}`}
        className="lesson-markdown-spacer"
        style={{
          height: `${Math.max(1, block.lines ?? 1) * 1.75}rem`,
        }}
        aria-hidden="true"
      />
    );
  }

  if (block.type === "heading-1") {
    return (
      <h2 key={`heading-1-${index}`} className="lesson-markdown-h1">
        {renderInlineMarkdown(block.content)}
      </h2>
    );
  }

  if (block.type === "heading-2") {
    return (
      <h3 key={`heading-2-${index}`} className="lesson-markdown-h2">
        {renderInlineMarkdown(block.content)}
      </h3>
    );
  }

  if (block.type === "unordered-list") {
    return (
      <ul key={`unordered-list-${index}`} className="lesson-markdown-list">
        {block.items.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol
        key={`ordered-list-${index}`}
        className="lesson-markdown-list-decimal"
      >
        {block.items.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ol>
    );
  }

  if (block.type === "blockquote") {
    return (
      <blockquote key={`blockquote-${index}`} className="lesson-markdown-quote">
        {renderInlineMarkdown(block.content)}
      </blockquote>
    );
  }

  if (block.type === "code-block") {
    return (
      <div key={`code-block-${index}`} className="lesson-markdown-code-wrap">
        {block.language ? (
          <div className="lesson-markdown-code-label">{block.language}</div>
        ) : null}

        <pre className="lesson-markdown-code">
          <code>{block.content}</code>
        </pre>
      </div>
    );
  }

  return (
    <p key={`paragraph-${index}`} className="lesson-markdown-paragraph">
      {renderInlineMarkdown(block.content)}
    </p>
  );
}

function LessonMarkdownPreview({ blocks, className = "lesson-markdown" }) {
  return (
    <div className={className}>
      {blocks.map((block, index) => renderMarkdownBlock(block, index))}
    </div>
  );
}

export default LessonMarkdownPreview;
