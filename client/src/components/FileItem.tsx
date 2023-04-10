import { UserFile } from '../types/file';
import { formatFileSize } from '../utils/formatFileSize';

interface FileItemProps {
  file: UserFile;
  onDownload: (file: UserFile) => void;
  onDelete: (file: UserFile) => void;
}

function getFileType(name: string) {
  return name.split('.').pop()?.toUpperCase() ?? '';
}

function FileItem({ file, onDownload, onDelete }: FileItemProps) {
  return (
    <tr>
      <td className="file-name">{file.originalName}</td>
      <td>{getFileType(file.originalName)}</td>
      <td>{formatFileSize(file.size)}</td>
      <td>{new Date(file.createdAt).toLocaleDateString()}</td>
      <td className="file-actions">
        <button onClick={() => onDownload(file)}>Download</button>
        <button onClick={() => onDelete(file)}>Delete</button>
      </td>
    </tr>
  );
}

export default FileItem;
