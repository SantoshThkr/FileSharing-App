import api, { ApiResponse } from './api';
import { UserFile } from '../types/file';

export async function uploadFile(file: File, onProgress?: (percent: number) => void) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<ApiResponse<UserFile>>('/files', formData, {
    onUploadProgress: event => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return res.data.data;
}
