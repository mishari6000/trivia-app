/** Arabic number agreement for seconds: ثانية واحدة، ثانيتان، 3–10 ثوانٍ، 11+ ثانية. */
export function secondsInArabic(n: number): string {
  if (n === 1) return 'ثانية واحدة';
  if (n === 2) return 'ثانيتان';
  if (n <= 10) return `${n} ثوانٍ`;
  return `${n} ثانية`;
}
