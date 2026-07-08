/**
 * Save a fetch Response body as a downloaded file. Centralises the blob →
 * object-URL → anchor-click pattern so report/export features don't each reinvent
 * it (mirrors the existing vehicle PDF download).
 */
export async function downloadResponse(
  response: Response,
  filename: string,
): Promise<void> {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}
