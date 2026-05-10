export function parseCourseDescriptionMarkdown(markdown) {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim());

      if (block.startsWith("# ")) {
        return { type: "heading-1", content: block.slice(2).trim() };
      }

      if (block.startsWith("## ")) {
        return { type: "heading-2", content: block.slice(3).trim() };
      }

      if (lines.every((line) => line.startsWith("- "))) {
        return {
          type: "list",
          items: lines.map((line) => line.slice(2).trim()),
        };
      }

      return {
        type: "paragraph",
        content: lines.join(" "),
      };
    });
}
