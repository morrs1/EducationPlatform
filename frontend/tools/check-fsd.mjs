import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const layerRank = new Map([
  ["shared", 0],
  ["entities", 1],
  ["features", 2],
  ["widgets", 3],
  ["pages", 4],
  ["processes", 5],
  ["app", 6],
]);
const importPattern =
  /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "dist" || entry.name === "node_modules") {
      return [];
    }

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(entryPath);
    }

    return /\.(js|jsx)$/.test(entry.name) ? [entryPath] : [];
  });
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function getModuleInfo(filePath) {
  const relativePath = normalizePath(path.relative(srcDir, filePath));
  const [layer, slice, segment, xTarget] = relativePath.split("/");

  if (!layerRank.has(layer)) {
    return {
      layer: "app",
      slice: "_root",
      segment: null,
      xTarget: null,
      relativePath,
    };
  }

  return {
    layer,
    slice,
    segment,
    xTarget: segment === "@x" ? xTarget?.replace(/\.(js|jsx)$/, "") : null,
    relativePath,
  };
}

function resolveImportPath(importPath, importerPath) {
  if (importPath.startsWith("@/")) {
    return resolveExistingPath(path.join(srcDir, importPath.slice(2)));
  }

  if (!importPath.startsWith(".")) {
    return null;
  }

  return resolveExistingPath(path.resolve(path.dirname(importerPath), importPath));
}

function resolveExistingPath(basePath) {
  if (existsSync(basePath) && statSync(basePath).isDirectory()) {
    return resolveExistingPath(path.join(basePath, "index"));
  }

  const candidates = [
    `${basePath}.js`,
    `${basePath}.jsx`,
    basePath,
    path.join(basePath, "index.js"),
    path.join(basePath, "index.jsx"),
  ];

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
}

function isPublicSliceApi(targetPath, targetInfo) {
  if (targetInfo.layer === "shared") {
    return true;
  }

  const sliceRoot = path.join(srcDir, targetInfo.layer, targetInfo.slice);

  return targetPath === path.join(sliceRoot, "index.js") ||
    targetPath === path.join(sliceRoot, "index.jsx");
}

function isExplicitCrossImport(sourceInfo, targetInfo) {
  return Boolean(
    targetInfo.xTarget &&
      targetInfo.xTarget === sourceInfo.slice &&
      sourceInfo.layer === targetInfo.layer,
  );
}

function validateImport(importerPath, targetPath, importPath) {
  if (!targetPath.startsWith(srcDir)) {
    return [];
  }

  const sourceInfo = getModuleInfo(importerPath);
  const targetInfo = getModuleInfo(targetPath);

  if (!layerRank.has(targetInfo.layer)) {
    return [];
  }

  const errors = [];
  const sourceRank = layerRank.get(sourceInfo.layer);
  const targetRank = layerRank.get(targetInfo.layer);

  if (targetRank > sourceRank) {
    errors.push(
      `Layer "${sourceInfo.layer}" cannot import upper layer "${targetInfo.layer}".`,
    );
  }

  const isSameSlice =
    sourceInfo.layer === targetInfo.layer &&
    sourceInfo.slice === targetInfo.slice;
  const isCrossSliceSameLayer =
    sourceInfo.layer === targetInfo.layer &&
    sourceInfo.slice !== targetInfo.slice;
  const publicApi = isPublicSliceApi(targetPath, targetInfo);
  const explicitCrossImport = isExplicitCrossImport(sourceInfo, targetInfo);

  if (
    !isSameSlice &&
    targetInfo.layer !== "shared" &&
    !publicApi &&
    !explicitCrossImport
  ) {
    errors.push(
      `Import slice "${targetInfo.layer}/${targetInfo.slice}" through its public index.js API.`,
    );
  }

  if (
    isCrossSliceSameLayer &&
    !explicitCrossImport &&
    sourceInfo.layer !== "app" &&
    sourceInfo.layer !== "shared"
  ) {
    errors.push(
      `Same-layer cross import "${sourceInfo.layer}/${sourceInfo.slice}" -> "${targetInfo.layer}/${targetInfo.slice}" must use an explicit @x contract.`,
    );
  }

  return errors.map((message) => ({
    importer: sourceInfo.relativePath,
    importPath,
    message,
  }));
}

const errors = [];

for (const filePath of walk(srcDir)) {
  if (!statSync(filePath).isFile()) {
    continue;
  }

  const source = readFileSync(filePath, "utf8");

  for (const match of source.matchAll(importPattern)) {
    const importPath = match[1];
    const targetPath = resolveImportPath(importPath, filePath);

    if (!targetPath) {
      continue;
    }

    errors.push(...validateImport(filePath, targetPath, importPath));
  }
}

if (errors.length) {
  console.error("FSD boundary check failed:");
  errors.forEach((error) => {
    console.error(
      `- ${error.importer}: ${error.message} (${error.importPath})`,
    );
  });
  process.exit(1);
}

console.log("FSD boundary check passed.");
