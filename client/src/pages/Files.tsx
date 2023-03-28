import { useAuth } from '../hooks/useAuth';

function Files() {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <header className="header">
        <h1>File Sharing</h1>
        <div className="header-user">
          <span>{user?.name}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
    </div>
  );
}

export default Files;
