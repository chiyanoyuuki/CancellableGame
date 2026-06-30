/** Small unique-id generator for locally-created rows (players, etc.). */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
