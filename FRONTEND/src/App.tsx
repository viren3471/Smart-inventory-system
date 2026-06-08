import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Udhaar from './pages/Udhaar';
import Expenses from './pages/Expenses';
import Suppliers from './pages/Suppliers';
import Login from './pages/Login';

// SECURITY GUARD: Protects pages from unauthorized users
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  // If they have a token, let them in. If not, kick to login.
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Unlocked Route */}
        <Route path="/login" element={<Login />} />

        {/* Locked Routes (Wrapped in the Layout/Sidebar) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* These pages open inside the Layout */}
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="udhaar" element={<Udhaar />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="suppliers" element={<Suppliers />} />
        </Route>

        {/* Catch-all: If they type a random URL, send them to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;