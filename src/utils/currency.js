// Currency utility helpers: operate in copper (cp) internally

// Convert gp (number) to cp (integer)
export function toCpFromGp(gp) {
  const n = Number(gp) || 0;
  return Math.round(n * 100);
}

// Convert cp (integer) to gp (number)
export function toGp(cp) {
  const n = Number(cp) || 0;
  return n / 100;
}

// Format cp to a display string in gp
export function formatGp(cp, opts = {}) {
  const gp = toGp(cp);
  // Adaptive decimals: show cents when under 1 gp or when there's a fractional gp value
  let decimals = typeof opts.decimals === 'number' ? opts.decimals : undefined;
  if (decimals === undefined) {
    const hasFraction = Math.abs(cp % 100) !== 0;
    decimals = Math.abs(cp) < 100 || hasFraction ? 2 : 0;
  }
  const value = gp.toFixed(decimals);
  return `${value} gp`;
}

// Format cp to a coin breakdown string like "1 gp, 2 sp, 3 cp"
// Omits zero denominations and supports negative values
export function formatCoins(cp) {
  const total = Number(cp) || 0;
  const sign = total < 0 ? '-' : '';
  let remaining = Math.abs(Math.trunc(total));
  const gp = Math.floor(remaining / 100);
  remaining -= gp * 100;
  const sp = Math.floor(remaining / 10);
  remaining -= sp * 10;
  const copper = remaining;

  const parts = [];
  if (gp) parts.push(`${gp} gp`);
  if (sp) parts.push(`${sp} sp`);
  if (copper || parts.length === 0) parts.push(`${copper} cp`);

  return sign + parts.join(', ');
}

// Parse a gp range string like "300-1200" into min/max gp numbers
export function parseGpRange(rangeStr) {
  if (typeof rangeStr !== 'string') return { minGp: 0, maxGp: 0 };
  const m = rangeStr.match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return { minGp: 0, maxGp: 0 };
  const minGp = parseInt(m[1], 10);
  const maxGp = parseInt(m[2], 10);
  return { minGp, maxGp };
}

