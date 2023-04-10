import { useState } from 'react';
import { UserFile } from '../types/file';
import FileItem from './FileItem';

interface FileListProps {
  files: UserFile[];
  onDownload: (file: UserFile) => void;
  onDelete: (file: UserFile) => Promise<void>;
}

function FileList({ files, onDownload, onDelete }: FileListProps) {
  const [fileToDelete, setFileToDelete] = useState<UserFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  function closeDialog() {
    setFileToDelete(null);
    setDeleteError('');
  }

  async function confirmDelete() {
    if (!fileToDelete) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await onDelete(fileToDelete);
      setFileToDelete(null);
    } catch {
      setDeleteError('Unable to delete file. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
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
            <FileItem
              key={file.id}
              file={file}
              onDownload={onDownload}
              onDelete={setFileToDelete}
            />
          ))}
        </tbody>
      </table>

      {fileToDelete && (
        <div className="dialog-backdrop">
          <div className="dialog" role="dialog" aria-modal="true">
            <p>Delete "{fileToDelete.originalName}"?</p>
            {deleteError && <p className="error">{deleteError}</p>}
            <div className="dialog-actions">
              <button onClick={closeDialog} disabled={deleting}>
                Cancel
              </button>
              <button className="button-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FileList;
