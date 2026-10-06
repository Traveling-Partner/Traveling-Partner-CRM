/**
 * Display-only formatting. Values sent back to the API stay as the API sent them.
 * Phone: +92 333 3934971. CNIC: 44203-2527095-1.
 */

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Pakistani mobile shown as +92 XXX XXXXXXX. Unrecognized values stay unchanged. */
export function formatPhone(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;

  let digits = digitsOnly(trimmed);
  if (!digits) return trimmed;

  if (digits.startsWith("0092")) digits = digits.slice(4);
  if (digits.startsWith("92") && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);

  if (digits.length !== 10) return trimmed;
  return `+92 ${digits.slice(0, 3)} ${digits.slice(3)}`;
}

/** 13-digit CNIC shown as 44203-2527095-1. Other values stay unchanged. */
export function formatCnic(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;

  const digits = digitsOnly(trimmed);
  if (digits.length !== 13) return trimmed;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function showPhone(value: string | null | undefined, empty = "—"): string {
  return formatPhone(value) ?? empty;
}

export function showCnic(value: string | null | undefined, empty = "—"): string {
  return formatCnic(value) ?? empty;
}
