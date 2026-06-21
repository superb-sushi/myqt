// Add new sticker filenames here — hash picks deterministically per entry id
export const STICKERS = [
  "/stickers/tofu.png",
  "/stickers/soyasauce.png",
  "/stickers/tama.png",
  "/stickers/fish.png"
];

// djb2-style hash — fast, well-distributed for short strings like cuids
export function pickSticker(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = (h * 33 ^ id.charCodeAt(i)) >>> 0;
  }
  return STICKERS[h % STICKERS.length];
}

// FNV-1a variant — different seed so rotation is independent of sticker pick
export function pickRotation(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  // Range: -15 to +15 degrees
  return (h % 31) - 15;
}
