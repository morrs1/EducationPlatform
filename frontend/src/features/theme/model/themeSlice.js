import { createSlice } from "@reduxjs/toolkit";

export const THEME_STORAGE_KEY = "appThemeMode";

function isThemeMode(value) {
  return value === "light" || value === "dark";
}

function resolveStoredThemeMode() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedThemeMode = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(storedThemeMode) ? storedThemeMode : null;
  } catch {
    return null;
  }
}

function resolvePreferredThemeMode() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function createInitialThemeState() {
  return {
    mode: resolveStoredThemeMode() ?? resolvePreferredThemeMode(),
  };
}

const themeSlice = createSlice({
  name: "theme",
  initialState: createInitialThemeState(),
  reducers: {
    setThemeMode: (state, action) => {
      if (!isThemeMode(action.payload)) {
        return;
      }

      state.mode = action.payload;
    },

    toggleThemeMode: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },
  },
});

export const { setThemeMode, toggleThemeMode } = themeSlice.actions;

export default themeSlice.reducer;
