import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getViewerCourseStorageKey,
  normalizeViewerCourseId,
} from "../../../entities/viewer";
import { selectCurrentViewerId, selectIsLogged } from "../../../features/auth";
import {
  hydrateViewerLearningFromLearningService,
  selectViewer,
  selectViewerName,
} from "../../../features/viewer";
import { downloadLearningCertificatePdf } from "../../../shared/lib";

function getCourseTitleFromViewer(viewer, courseId) {
  const normalizedCourseId = normalizeViewerCourseId(courseId);
  const storageKey = getViewerCourseStorageKey(normalizedCourseId);
  const snapshot =
    storageKey && viewer.courseSnapshotsById
      ? viewer.courseSnapshotsById[storageKey]
      : null;

  return snapshot?.title?.trim() || "Курс";
}

function formatIssuedAtShort(issuedAtRaw) {
  if (!issuedAtRaw) {
    return "—";
  }

  const parsed = new Date(issuedAtRaw);

  if (Number.isNaN(parsed.getTime())) {
    return issuedAtRaw;
  }

  return parsed.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function CertificatesSection() {
  const dispatch = useDispatch();
  const isLogged = useSelector(selectIsLogged);
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewerName = useSelector(selectViewerName);
  const viewer = useSelector(selectViewer);
  const [certificates, setCertificates] = useState([]);
  const [loadState, setLoadState] = useState("idle");
  const [loadError, setLoadError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!isLogged || !currentViewerId) {
      setCertificates([]);
      setLoadState("idle");
      setLoadError("");

      return;
    }

    let cancelled = false;

    async function load() {
      setLoadState("loading");
      setLoadError("");

      try {
        const result = await dispatch(
          hydrateViewerLearningFromLearningService(),
        );

        if (!cancelled) {
          if (result?.ok) {
            setCertificates(
              Array.isArray(result.certificates) ? result.certificates : [],
            );
            setLoadState("ready");
          } else if (result?.skipped) {
            setCertificates([]);
            setLoadState("idle");
          } else {
            setLoadError(
              result?.error ??
                "Не удалось загрузить список сертификатов.",
            );
            setLoadState("error");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error?.message ?? "Не удалось загрузить список сертификатов.",
          );
          setLoadState("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isLogged, currentViewerId]);

  const sortedCertificates = useMemo(
    () =>
      [...certificates].sort((a, b) => {
        const timeB = new Date(b.issuedAt).getTime();
        const timeA = new Date(a.issuedAt).getTime();

        if (Number.isNaN(timeB) && Number.isNaN(timeA)) {
          return 0;
        }

        if (Number.isNaN(timeB)) {
          return -1;
        }

        if (Number.isNaN(timeA)) {
          return 1;
        }

        return timeB - timeA;
      }),
    [certificates],
  );

  const handleDownload = useCallback(
    async (certificate) => {
      if (!certificate?.id) {
        return;
      }

      setDownloadingId(certificate.id);

      try {
        await downloadLearningCertificatePdf({
          recipientName: viewerName,
          courseTitle: getCourseTitleFromViewer(viewer, certificate.courseId),
          issuedAtRaw: certificate.issuedAt,
          serialNo: certificate.serialNo,
          certificateId: certificate.id,
          fileNameBase: certificate.serialNo || certificate.id,
        });
      } finally {
        setDownloadingId(null);
      }
    },
    [viewer, viewerName],
  );

  if (!isLogged || !currentViewerId) {
    return (
      <section className="certificates-section">
        <p className="certificates-empty">
          Войдите в аккаунт, чтобы увидеть сертификаты.
        </p>
      </section>
    );
  }

  return (
    <section className="certificates-section">
      <div className="certificates-header">
        <h1 className="certificates-title">Сертификаты</h1>
      </div>

      {loadState === "loading" ? (
        <p className="certificates-empty">Загрузка…</p>
      ) : null}

      {loadState === "error" ? (
        <p className="certificates-error" role="alert">
          {loadError}
        </p>
      ) : null}

      {loadState === "ready" && sortedCertificates.length === 0 ? (
        <p className="certificates-empty">
          Пока нет сертификатов. Они появятся после успешного завершения курса.
        </p>
      ) : null}

      {sortedCertificates.length > 0 ? (
        <ul className="certificates-list">
          {sortedCertificates.map((certificate) => (
            <li key={certificate.id} className="certificate-card">
              <div className="certificate-card-body">
                <div className="certificate-card-meta">
                  <h2 className="certificate-course-title">
                    {getCourseTitleFromViewer(viewer, certificate.courseId)}
                  </h2>
                  <div className="certificate-card-details">
                    <span>
                      Выдан: {formatIssuedAtShort(certificate.issuedAt)}
                    </span>
                    <span>Номер: {certificate.serialNo || "—"}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="certificate-download-btn"
                  disabled={downloadingId === certificate.id}
                  onClick={() => handleDownload(certificate)}
                >
                  {downloadingId === certificate.id
                    ? "Создание PDF…"
                    : "Скачать PDF"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export default CertificatesSection;
