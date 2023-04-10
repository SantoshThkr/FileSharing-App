import api, { ApiResponse } from './api';
import { FileListResponse, FileQuery, UserFile } from '../types/file';

export async function getFiles(query: FileQuery) {
  const res = await api.get<ApiResponse<FileListResponse>>('/files', { params: query });
  return res.data.data;
}

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

export async function downloadFile(file: UserFile) {
  const res = await api.get<Blob>(`/files/${file.id}/download`, { responseType: 'blob' });

  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.originalName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function deleteFile(id: string) {
  await api.delete(`/files/${id}`);
}
