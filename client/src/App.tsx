import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Files from './pages/Files';
import Login from './pages/Login';
import Register from './pages/Register';

function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p className="page-message">Loading...</p>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p className="page-message">Loading...</p>;
  return user ? <Navigate to="/files" replace /> : <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path="/files" element={<Files />} />
      </Route>
      <Route path="*" element={<Navigate to="/files" replace />} />
    </Routes>
  );
}

export default App;
