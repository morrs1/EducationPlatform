import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

function formatMessageTime(value) {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function AssistantPanel({
  title,
  subtitle,
  messages,
  status,
  error,
  onSubmitMessage,
  onClose,
}) {
  const [messageInput, setMessageInput] = useState("");
  const [maxInputHeight, setMaxInputHeight] = useState(0);
  const [isScrollReady, setIsScrollReady] = useState(false);
  const panelRef = useRef(null);
  const scrollViewportRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const hasMessages = messages.length > 0;
  const isLoading = status === "loading";
  const canSubmit = messageInput.trim().length > 0 && !isLoading;

  const normalizedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        formattedTime: formatMessageTime(message.createdAt),
      })),
    [messages],
  );

  function scrollMessagesToBottom() {
    const scrollViewport = scrollViewportRef.current;

    if (!scrollViewport) {
      return;
    }

    scrollViewport.scrollTop = scrollViewport.scrollHeight;
  }

  useLayoutEffect(() => {
    scrollMessagesToBottom();

    let nestedFrameId = null;

    const frameId = requestAnimationFrame(() => {
      scrollMessagesToBottom();

      nestedFrameId = requestAnimationFrame(() => {
        scrollMessagesToBottom();
      });
    });

    const timeoutId = window.setTimeout(() => {
      scrollMessagesToBottom();
      setIsScrollReady(true);
    }, 260);

    return () => {
      cancelAnimationFrame(frameId);

      if (nestedFrameId !== null) {
        cancelAnimationFrame(nestedFrameId);
      }

      window.clearTimeout(timeoutId);
    };
  }, []);

  useLayoutEffect(() => {
    if (!hasMessages && !isLoading) {
      return undefined;
    }

    scrollMessagesToBottom();

    const frameId = requestAnimationFrame(() => {
      scrollMessagesToBottom();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [hasMessages, isLoading, normalizedMessages.length]);

  useEffect(() => {
    const panelElement = panelRef.current;

    if (!panelElement) {
      return undefined;
    }

    function updateMaxInputHeight() {
      const panelHeight = panelElement.getBoundingClientRect().height;
      setMaxInputHeight(Math.max(56, Math.floor(panelHeight / 3)));
    }

    updateMaxInputHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateMaxInputHeight);

      return () => {
        window.removeEventListener("resize", updateMaxInputHeight);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      updateMaxInputHeight();
    });

    resizeObserver.observe(panelElement);
    window.addEventListener("resize", updateMaxInputHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMaxInputHeight);
    };
  }, []);

  useLayoutEffect(() => {
    const textareaElement = textareaRef.current;

    if (!textareaElement) {
      return;
    }

    const computedStyles = window.getComputedStyle(textareaElement);
    const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 28;
    const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
    const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom);
    const nextMaxHeight =
      maxInputHeight > 0
        ? Math.max(singleLineHeight, maxInputHeight)
        : singleLineHeight;

    textareaElement.style.height = "0px";

    const nextHeight = Math.min(textareaElement.scrollHeight, nextMaxHeight);

    textareaElement.style.height = `${Math.max(singleLineHeight, nextHeight)}px`;
    textareaElement.style.overflowY =
      textareaElement.scrollHeight > nextMaxHeight ? "auto" : "hidden";
  }, [messageInput, maxInputHeight]);

  function submitCurrentMessage() {
    const normalizedMessage = messageInput.trim();

    if (!normalizedMessage) {
      return;
    }

    onSubmitMessage(normalizedMessage);
    setMessageInput("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitCurrentMessage();
  }

  function handleInputKeyDown(event) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    submitCurrentMessage();
  }

  return (
    <aside ref={panelRef} className="assistant-panel">
      <div className="assistant-panel-header">
        <div className="assistant-panel-heading">
          <p className="assistant-panel-label">Assistant</p>
          <h2 className="assistant-panel-title">{title}</h2>
          {subtitle ? (
            <p className="assistant-panel-subtitle">{subtitle}</p>
          ) : null}
        </div>

        <button
          type="button"
          className="assistant-panel-close-btn"
          onClick={onClose}
          aria-label="Закрыть чат ассистента"
        >
          ✕
        </button>
      </div>

      <div className="assistant-panel-body">
        <div
          ref={scrollViewportRef}
          className={`assistant-panel-scroll ${
            isScrollReady ? "assistant-panel-scroll-ready" : ""
          }`}
        >
          {!hasMessages ? (
            <div className="assistant-panel-empty">
              <p className="assistant-panel-empty-title">
                Спросите ассистента по текущему шагу
              </p>
              <p className="assistant-panel-empty-text">
                Можно уточнить теорию, попросить объяснить формулировку задания
                или помочь разобраться, с чего начать решение.
              </p>
            </div>
          ) : (
            <div className="assistant-messages">
              {normalizedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`assistant-message-row assistant-message-row-${message.role}`}
                >
                  <article
                    className={`assistant-message assistant-message-${message.role}`}
                  >
                    <div className="assistant-message-meta">
                      <span className="assistant-message-role">
                        {message.role === "assistant" ? "Ассистент" : "Вы"}
                      </span>
                      {message.formattedTime ? (
                        <span className="assistant-message-time">
                          {message.formattedTime}
                        </span>
                      ) : null}
                    </div>

                    <p className="assistant-message-text">{message.text}</p>
                  </article>
                </div>
              ))}

              {isLoading ? (
                <div className="assistant-message-row assistant-message-row-assistant">
                  <div className="assistant-message assistant-message-assistant assistant-message-pending">
                    <div
                      className="assistant-typing-indicator"
                      aria-label="Ассистент печатает"
                    >
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          )}

          {error ? (
            <div className="assistant-panel-error">{error}</div>
          ) : null}
        </div>
      </div>

      <form className="assistant-panel-form" onSubmit={handleSubmit}>
        <div className="assistant-panel-composer">
          <textarea
            ref={textareaRef}
            className="assistant-panel-input"
            placeholder="Напишите вопрос по текущему шагу"
            value={messageInput}
            onChange={(event) => setMessageInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            rows={1}
          />

          <div className="assistant-panel-form-footer">
            <p className="assistant-panel-form-hint">
              <span>Enter</span> отправить, <span>Shift + Enter</span> абзац
            </p>

            <button
              type="submit"
              className="assistant-panel-submit-btn"
              disabled={!canSubmit}
              aria-label={
                isLoading ? "Ассистент формирует ответ" : "Отправить сообщение"
              }
            >
              <span className="assistant-panel-submit-icon" aria-hidden="true">
                {isLoading ? "…" : "↑"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
}

export default AssistantPanel;
