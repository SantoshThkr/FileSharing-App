import { formatFileSize } from '../src/utils/formatFileSize';

describe('formatFileSize', () => {
  it('formats bytes into readable units', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(250880)).toBe('245 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1258291)).toBe('1.2 MB');
  });
});
