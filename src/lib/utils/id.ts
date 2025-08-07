// Fix for missing cuid2 package - using simple random ID generator
export function createId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}