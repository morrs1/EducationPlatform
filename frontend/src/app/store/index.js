import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "../../features/auth";
import { catalogReducer } from "../../features/catalog";
import { lessonSessionReducer } from "../../features/lesson-session";
import { viewerReducer } from "../../features/viewer";
import { assistantReducer } from "../../features/assistant";
import { themeReducer } from "../../features/theme";
import {
  attachStorePersistence,
  loadPreloadedState,
} from "./storePersistence";

const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    lessonSession: lessonSessionReducer,
    viewer: viewerReducer,
    assistant: assistantReducer,
    theme: themeReducer,
  },
  preloadedState: loadPreloadedState(),
});

attachStorePersistence(store);

export default store;
