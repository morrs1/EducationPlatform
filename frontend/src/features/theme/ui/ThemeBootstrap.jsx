import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectThemeMode } from "../model/selectors";
import { THEME_STORAGE_KEY } from "../model/themeSlice";

function ThemeBootstrap() {
  const themeMode = useSelector(selectThemeMode);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // localStorage may be unavailable in restricted browser modes
    }
  }, [themeMode]);

  return null;
}

export default ThemeBootstrap;
