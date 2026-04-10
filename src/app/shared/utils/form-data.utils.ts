// ─────────────────────────────────────────────────────────────────
// shared/utils/form-data.utils.ts
// Conversion payload → FormData pour les uploads de fichiers
// ─────────────────────────────────────────────────────────────────

/**
 * Convertit un payload en FormData si celui-ci contient un File.
 * Sinon retourne le payload tel quel pour un envoi JSON.
 *
 * Parcourt toutes les clés (profondeur 1). Les valeurs null/undefined
 * sont ignorées. Les tableaux sont sérialisés avec la notation clé[].
 */
export function toFormDataIfNeeded(payload: Record<string, unknown>): FormData | Record<string, unknown> {
  const hasFile = Object.values(payload).some(v => v instanceof File);
  if (!hasFile) return payload;

  const fd = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;

    if (value instanceof File) {
      fd.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach(item => fd.append(`${key}[]`, String(item)));
    } else {
      fd.append(key, String(value));
    }
  }

  return fd;
}
