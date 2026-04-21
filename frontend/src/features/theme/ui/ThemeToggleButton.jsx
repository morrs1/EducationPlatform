import { useDispatch, useSelector } from "react-redux";
import { toggleThemeMode } from "../model/themeSlice";
import { selectThemeMode } from "../model/selectors";

function ThemeToggleButton() {
  const dispatch = useDispatch();
  const themeMode = useSelector(selectThemeMode);
  const nextThemeLabel =
    themeMode === "dark" ? "Переключить на светлую тему" : "Переключить на темную тему";

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      aria-label={nextThemeLabel}
      title={nextThemeLabel}
      onClick={() => dispatch(toggleThemeMode())}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {themeMode === "dark" ? "DK" : "LT"}
      </span>
      <span className="theme-toggle-copy">
        <span className="theme-toggle-label">Тема</span>
        <span className="theme-toggle-value">
          {themeMode === "dark" ? "Тёмная" : "Светлая"}
        </span>
      </span>
    </button>
  );
}

export default ThemeToggleButton;
