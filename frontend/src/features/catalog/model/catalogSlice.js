import { createSlice } from "@reduxjs/toolkit";
import { buildCatalogData, getMockCourses } from "../../../entities/course";

import { ALL_TAG_KEY } from "./buildCatalogTagModel";

const initialCategories = buildCatalogData(getMockCourses());
const defaultSelectedCategoryId = initialCategories[0]?.id ?? null;

const initialState = {
  isCatalogOpen: false,

  categories: initialCategories,

  selectedCategoryId: defaultSelectedCategoryId,

  selectedCatalogTagKey: ALL_TAG_KEY,
};

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    openCatalog: (state) => {
      state.isCatalogOpen = true;
    },

    closeCatalog: (state) => {
      state.isCatalogOpen = false;
    },

    selectCategory: (state, action) => {
      state.selectedCategoryId = action.payload;
    },

    selectCatalogTag: (state, action) => {
      state.selectedCatalogTagKey = action.payload;
    },

    resetSelectedCategory: (state) => {
      state.selectedCategoryId = defaultSelectedCategoryId;
      state.selectedCatalogTagKey = ALL_TAG_KEY;
    },
  },
});

export default catalogSlice.reducer;
export const { openCatalog } = catalogSlice.actions;
export const { closeCatalog } = catalogSlice.actions;
export const { selectCategory } = catalogSlice.actions;
export const { selectCatalogTag } = catalogSlice.actions;
export const { resetSelectedCategory } = catalogSlice.actions;
