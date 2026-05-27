function getUnorderedListItem(line) {
  const match = line.trim().match(/^[-*+]\s+(.+)$/);

  return match ? match[1].trim() : null;
}

function getOrderedListItem(line) {
  const match = line.trim().match(/^\d+[.)]\s+(.+)$/);

  return match ? match[1].trim() : null;
}

function findNextContentLineIndex(lines, index) {
  let nextIndex = index;

  while (nextIndex < lines.length && !lines[nextIndex].trim()) {
    nextIndex += 1;
  }

  return nextIndex;
}

function collectUnorderedList(lines, startIndex) {
  const items = [];
  let index = startIndex;

  while (index < lines.length) {
    const item = getUnorderedListItem(lines[index]);

    if (item !== null) {
      items.push(item);
      index += 1;
      continue;
    }

    if (!lines[index].trim()) {
      const nextContentIndex = findNextContentLineIndex(lines, index);

      if (
        nextContentIndex < lines.length &&
        getUnorderedListItem(lines[nextContentIndex]) !== null
      ) {
        index = nextContentIndex;
        continue;
      }
    }

    break;
  }

  return {
    block: {
      type: "unordered-list",
      items,
    },
    nextIndex: index,
  };
}

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

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      blocks.push({
        type: `heading-${Math.min(headingMatch[1].length, 3)}`,
        content: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (getUnorderedListItem(trimmedLine) !== null) {
      const { block, nextIndex } = collectUnorderedList(lines, index);
      blocks.push(block);
      index = nextIndex;
      continue;
    }

    if (getOrderedListItem(trimmedLine) !== null) {
      const items = [];
      let currentItem = null;

      while (index < lines.length) {
        const item = getOrderedListItem(lines[index]);

        if (item !== null) {
          currentItem = {
            content: item,
            children: [],
          };
          items.push(currentItem);
          index += 1;
          continue;
        }

        if (getUnorderedListItem(lines[index]) !== null && currentItem) {
          const { block, nextIndex } = collectUnorderedList(lines, index);
          currentItem.children.push(block);
          index = nextIndex;
          continue;
        }

        if (!lines[index].trim()) {
          const nextContentIndex = findNextContentLineIndex(lines, index);

          if (
            nextContentIndex < lines.length &&
            getOrderedListItem(lines[nextContentIndex]) !== null
          ) {
            index = nextContentIndex;
            continue;
          }

          if (
            currentItem &&
            nextContentIndex < lines.length &&
            getUnorderedListItem(lines[nextContentIndex]) !== null
          ) {
            index = nextContentIndex;
            continue;
          }
        }

        break;
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
        /^#{1,6}\s+/.test(candidate) ||
        candidate.startsWith("```") ||
        candidate.startsWith("> ") ||
        getUnorderedListItem(candidate) !== null ||
        getOrderedListItem(candidate) !== null
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
