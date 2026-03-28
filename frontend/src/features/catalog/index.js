export { default as catalogReducer } from "./model/catalogSlice";

export {
  openCatalog,
  closeCatalog,
  selectCategory,
  resetSelectedCategory,
} from "./model/catalogSlice";

export {
  selectIsCatalogOpen,
  selectCategories,
  selectSelectedCategoryId,
} from "./model/selectors";
