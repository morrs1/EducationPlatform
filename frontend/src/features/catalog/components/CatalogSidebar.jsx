import { useDispatch, useSelector } from "react-redux";
import { closeCatalog, selectCategory } from "../catalogSlice";
import { useEffect, useState } from "react";

function CatalogSidebar() {
  const dispatch = useDispatch();
  const isCatalogOpen = useSelector((state) => state.catalog.isCatalogOpen);
  const categories = useSelector((state) => state.catalog.categories);
  const selectedCategoryId = useSelector(
    (state) => state.catalog.selectedCategoryId,
  );
  const currentCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );

  function handleClose() {
    dispatch(closeCatalog());
  }

  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isCatalogOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimating(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCatalogOpen]);

  if (!shouldRender) return false;

  return (
    <>
      <div
        className={`fixed inset-0 top-[66px] z-40 bg-black/50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div
        className={`fixed top-[109px] sm:top-[140px] md:top-[67px] bottom-3 left-0 w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-[1350px] bg-white shadow-black z-50 flex flex-col md:flex-row overflow-hidden rounded-br-2xl transition-all duration-300 ${isAnimating ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"}`}
      >
        <div className="w-full overflow-y-auto border-b md:w-1/4 md:border-b-0 md:border-r">
          {categories.map((category) => (
            <div
              className={`side-catalog-btn px-3 py-3 ${
                selectedCategoryId === category.id ? "active" : ""
              }`}
              key={category.id}
              onClick={() => dispatch(selectCategory(category.id))}
            >
              <span className="text-sm sm:text-base">{category.name}</span>
              <span className="text-xs sm:text-sm">→</span>
            </div>
          ))}
        </div>

        <div className="w-full p-3 overflow-y-auto md:w-3/4 sm:p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {currentCategory?.subcategories.map((subcategory) => (
              <div key={subcategory.id} className="flex flex-col gap-2">
                <span className="pb-1 mb-1 text-base font-bold border-b side-catalog-subcat sm:text-lg">
                  {subcategory.name}
                </span>
                <div className="flex flex-col gap-2">
                  {subcategory.courses.map((course) => (
                    <span
                      key={course.id}
                      className="text-sm side-catalog-course sm:text-base"
                    >
                      {course.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default CatalogSidebar;
