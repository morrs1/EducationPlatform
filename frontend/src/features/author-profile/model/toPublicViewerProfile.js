/**
 * Drops fields that must not be shown in another user's profile UI.
 * (Backend may still return them over the wire.)
 */
export function toPublicViewerProfile(profile) {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  return Object.fromEntries(
    Object.entries(profile).filter(([key]) => key !== "email"),
  );
}
