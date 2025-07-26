import React from 'react';
import { Container } from 'react-bootstrap';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { useAuth, AuthProvider } from './contexts/AuthContext';

function AppContent() {
  const { currentUser, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = React.useState('login');

  React.useEffect(() => {
    // Update screen based on auth state
    if (currentUser) {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('login');
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    setCurrentScreen('login');
  };

  const showRegister = () => setCurrentScreen('register');
  const showLogin = () => setCurrentScreen('login');

  return (
    <Container fluid className="p-0">
      {currentScreen === 'login' && (
        <Login onShowRegister={showRegister} />
      )}
      {currentScreen === 'register' && (
        <Register onShowLogin={showLogin} />
      )}
      {currentScreen === 'dashboard' && currentUser && (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      )}
    </Container>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 