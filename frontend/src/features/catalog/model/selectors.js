export const selectIsCatalogOpen = (state) => state.catalog.isCatalogOpen;
export const selectCategories = (state) => state.catalog.categories;
export const selectSelectedCategoryId = (state) =>
  state.catalog.selectedCategoryId;

export const selectSelectedCatalogTagKey = (state) =>
  state.catalog.selectedCatalogTagKey ?? "__all__";
