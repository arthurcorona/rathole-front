// Estimativa de tempo de leitura (~200 palavras/min).
// Usado na lista de posts (PostGrid) e na página do post (PostDetail)
// pra os valores sempre baterem.
export function readingTime(content: string): number {
  const words = (content ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
