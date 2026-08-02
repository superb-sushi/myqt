// Dusk & Cobalt: cobalt → cream (at 5) → yellow (at 8) → terracotta (at 10)
const STOPS = ['#1E3A6E', '#EDE4D0', '#F0C040', '#C4601A'];
const POSITIONS = [0, 4 / 9, 7 / 9, 1];

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

export function ratingToColor(rating: number): string {
  const t = (rating - 1) / 9;
  let i = POSITIONS.length - 2;
  for (let j = 0; j < POSITIONS.length - 1; j++) {
    if (t <= POSITIONS[j + 1]) { i = j; break; }
  }
  const tt = Math.max(0, Math.min(1, (t - POSITIONS[i]) / (POSITIONS[i + 1] - POSITIONS[i])));
  const a = hexToRgb(STOPS[i]);
  const b = hexToRgb(STOPS[i + 1]);
  const r = Math.round(a.r + (b.r - a.r) * tt);
  const g = Math.round(a.g + (b.g - a.g) * tt);
  const bl = Math.round(a.b + (b.b - a.b) * tt);
  return `rgb(${r},${g},${bl})`;
}
