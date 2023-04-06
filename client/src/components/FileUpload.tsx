import { ChangeEvent, useRef, useState } from 'react';
import { getErrorMessage } from '../services/api';
import { uploadFile } from '../services/fileApi';
import { formatFileSize } from '../utils/formatFileSize';

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip';

interface FileUploadProps {
  onUploaded: () => void;
}

function FileUpload({ onUploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setProgress(0);
    setError('');
    setSuccess('');
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await uploadFile(file, setProgress);
      setSuccess(`${file.name} uploaded successfully.`);
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      onUploaded();
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="upload">
      <div className="upload-row">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleChange}
          disabled={uploading}
          aria-label="Choose file"
        />
        <button className="button-primary" onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {file && (
        <p className="upload-info">
          {file.name} ({formatFileSize(file.size)})
        </p>
      )}

      {uploading && (
        <div className="upload-progress">
          <progress value={progress} max={100} />
          <span>{progress}%</span>
        </div>
      )}

      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

export default FileUpload;
