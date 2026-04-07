import { createSlice } from "@reduxjs/toolkit";
import { mockCatalogData } from "../../../entities/course/model/mockCatalogData";

const defaultSelectedCategoryId = mockCatalogData[0]?.id ?? null;

const initialState = {
  isCatalogOpen: false,

  categories: mockCatalogData,

  selectedCategoryId: defaultSelectedCategoryId,
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

    resetSelectedCategory: (state) => {
      state.selectedCategoryId = defaultSelectedCategoryId;
    },
  },
});

export default catalogSlice.reducer;
export const { openCatalog } = catalogSlice.actions;
export const { closeCatalog } = catalogSlice.actions;
export const { selectCategory } = catalogSlice.actions;
export const { resetSelectedCategory } = catalogSlice.actions;
