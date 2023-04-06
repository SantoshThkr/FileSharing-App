import { useEffect, useState } from 'react';
import FileList from '../components/FileList';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../hooks/useAuth';
import { downloadFile, getFiles } from '../services/fileApi';
import { UserFile } from '../types/file';

function Files() {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    getFiles()
      .then(data => {
        if (ignore) return;
        setFiles(data.files);
        setError('');
      })
      .catch(() => {
        if (!ignore) setError('Unable to load files.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  async function handleDownload(file: UserFile) {
    setDownloadError('');
    try {
      await downloadFile(file);
    } catch {
      setDownloadError(`Unable to download "${file.originalName}".`);
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>File Sharing</h1>
        <div className="header-user">
          <span>{user?.name}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>

      <FileUpload onUploaded={() => setReloadKey(key => key + 1)} />

      {downloadError && <p className="error">{downloadError}</p>}

      {loading && files.length === 0 ? (
        <p className="page-message">Loading files...</p>
      ) : error ? (
        <p className="page-message error">{error}</p>
      ) : (
        <FileList files={files} onDownload={handleDownload} />
      )}
    </div>
  );
}

export default Files;
