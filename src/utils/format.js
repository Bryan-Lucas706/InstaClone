// ============================================================
// INSTACLONE — Utilitário de formatação numérica
// ============================================================

/**
 * formatCount() — formata números grandes de forma legível.
 * Exemplos: 1200 → "1,2k" | 4500000 → "4,5M" | 999 → "999"
 */
export function formatCount(n) {
  if (typeof n !== 'number' || isNaN(n)) return '0'

  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M'
  }

  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace('.', ',') + 'k'
  }

  return String(n)
}