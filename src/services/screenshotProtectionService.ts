const SUSPICIOUSLY_SMALL_SCREENSHOT_BYTES = 2000;

export function isLikelyProtectedScreenshot(base64Png: string): boolean {
  const byteLength = Buffer.from(base64Png, 'base64').length;
  return byteLength < SUSPICIOUSLY_SMALL_SCREENSHOT_BYTES;
}
