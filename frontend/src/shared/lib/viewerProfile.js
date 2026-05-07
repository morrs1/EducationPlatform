export function buildViewerDisplayName(
  firstName,
  lastName,
  patronymic = "",
) {
  return [lastName, firstName, patronymic].filter(Boolean).join(" ").trim();
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * DiceBear `initials` чаще всего берёт буквы из первой и последней части seed.
 * Чтобы инициалы всегда были "Имя + Фамилия", формируем seed из ровно 2 слов.
 */
export function buildAvatarInitialsSeed({
  firstName = "",
  lastName = "",
  name = "",
} = {}) {
  const normalizedFirstName = normalizeText(firstName);
  const normalizedLastName = normalizeText(lastName);

  if (normalizedFirstName && normalizedLastName) {
    return `${normalizedFirstName} ${normalizedLastName}`;
  }

  const normalizedName = normalizeText(name);
  const parts = normalizedName.split(/\s+/).filter(Boolean);

  // Частый формат в приложении: "Фамилия Имя Отчество"
  if (parts.length >= 2) {
    const [surname = "", givenName = ""] = parts;
    if (givenName && surname) {
      return `${givenName} ${surname}`;
    }
  }

  return normalizedName;
}

export function buildAvatarUrl(seed) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;
}
