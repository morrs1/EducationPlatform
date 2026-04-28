export function parseLessonMarkdown(markdown) {
  if (!markdown.trim()) {
    return [];
  }

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      const emptyLineStart = index;

      while (index < lines.length && !lines[index].trim()) {
        index += 1;
      }

      const emptyLineCount = index - emptyLineStart;
      const hasRenderedBlocks = blocks.length > 0;
      const hasUpcomingContent = index < lines.length;

      if (hasRenderedBlocks && hasUpcomingContent && emptyLineCount > 1) {
        blocks.push({
          type: "spacer",
          lines: emptyLineCount - 1,
        });
      }

      continue;
    }

    if (trimmedLine.startsWith("```")) {
      const language = trimmedLine.slice(3).trim();
      const codeLines = [];

      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({
        type: "code-block",
        language,
        content: codeLines.join("\n"),
      });

      continue;
    }

    if (trimmedLine.startsWith("> ")) {
      const quoteLines = [];

      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({
        type: "blockquote",
        content: quoteLines.join("\n"),
      });

      continue;
    }

    if (trimmedLine.startsWith("# ")) {
      blocks.push({
        type: "heading-1",
        content: trimmedLine.slice(2).trim(),
      });
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("## ")) {
      blocks.push({
        type: "heading-2",
        content: trimmedLine.slice(3).trim(),
      });
      index += 1;
      continue;
    }

    if (/^- /.test(trimmedLine)) {
      const items = [];

      while (index < lines.length && /^- /.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^- /, "").trim());
        index += 1;
      }

      blocks.push({
        type: "unordered-list",
        items,
      });

      continue;
    }

    if (/^\d+\.\s/.test(trimmedLine)) {
      const items = [];

      while (index < lines.length && /^\d+\.\s/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s/, "").trim());
        index += 1;
      }

      blocks.push({
        type: "ordered-list",
        items,
      });

      continue;
    }

    const paragraphLines = [];

    while (index < lines.length) {
      const candidate = lines[index].trim();

      if (
        !candidate ||
        candidate.startsWith("# ") ||
        candidate.startsWith("## ") ||
        candidate.startsWith("```") ||
        candidate.startsWith("> ") ||
        /^- /.test(candidate) ||
        /^\d+\.\s/.test(candidate)
      ) {
        break;
      }

      paragraphLines.push(candidate);
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      content: paragraphLines.join("\n"),
    });
  }

  return blocks;
}
