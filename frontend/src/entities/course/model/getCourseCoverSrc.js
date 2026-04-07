function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function getCourseCoverSrc(course) {
  if (course.coverUrl) {
    return course.coverUrl;
  }

  const icon = course.categoryIcon ?? "📘";
  const title = escapeXml(course.title);
  const subtitle = escapeXml(course.subcategoryName ?? course.categoryName);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#166534" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" rx="32" fill="url(#bg)" />
      <rect x="24" y="24" width="592" height="312" rx="28" fill="rgba(15, 23, 42, 0.38)" />
      <text x="48" y="104" fill="#bbf7d0" font-size="54">${escapeXml(icon)}</text>
      <text x="48" y="168" fill="#ffffff" font-family="Arial, sans-serif" font-size="30" font-weight="700">
        ${title}
      </text>
      <text x="48" y="214" fill="#d1d5db" font-family="Arial, sans-serif" font-size="20">
        ${subtitle}
      </text>
      <text x="48" y="274" fill="#f8fafc" font-family="Arial, sans-serif" font-size="18">
        ${escapeXml(course.durationLabel)}
      </text>
      <text x="172" y="274" fill="#f8fafc" font-family="Arial, sans-serif" font-size="18">
        ${escapeXml(`${course.lessonsCount} уроков`)}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
