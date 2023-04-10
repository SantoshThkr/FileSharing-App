export interface UserFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FileListResponse {
  files: UserFile[];
  pagination: Pagination;
}

export interface FileQuery {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}
