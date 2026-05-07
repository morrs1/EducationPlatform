import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import {
  ALL_TAG_KEY,
  closeCatalog,
  getCatalogCoursesForTagKey,
  resetSelectedCategory,
  selectCatalogTag,
  selectIsCatalogOpen,
  selectSelectedCatalogTagKey,
} from "../../../features/catalog";
import { Link } from "react-router";

import { useCatalogCollections } from "../../../features/catalog";

function CatalogSidebar({ headerHeight }) {
  const dispatch = useDispatch();
  const isCatalogOpen = useSelector(selectIsCatalogOpen);
  const selectedCatalogTagKey = useSelector(selectSelectedCatalogTagKey);
  const { catalogTagModel } = useCatalogCollections();

  const resolvedCatalogTagKey = useMemo(() => {
    if (!catalogTagModel?.tagList) {
      return ALL_TAG_KEY;
    }
    if (
      selectedCatalogTagKey === ALL_TAG_KEY ||
      !selectedCatalogTagKey
    ) {
      return ALL_TAG_KEY;
    }
    if (
      catalogTagModel.tagList.some((tag) => tag.key === selectedCatalogTagKey)
    ) {
      return selectedCatalogTagKey;
    }
    return ALL_TAG_KEY;
  }, [catalogTagModel, selectedCatalogTagKey]);

  const visibleCourseRows = useMemo(
    () => getCatalogCoursesForTagKey(catalogTagModel, resolvedCatalogTagKey),
    [catalogTagModel, resolvedCatalogTagKey],
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
        <div className="catalog-pane catalog-pane-nav catalog-pane-nav-tags">
          <button
            type="button"
            className={`catalog-tag-nav-btn ${
              resolvedCatalogTagKey === ALL_TAG_KEY ? "active" : ""
            }`}
            onClick={() => dispatch(selectCatalogTag(ALL_TAG_KEY))}
          >
            <span className="catalog-tag-nav-label">Все курсы</span>
          </button>
          {catalogTagModel?.tagList?.map((tag) => (
            <button
              type="button"
              key={tag.key}
              className={`catalog-tag-nav-btn ${
                resolvedCatalogTagKey === tag.key ? "active" : ""
              }`}
              onClick={() => dispatch(selectCatalogTag(tag.key))}
            >
              <span className="catalog-tag-nav-label">{tag.label}</span>
              <span className="catalog-tag-nav-count" aria-hidden="true">
                {tag.count}
              </span>
            </button>
          ))}
        </div>

        <div className="catalog-pane catalog-pane-content catalog-pane-tag-courses">
          <div className="catalog-tag-course-list">
            {visibleCourseRows.map((course) => (
              <Link
                key={course.id}
                className="catalog-tag-course-tile"
                to={`/courses/${course.id}`}
                onClick={() => {
                  dispatch(closeCatalog());
                }}
              >
                <span className="catalog-tag-course-tile-label">
                  {course.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

export default CatalogSidebar;
