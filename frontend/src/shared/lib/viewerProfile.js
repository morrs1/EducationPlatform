export function buildViewerDisplayName(
  firstName,
  lastName,
  patronymic = "",
) {
  return [lastName, firstName, patronymic].filter(Boolean).join(" ").trim();
}

export function buildAvatarUrl(seed) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;
}
