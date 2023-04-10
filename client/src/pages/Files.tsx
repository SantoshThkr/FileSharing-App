import { useEffect, useState } from 'react';
import FileList from '../components/FileList';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../hooks/useAuth';
import { deleteFile, downloadFile, getFiles } from '../services/fileApi';
import { UserFile } from '../types/file';

const PAGE_SIZE = 10;

function Files() {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    getFiles({ search, type, page, limit: PAGE_SIZE })
      .then(data => {
        if (ignore) return;
        setFiles(data.files);
        setTotalPages(data.pagination.totalPages);
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
  }, [search, type, page, reloadKey]);

  function reloadFiles() {
    setReloadKey(key => key + 1);
  }

  async function handleDownload(file: UserFile) {
    setDownloadError('');
    try {
      await downloadFile(file);
    } catch {
      setDownloadError(`Unable to download "${file.originalName}".`);
    }
  }

  async function handleDelete(file: UserFile) {
    await deleteFile(file.id);

    if (files.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      reloadFiles();
    }
  }

  function renderFiles() {
    if (loading && files.length === 0) {
      return <p className="page-message">Loading files...</p>;
    }
    if (error) {
      return <p className="page-message error">{error}</p>;
    }
    if (files.length === 0) {
      return <p className="page-message">No files found.</p>;
    }
    return <FileList files={files} onDownload={handleDownload} onDelete={handleDelete} />;
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

      <FileUpload onUploaded={reloadFiles} />

      <div className="toolbar">
        <label>
          Search
          <input
            type="search"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by file name"
          />
        </label>

        <label>
          Filter
          <select
            value={type}
            onChange={e => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="pdf">PDF</option>
            <option value="doc">Word</option>
            <option value="txt">Text</option>
            <option value="image">Images</option>
            <option value="zip">ZIP</option>
          </select>
        </label>
      </div>

      {downloadError && <p className="error">{downloadError}</p>}

      {renderFiles()}

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Files;
