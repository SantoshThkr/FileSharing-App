import { UserFile } from '../types/file';
import FileItem from './FileItem';

interface FileListProps {
  files: UserFile[];
  onDownload: (file: UserFile) => void;
}

function FileList({ files, onDownload }: FileListProps) {
  return (
    <table className="file-table">
      <thead>
        <tr>
          <th>File Name</th>
          <th>Type</th>
          <th>Size</th>
          <th>Date</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {files.map(file => (
          <FileItem key={file.id} file={file} onDownload={onDownload} />
        ))}
      </tbody>
    </table>
  );
}

export default FileList;
