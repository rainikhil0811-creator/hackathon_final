import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddStock from './pages/AddStock';
import Inventory from './pages/Inventory';
import ExpiryAlerts from './pages/ExpiryAlerts';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [session, setSession] = useState(null); // Mock session for now

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Main layout routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="add-stock" element={<AddStock />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="expiry-alerts" element={<ExpiryAlerts />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
