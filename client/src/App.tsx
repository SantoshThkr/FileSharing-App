import { Navigate, Route, Routes } from 'react-router-dom';
import Files from './pages/Files';

function App() {
  return (
    <Routes>
      <Route path="/files" element={<Files />} />
      <Route path="*" element={<Navigate to="/files" replace />} />
    </Routes>
  );
}

export default App;
