const units = ['B', 'KB', 'MB', 'GB'];

export function formatFileSize(bytes: number) {
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Number(size.toFixed(1))} ${units[unitIndex]}`;
}
