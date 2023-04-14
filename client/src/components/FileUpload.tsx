import { ChangeEvent, useRef, useState } from 'react';
import { getErrorMessage } from '../services/api';
import { uploadFile } from '../services/fileApi';
import { formatFileSize } from '../utils/formatFileSize';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'zip'];

function validateFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return 'This file type is not supported.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File is larger than 10 MB.';
  }
  return '';
}

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
    const selected = event.target.files?.[0] ?? null;
    const validationError = selected ? validateFile(selected) : '';

    setFile(validationError ? null : selected);
    setError(validationError);
    setSuccess('');
    setProgress(0);

    if (validationError) {
      event.target.value = '';
    }
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
          accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
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
