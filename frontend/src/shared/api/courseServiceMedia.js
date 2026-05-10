import {
  normalizeArray,
  normalizeText,
  unwrapInteger,
  unwrapString,
} from "../lib/gatewayValues";

const COURSE_SERVICE_MEDIA_PROXY_PATH = "/api/course-service-media";
const USER_SERVICE_MEDIA_PROXY_PATH = "/api/user-service-media";

function buildCourseServiceMediaProxyUrl(storageKey) {
  const normalizedStorageKey = normalizeText(storageKey);

  if (!normalizedStorageKey) {
    return "";
  }

  return `${COURSE_SERVICE_MEDIA_PROXY_PATH}/${normalizedStorageKey
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function appendCacheKey(url, cacheKey) {
  const normalizedUrl = normalizeText(url);
  const normalizedCacheKey = normalizeText(cacheKey);

  if (!normalizedUrl || !normalizedCacheKey) {
    return normalizedUrl;
  }

  const separator = normalizedUrl.includes("?") ? "&" : "?";

  return `${normalizedUrl}${separator}v=${encodeURIComponent(normalizedCacheKey)}`;
}

function buildBucketMediaProxyUrl(bucket, key) {
  const normalizedBucket = normalizeText(bucket);
  const normalizedKey = normalizeText(key);

  if (!normalizedBucket || !normalizedKey) {
    return "";
  }

  return `${USER_SERVICE_MEDIA_PROXY_PATH}/${encodeURIComponent(
    normalizedBucket,
  )}/${normalizedKey
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function parseStorageReference(value) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return null;
  }

  try {
    const parsedUrl = new URL(normalizedValue, window.location.origin);

    if (parsedUrl.pathname.startsWith(USER_SERVICE_MEDIA_PROXY_PATH)) {
      return null;
    }

    if (parsedUrl.protocol === "s3:") {
      const key = parsedUrl.pathname.split("/").filter(Boolean).join("/");

      if (!parsedUrl.hostname || !key) {
        return null;
      }

      return {
        bucket: parsedUrl.hostname,
        key,
      };
    }

    const isLocalStorageHost =
      parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1";

    if (!isLocalStorageHost) {
      return null;
    }

    const pathSegments = parsedUrl.pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));

    if (pathSegments[0] === "buckets" && pathSegments.length >= 3) {
      return {
        bucket: pathSegments[1],
        key: pathSegments.slice(2).join("/"),
      };
    }

    if (pathSegments.length >= 2) {
      return {
        bucket: pathSegments[0],
        key: pathSegments.slice(1).join("/"),
      };
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeDirectAssetUrl(url) {
  const normalizedUrl = normalizeText(url);

  if (!normalizedUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(normalizedUrl, window.location.origin);

    if (parsedUrl.protocol === "s3:") {
      return buildBucketMediaProxyUrl(
        parsedUrl.hostname,
        parsedUrl.pathname.split("/").filter(Boolean).join("/"),
      );
    }

    return parsedUrl.toString();
  } catch {
    return normalizedUrl;
  }
}

function isPlaceholderAssetUrl(url) {
  const normalizedUrl = normalizeText(url);

  if (!normalizedUrl) {
    return false;
  }

  try {
    const parsedUrl = new URL(normalizedUrl, window.location.origin);

    return (
      parsedUrl.hostname === "cdn.example.local" ||
      parsedUrl.hostname.endsWith(".example.local")
    );
  } catch {
    return false;
  }
}

function normalizeLessonAssetType(type, mimeType) {
  const normalizedType = normalizeText(type).toLowerCase();
  const normalizedMimeType = normalizeText(mimeType).toLowerCase();

  if (normalizedType === "image" || normalizedType === "cover") {
    return "image";
  }

  if (normalizedType === "video") {
    return "video";
  }

  if (normalizedType === "file") {
    return "file";
  }

  if (normalizedMimeType.startsWith("image/")) {
    return "image";
  }

  if (normalizedMimeType.startsWith("video/")) {
    return "video";
  }

  return "file";
}

function getLessonAssetSortWeight(type) {
  if (type === "image") {
    return 0;
  }

  if (type === "video") {
    return 1;
  }

  return 2;
}

function resolveLessonAssetUrl(publicUrl, storageKey, createdAt = "") {
  const normalizedStorageKey = normalizeText(storageKey);
  const storageReference = parseStorageReference(publicUrl);
  const normalizedCreatedAt = normalizeText(createdAt);

  if (normalizedStorageKey) {
    const courseProxyUrl = buildCourseServiceMediaProxyUrl(normalizedStorageKey);
    const bucketProxyUrl = storageReference?.bucket
      ? buildBucketMediaProxyUrl(storageReference.bucket, normalizedStorageKey)
      : "";

    if (courseProxyUrl) {
      return appendCacheKey(
        courseProxyUrl,
        normalizedCreatedAt || normalizedStorageKey,
      );
    }

    if (bucketProxyUrl) {
      return appendCacheKey(
        bucketProxyUrl,
        normalizedCreatedAt || normalizedStorageKey,
      );
    }
  }

  const normalizedPublicUrl = normalizeDirectAssetUrl(publicUrl);

  if (normalizedPublicUrl && !isPlaceholderAssetUrl(normalizedPublicUrl)) {
    return appendCacheKey(
      normalizedPublicUrl,
      normalizedCreatedAt || normalizedStorageKey,
    );
  }

  return normalizedPublicUrl;
}

function mapLessonAsset(asset, assetIndex) {
  const mimeType = unwrapString(asset?.mimeType, "mimeType");
  const assetType = normalizeText(
    unwrapString(asset?.type, "assetType") ||
      unwrapString(asset?.assetType, "assetType"),
  ).toLowerCase();
  const type = normalizeLessonAssetType(
    assetType,
    mimeType,
  );
  const storageKey = unwrapString(asset?.storageKey, "storageKey");
  const publicUrl = unwrapString(asset?.publicUrl, "publicUrl");
  const originalFilename = unwrapString(
    asset?.originalFilename,
    "originalFilename",
  );
  const createdAt = normalizeText(asset?.createdAt);
  const resolvedUrl = resolveLessonAssetUrl(publicUrl, storageKey, createdAt);

  return {
    id: normalizeText(asset?.id) || `backend-asset-${assetIndex + 1}`,
    type,
    assetType: assetType || type,
    title:
      unwrapString(asset?.title, "title") ||
      originalFilename ||
      `Материал ${assetIndex + 1}`,
    originalFilename,
    mimeType,
    sizeBytes: unwrapInteger(asset?.sizeBytes, "sizeBytes"),
    storageKey,
    publicUrl,
    url: resolvedUrl,
    isResolved: Boolean(resolvedUrl),
    createdAt,
  };
}

export function mapLessonAssets(assets) {
  return normalizeArray(assets)
    .map(mapLessonAsset)
    .sort((left, right) => {
      const typeDifference =
        getLessonAssetSortWeight(left.type) - getLessonAssetSortWeight(right.type);

      if (typeDifference !== 0) {
        return typeDifference;
      }

      return left.title.localeCompare(right.title, "ru");
    });
}

export function selectLessonCoverAsset(assets) {
  const coverAssets = assets.filter((asset) => asset.assetType === "cover");

  if (coverAssets.length) {
    return [...coverAssets].sort((left, right) =>
      normalizeText(right.createdAt).localeCompare(normalizeText(left.createdAt)),
    )[0];
  }

  return null;
}
