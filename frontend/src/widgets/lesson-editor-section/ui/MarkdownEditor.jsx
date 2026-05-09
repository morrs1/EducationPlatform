import { useMemo, useRef } from "react";

import {
  LessonMarkdownPreview,
  parseLessonMarkdown,
} from "../../../entities/lesson";
import {
  insertCodeBlock,
  insertLink,
  prefixSelectedLines,
  wrapSelection,
} from "../model/lessonEditorModel";

function MarkdownEditor({ value, onChange, disabled = false }) {
  const textareaRef = useRef(null);
  const blocks = useMemo(() => parseLessonMarkdown(value), [value]);

  function applyTransform(transformer) {
    const textarea = textareaRef.current;

    if (!textarea || disabled) {
      return;
    }

    const result = transformer(
      value,
      textarea.selectionStart,
      textarea.selectionEnd,
    );

    onChange(result.value);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  return (
    <div className="lesson-rich-editor">
      <div className="lesson-rich-editor-toolbar">
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              prefixSelectedLines(currentValue, start, end, (line) =>
                line.startsWith("# ") ? line : `# ${line}`,
              ),
            )
          }
          disabled={disabled}
        >
          H1
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              prefixSelectedLines(currentValue, start, end, (line) =>
                line.startsWith("## ") ? line : `## ${line}`,
              ),
            )
          }
          disabled={disabled}
        >
          H2
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              wrapSelection(
                currentValue,
                start,
                end,
                "**",
                "**",
                "жирный текст",
              ),
            )
          }
          disabled={disabled}
        >
          B
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              wrapSelection(currentValue, start, end, "*", "*", "курсив"),
            )
          }
          disabled={disabled}
        >
          I
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              wrapSelection(currentValue, start, end, "`", "`", "code"),
            )
          }
          disabled={disabled}
        >
          ``
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              prefixSelectedLines(currentValue, start, end, (line) =>
                line.startsWith("> ") ? line : `> ${line}`,
              ),
            )
          }
          disabled={disabled}
        >
          Quote
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              prefixSelectedLines(currentValue, start, end, (line) =>
                line.startsWith("- ") ? line : `- ${line}`,
              ),
            )
          }
          disabled={disabled}
        >
          • List
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              prefixSelectedLines(
                currentValue,
                start,
                end,
                (_line, index) => `${index + 1}. ${_line}`,
              ),
            )
          }
          disabled={disabled}
        >
          1. List
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              insertCodeBlock(currentValue, start, end),
            )
          }
          disabled={disabled}
        >
          Block
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              insertLink(currentValue, start, end),
            )
          }
          disabled={disabled}
        >
          Link
        </button>
      </div>

      <div className="lesson-rich-editor-panels">
        <div className="lesson-rich-editor-panel">
          <div className="lesson-rich-editor-panel-head">
            <strong>Текст урока</strong>
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="lesson-rich-editor-source"
            spellCheck={false}
            disabled={disabled}
            placeholder="Напишите содержание урока..."
          />
        </div>

        <div className="lesson-rich-editor-panel">
          <div className="lesson-rich-editor-panel-head">
            <strong>Предпросмотр</strong>
            <span>Так текст увидит студент</span>
          </div>
          <div className="lesson-rich-editor-preview-shell">
            {blocks.length ? (
              <LessonMarkdownPreview
                blocks={blocks}
                className="lesson-markdown lesson-rich-editor-preview"
              />
            ) : (
              <div className="lesson-editor-empty-panel compact">
                <strong className="lesson-editor-empty-panel-title">
                  Пока пусто
                </strong>
                <p className="lesson-editor-empty-panel-text">
                  Добавьте заголовки, текст, списки и блоки кода, чтобы сразу
                  увидеть, как урок будет выглядеть после сохранения.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarkdownEditor;
