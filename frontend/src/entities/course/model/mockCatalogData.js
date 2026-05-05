import { buildCatalogData } from "./buildCatalogData";
import { getMockCourses } from "./mockCourses";

export const mockCatalogData = buildCatalogData(getMockCourses());
