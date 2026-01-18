import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Strategies from './pages/Strategies';
import CreateStrategy from './pages/CreateStrategy';
import Backtests from './pages/Backtests';
import BacktestResults from './pages/BacktestResults';
import Layout from './components/Layout';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="strategies" element={<Strategies />} />
            <Route path="strategies/create" element={<CreateStrategy />} />
            <Route path="strategies/edit/:id" element={<CreateStrategy />} />
            <Route path="backtests" element={<Backtests />} />
            <Route path="backtests/:id" element={<BacktestResults />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
