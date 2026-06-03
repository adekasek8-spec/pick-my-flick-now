// Generates a deterministic cinematic gradient SVG poster per title.
// No external image service needed — works fully offline.

const PALETTES: [string, string, string][] = [
  ["#0f172a", "#7c3aed", "#f43f5e"], // indigo → violet → rose
  ["#0c1f2e", "#0ea5e9", "#22d3ee"], // deep blue → cyan
  ["#1a0b2e", "#9333ea", "#ec4899"], // purple → pink
  ["#1c1917", "#dc2626", "#f59e0b"], // ember
  ["#052e2b", "#10b981", "#84cc16"], // forest neon
  ["#0a0a0a", "#525252", "#fafafa"], // noir
  ["#2a1810", "#c2410c", "#fbbf24"], // sunset
  ["#1e1b4b", "#3b82f6", "#a78bfa"], // night sky
  ["#3b0764", "#a21caf", "#f0abfc"], // amethyst
  ["#0f1a14", "#15803d", "#facc15"], // emerald gold
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function posterGradient(title: string): { from: string; via: string; to: string } {
  const p = PALETTES[hash(title) % PALETTES.length];
  return { from: p[0], via: p[1], to: p[2] };
}

export function posterDataUrl(title: string, genre = ""): string {
  const { from, via, to } = posterGradient(title);
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const id = `g${hash(title) % 100000}`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450' preserveAspectRatio='xMidYMid slice'>
  <defs>
    <linearGradient id='${id}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='${from}'/>
      <stop offset='55%' stop-color='${via}'/>
      <stop offset='100%' stop-color='${to}'/>
    </linearGradient>
    <radialGradient id='${id}b' cx='30%' cy='25%' r='70%'>
      <stop offset='0%' stop-color='rgba(255,255,255,0.35)'/>
      <stop offset='60%' stop-color='rgba(255,255,255,0)'/>
    </radialGradient>
  </defs>
  <rect width='300' height='450' fill='url(#${id})'/>
  <rect width='300' height='450' fill='url(#${id}b)'/>
  <text x='50%' y='52%' text-anchor='middle' font-family='Bebas Neue, Impact, sans-serif' font-size='150' fill='rgba(255,255,255,0.92)' letter-spacing='4'>${initials}</text>
  <text x='50%' y='88%' text-anchor='middle' font-family='Inter, sans-serif' font-size='14' fill='rgba(255,255,255,0.7)' letter-spacing='3'>${genre.toUpperCase().slice(0, 28)}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
