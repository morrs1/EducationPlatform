import { memo, useEffect, useRef, useState } from "react";

const LessonAssetVideo = memo(function LessonAssetVideo({ asset }) {
  const assetKey =
    asset?.isResolved && asset?.url
      ? `${asset.id ?? "lesson-asset"}:${asset.url}`
      : "";
  const [posterState, setPosterState] = useState({
    key: "",
    url: "",
  });
  const previewVideoRef = useRef(null);
  const captureTimeoutRef = useRef(0);
  const frameRequestIdRef = useRef(null);
  const hasCapturedPosterRef = useRef(false);

  useEffect(() => {
    hasCapturedPosterRef.current = false;
    const previewVideo = previewVideoRef.current;

    return () => {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
        captureTimeoutRef.current = 0;
      }

      if (
        previewVideo &&
        frameRequestIdRef.current !== null &&
        typeof previewVideo.cancelVideoFrameCallback === "function"
      ) {
        previewVideo.cancelVideoFrameCallback(frameRequestIdRef.current);
      }

      frameRequestIdRef.current = null;
    };
  }, [assetKey]);

  const getPreviewTimestamp = (duration) => {
    const normalizedDuration = Number.isFinite(duration) ? duration : 0;

    if (normalizedDuration <= 0) {
      return 0;
    }

    const midpoint = normalizedDuration * 0.5;
    const lowerBound = normalizedDuration >= 2 ? 1 : normalizedDuration * 0.25;
    const upperBound = Math.max(normalizedDuration - 0.35, 0);

    return Math.min(Math.max(midpoint, lowerBound), upperBound);
  };

  const capturePoster = () => {
    const previewVideo = previewVideoRef.current;

    if (
      !assetKey ||
      !previewVideo ||
      hasCapturedPosterRef.current ||
      !previewVideo.videoWidth ||
      !previewVideo.videoHeight
    ) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = previewVideo.videoWidth;
    canvas.height = previewVideo.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    try {
      context.drawImage(
        previewVideo,
        0,
        0,
        previewVideo.videoWidth,
        previewVideo.videoHeight,
      );

      hasCapturedPosterRef.current = true;
      setPosterState({
        key: assetKey,
        url: canvas.toDataURL("image/jpeg", 0.82),
      });
    } catch {
      setPosterState((previousState) =>
        previousState.key === assetKey
          ? {
              key: assetKey,
              url: "",
            }
          : previousState,
      );
    }
  };

  const schedulePosterCapture = () => {
    const previewVideo = previewVideoRef.current;

    if (!previewVideo || hasCapturedPosterRef.current) {
      return;
    }

    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = 0;
    }

    if (typeof previewVideo.requestVideoFrameCallback === "function") {
      if (frameRequestIdRef.current !== null) {
        previewVideo.cancelVideoFrameCallback?.(frameRequestIdRef.current);
      }

      frameRequestIdRef.current = previewVideo.requestVideoFrameCallback(() => {
        frameRequestIdRef.current = null;
        previewVideo.pause();
        capturePoster();
      });
      return;
    }

    captureTimeoutRef.current = window.setTimeout(() => {
      captureTimeoutRef.current = 0;
      previewVideo.pause();
      capturePoster();
    }, 180);
  };

  const handleLoadedMetadata = () => {
    const previewVideo = previewVideoRef.current;

    if (!previewVideo || !asset?.isResolved || !asset.url) {
      return;
    }

    const previewTimestamp = getPreviewTimestamp(previewVideo.duration);

    if (previewTimestamp <= 0) {
      schedulePosterCapture();
      return;
    }

    try {
      previewVideo.currentTime = previewTimestamp;
    } catch {
      schedulePosterCapture();
    }
  };

  const handleSeeked = () => {
    const previewVideo = previewVideoRef.current;

    if (!previewVideo || hasCapturedPosterRef.current) {
      return;
    }

    const playPromise = previewVideo.play();

    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          schedulePosterCapture();
        })
        .catch(() => {
          schedulePosterCapture();
        });
      return;
    }

    schedulePosterCapture();
  };

  const handlePreviewError = () => {
    setPosterState((previousState) =>
      previousState.key === assetKey
        ? {
            key: assetKey,
            url: "",
          }
        : previousState,
    );
  };

  const posterUrl = posterState.key === assetKey ? posterState.url : "";

  return (
    <>
      <video
        key={`preview-${assetKey}`}
        ref={previewVideoRef}
        className="lesson-asset-video-preview"
        src={asset.url}
        preload="auto"
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        onError={handlePreviewError}
      />
      <video
        key={`player-${assetKey}`}
        className="lesson-asset-video"
        src={asset.url}
        poster={posterUrl || undefined}
        controls
        preload="metadata"
        playsInline
      />
    </>
  );
});

function renderLessonAssetVisual(asset) {
  return (
    <figure
      className={`lesson-asset-embed asset-${asset.type}${
        !asset.isResolved ? " is-unavailable" : ""
      }`}
    >
      {asset.type === "image" ? (
        <div className="lesson-asset-visual-wrap">
          {asset.isResolved ? (
            <img
              src={asset.url}
              alt="Иллюстрация к уроку"
              className="lesson-asset-image"
              loading="lazy"
            />
          ) : (
            <div className="lesson-asset-unavailable">
              Не удалось определить адрес изображения.
            </div>
          )}
        </div>
      ) : null}

      {asset.type === "video" ? (
        <div className="lesson-asset-visual-wrap">
          {asset.isResolved ? (
            <LessonAssetVideo asset={asset} />
          ) : (
            <div className="lesson-asset-unavailable">
              Не удалось определить адрес видео.
            </div>
          )}
        </div>
      ) : null}
    </figure>
  );
}

function renderLessonFileAsset(asset) {
  return asset.isResolved ? (
    <a
      key={asset.id}
      href={asset.url}
      target="_blank"
      rel="noreferrer"
      className="lesson-asset-file-link"
    >
      Открыть файл
    </a>
  ) : (
    <div
      key={asset.id}
      className={`lesson-asset-embed asset-file${
        !asset.isResolved ? " is-unavailable" : ""
      }`}
    >
      <div className="lesson-asset-unavailable">Не удалось загрузить файл.</div>
    </div>
  );
}

const LessonMediaCarousel = memo(function LessonMediaCarousel({ assets }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!assets.length) {
    return null;
  }

  const safeIndex = Math.min(activeIndex, assets.length - 1);
  const hasMultipleAssets = assets.length > 1;
  const trackStyle = {
    transform: `translate3d(-${safeIndex * 100}%, 0, 0)`,
  };

  function goToPreviousSlide() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? assets.length - 1 : currentIndex - 1,
    );
  }

  function goToNextSlide() {
    setActiveIndex((currentIndex) =>
      currentIndex === assets.length - 1 ? 0 : currentIndex + 1,
    );
  }

  return (
    <div className="lesson-media-carousel">
      <div className="lesson-media-carousel-stage">
        <div className="lesson-media-carousel-track" style={trackStyle}>
          {assets.map((asset, index) => (
            <div
              key={asset.id ?? `${asset.type ?? "lesson-asset"}-${index}`}
              className="lesson-media-carousel-slide"
            >
              {renderLessonAssetVisual(asset)}
            </div>
          ))}
        </div>

        {hasMultipleAssets ? (
          <>
            <button
              type="button"
              className="lesson-media-carousel-control previous"
              onClick={goToPreviousSlide}
              aria-label="Предыдущее медиа"
            >
              ‹
            </button>

            <button
              type="button"
              className="lesson-media-carousel-control next"
              onClick={goToNextSlide}
              aria-label="Следующее медиа"
            >
              ›
            </button>

            <div className="lesson-media-carousel-counter" aria-live="polite">
              {safeIndex + 1} / {assets.length}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
});

function renderLessonAssets(assets) {
  if (!assets?.length) {
    return null;
  }

  const mediaAssets = assets.filter(
    (asset) => asset.type === "image" || asset.type === "video",
  );
  const fileAssets = assets.filter((asset) => asset.type === "file");
  const mediaAssetSetKey = mediaAssets
    .map((asset) => `${asset.id ?? "lesson-asset"}:${asset.url ?? asset.type}`)
    .join("|");

  return (
    <>
      {mediaAssets.length ? (
        <LessonMediaCarousel key={mediaAssetSetKey} assets={mediaAssets} />
      ) : null}
      {fileAssets.length ? (
        <div className="lesson-asset-file-list">
          {fileAssets.map(renderLessonFileAsset)}
        </div>
      ) : null}
    </>
  );
}


export default function LessonAssets({ assets }) {
  return renderLessonAssets(assets);
}
