import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  closeCatalog,
  resetSelectedCategory,
  selectCategory,
  selectIsCatalogOpen,
  selectSelectedCategoryId,
} from "../../../features/catalog";
import { Link } from "react-router";

import { useCatalogCollections } from "../../../entities/course/model/useCatalogCollections";

function CatalogSidebar({ headerHeight }) {
  const dispatch = useDispatch();
  const isCatalogOpen = useSelector(selectIsCatalogOpen);
  const selectedCategoryId = useSelector(selectSelectedCategoryId);
  const { catalogData } = useCatalogCollections();
  const resolvedSelectedCategoryId = catalogData.some(
    (category) => category.id === selectedCategoryId,
  )
    ? selectedCategoryId
    : (catalogData[0]?.id ?? null);
  const currentCategory = catalogData.find(
    (category) => category.id === resolvedSelectedCategoryId,
  );

  useEffect(() => {
    if (!isCatalogOpen) {
      dispatch(resetSelectedCategory());
      return undefined;
    }

    const { body, documentElement } = document;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousBodyTouchAction = body.style.touchAction;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
      body.style.touchAction = previousBodyTouchAction;
    };
  }, [dispatch, isCatalogOpen]);

  useEffect(() => {
    if (!isCatalogOpen) {
      return undefined;
    }

    function handleEscapeKeyDown(event) {
      if (event.key === "Escape") {
        dispatch(closeCatalog());
      }
    }

    document.addEventListener("keydown", handleEscapeKeyDown);

    return () => {
      document.removeEventListener("keydown", handleEscapeKeyDown);
    };
  }, [dispatch, isCatalogOpen]);

  const sidebarOffset = `${headerHeight}px`;

  return (
    <>
      <button
        type="button"
        aria-label="Закрыть каталог"
        tabIndex={isCatalogOpen ? 0 : -1}
        className={`catalog-overlay ${isCatalogOpen ? "is-open" : ""}`}
        style={{ top: sidebarOffset }}
        onClick={() => dispatch(closeCatalog())}
      />

      <aside
        aria-hidden={!isCatalogOpen}
        className={`catalog-sheet ${isCatalogOpen ? "is-open" : ""}`}
        style={{
          top: sidebarOffset,
          height: `calc(100dvh - ${sidebarOffset})`,
        }}
      >
        <div className="catalog-pane catalog-pane-nav">
          {catalogData.map((category) => (
            <button
              type="button"
              className={`catalog-category-btn ${
                resolvedSelectedCategoryId === category.id ? "active" : ""
              }`}
              key={category.id}
              onClick={() => dispatch(selectCategory(category.id))}
            >
              <span className="catalog-category-name">{category.name}</span>
              <span className="catalog-category-arrow" aria-hidden="true">
                -&gt;
              </span>
            </button>
          ))}
        </div>

        <div className="catalog-pane catalog-pane-content">
          <div className="catalog-grid">
            {currentCategory?.subcategories.map((subcategory) => (
              <div key={subcategory.id} className="catalog-subcategory-card">
                <span className="catalog-subcategory-title">
                  {subcategory.name}
                </span>
                <div className="catalog-course-list">
                  {subcategory.courses.map((course) => (
                    <Link
                      key={course.id}
                      className="catalog-course-link"
                      to={`/courses/${course.id}`}
                      onClick={() => {
                        dispatch(closeCatalog());
                      }}
                    >
                      {course.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

export default CatalogSidebar;
