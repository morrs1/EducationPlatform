import { useNavigate } from "react-router";
import { isUuid, normalizeText } from "../lib/gatewayValues";

/**
 * UUID-автор: при `viewerCanOpenAuthorProfile` — переход на `/users/:id`
 * программно (а не вложенным `<a>`), чтобы клик не активировал родительский
 * `<Link>` карточки курса. Для гостя — `<button>` с вызовом
 * `onAuthorProfileAuthRequired(authorId)`.
 * Не-UUID — подпись текстом (моки каталога).
 */
function AuthorLink({
  authorId,
  authorName,
  className = "",
  tabIndex,
  onClick,
  viewerCanOpenAuthorProfile = false,
  onAuthorProfileAuthRequired,
}) {
  const navigate = useNavigate();
  const trimmedName = normalizeText(authorName);
  const id = normalizeText(authorId);
  const label =
    trimmedName || (isUuid(id) ? "Преподаватель" : "Автор курса");

  if (!isUuid(id)) {
    return (
      <span className={className} tabIndex={tabIndex}>
        {label}
      </span>
    );
  }

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);

    if (viewerCanOpenAuthorProfile) {
      navigate(`/users/${id}`);
      return;
    }

    onAuthorProfileAuthRequired?.(id);
  }

  return (
    <button
      type="button"
      className={className}
      tabIndex={tabIndex ?? 0}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}

export default AuthorLink;
