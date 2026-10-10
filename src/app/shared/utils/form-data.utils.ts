// ─────────────────────────────────────────────────────────────────
// shared/utils/form-data.utils.ts
// Conversion payload → FormData pour les uploads de fichiers
// ─────────────────────────────────────────────────────────────────

/**
 * Convertit un payload en FormData si celui-ci contient un File.
 * Sinon retourne le payload tel quel pour un envoi JSON.
 *
 * Parcourt les clés récursivement. Les valeurs null/undefined sont
 * ignorées. Les tableaux et objets imbriqués (ex: primary_unit) sont
 * sérialisés avec la notation clé[sous-clé] attendue par Laravel.
 */
export function toFormDataIfNeeded<T extends object>(payload: T): FormData | T {
  const hasFile = Object.values(payload).some(v => v instanceof File);
  if (!hasFile) return payload;

  const fd = new FormData();
  appendToFormData(fd, payload as Record<string, unknown>);
  return fd;
}

function appendToFormData(fd: FormData, data: Record<string, unknown>, prefix?: string): void {
  for (const [key, rawValue] of Object.entries(data)) {
    const fieldKey = prefix ? `${prefix}[${key}]` : key;
    appendValue(fd, fieldKey, rawValue);
  }
}

function appendValue(fd: FormData, fieldKey: string, value: unknown): void {
  if (value === null || value === undefined) return;

  if (value instanceof File) {
    fd.append(fieldKey, value);
  } else if (value instanceof Date) {
    fd.append(fieldKey, value.toISOString());
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => appendValue(fd, `${fieldKey}[${i}]`, item));
  } else if (typeof value === 'boolean') {
    fd.append(fieldKey, value ? '1' : '0');
  } else if (typeof value === 'object') {
    appendToFormData(fd, value as Record<string, unknown>, fieldKey);
  } else {
    fd.append(fieldKey, String(value));
  }
}
