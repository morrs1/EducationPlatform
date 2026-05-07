function escapeHtml(value) {
  const div = document.createElement("div");

  div.textContent = typeof value === "string" ? value : String(value ?? "");

  return div.innerHTML;
}

function formatIssuedAtRu(issuedAtRaw) {
  if (!issuedAtRaw) {
    return "—";
  }

  const parsed = new Date(issuedAtRaw);

  if (Number.isNaN(parsed.getTime())) {
    return issuedAtRaw;
  }

  return parsed.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildCertificateMarkup({
  recipientName,
  courseTitle,
  issuedAtDisplay,
  serialNo,
  certificateId,
}) {
  return `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#65748b;">
        Образовательная платформа
      </div>
      <h1 style="margin:14px 0 0;font-size:38px;font-weight:700;color:#17223b;">
        Сертификат
      </h1>
    </div>
    <p style="margin:0 0 20px;font-size:17px;line-height:1.55;color:#374151;text-align:center;">
      Настоящим подтверждается, что
      <strong>${escapeHtml(recipientName)}</strong>
      успешно завершил(а) курс
    </p>
    <p style="margin:0 0 28px;font-size:22px;font-weight:700;line-height:1.35;color:#1d4ed8;text-align:center;">
      ${escapeHtml(courseTitle)}
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:16px 32px;justify-content:center;font-size:14px;color:#475569;">
      <div><span style="color:#94a3b8;">Дата выдачи:</span> ${escapeHtml(issuedAtDisplay)}</div>
      <div><span style="color:#94a3b8;">Серийный номер:</span> ${escapeHtml(serialNo)}</div>
      <div><span style="color:#94a3b8;">ID записи:</span> ${escapeHtml(certificateId)}</div>
    </div>
  `;
}

/**
 * Собирает PDF на клиенте по данным, совпадающим с записью в learning_service.
 */
export async function downloadLearningCertificatePdf({
  recipientName,
  courseTitle,
  issuedAtRaw,
  serialNo,
  certificateId,
  fileNameBase,
}) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const issuedAtDisplay = formatIssuedAtRu(issuedAtRaw);
  const wrap = document.createElement("div");

  wrap.style.boxSizing = "border-box";
  wrap.style.width = "1120px";
  wrap.style.height = "792px";
  wrap.style.padding = "56px 72px";
  wrap.style.background =
    "linear-gradient(165deg, #f8fafc 0%, #ffffff 42%, #f1f5f9 100%)";
  wrap.style.fontFamily = '"Manrope", "Segoe UI", system-ui, sans-serif';
  wrap.style.color = "#17223b";
  wrap.style.border = "3px solid #2563eb";
  wrap.style.borderRadius = "28px";
  wrap.style.boxShadow = "0 24px 48px rgba(15, 23, 42, 0.08)";
  wrap.innerHTML = buildCertificateMarkup({
    recipientName: recipientName || "Участник",
    courseTitle: courseTitle || "Курс",
    issuedAtDisplay,
    serialNo: serialNo || "—",
    certificateId: certificateId || "—",
  });

  document.body.appendChild(wrap);

  try {
    const canvas = await html2canvas(wrap, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    const offsetY = Math.max(0, (pageHeight - imgHeight) / 2);

    pdf.addImage(imgData, "JPEG", 0, offsetY, imgWidth, imgHeight);

    const safeBase = String(fileNameBase || serialNo || certificateId || "certificate")
      .trim()
      .replace(/[^\w\u0400-\u04FF-]+/g, "_")
      .slice(0, 80);

    pdf.save(`${safeBase || "certificate"}.pdf`);
  } finally {
    document.body.removeChild(wrap);
  }
}
