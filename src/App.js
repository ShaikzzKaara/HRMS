import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import EmployeeHome from './employyehome';
import TicketingSystem from './TicketingSystem';
import Login from './Login';
import HRDashboard from './HRDashboard';
import RedirectToDashboard from './RedirectToDashboard';
import LogoutRedirect from './LogoutRedirect';
import PostLoginRedirect from './PostLoginRedirect';
import UpdatePassword from './UpdatePassword';
import HRTicketing from './HRTicketing';
import './App.css';

// User Context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Remove auto-login from localStorage
  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');
  //   if (storedUser) setUser(JSON.parse(storedUser));
  // }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

function App() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage if present
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [setUser]);

  if (loading) {
    return <div>Loading...</div>;  // Or a spinner
  }

  function LogoutHandler({ children }) {
    const navigate = useNavigate();
    const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      navigate('/', { replace: true });
    };
    return children(handleLogout);
  }

  function LoginWrapper(props) {
    const navigate = useNavigate();
    const handleLogin = async (username, password) => {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Employee login response:', data); // Debug log
        if (data.user.mustChangePassword) {
          setTempUser(data.user); // Store user for password update
          navigate('/update-password', { replace: true });
          return true;
        } else {
          // Check if user is HR - prevent HR users from logging in through employee form
          if (data.user.role === 'hr') {
            console.log('HR user trying to login through employee form - denied'); // Debug log
            return false; // Return false to show error message
          }
          
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.user.token || 'employee');
          // Redirect based on user role
          console.log('User role:', data.user.role); // Debug log
          if (data.user.role === 'hr') {
            console.log('Redirecting HR user to /hrdashboard'); // Debug log
            navigate('/hrdashboard', { replace: true });
          } else {
            console.log('Redirecting employee to /home'); // Debug log
          navigate('/home', { replace: true });
          }
          return true;
        }
      }
      return false;
    };

    // Redirect based on user role if already logged in
    if (user) {
      console.log('User already logged in, role:', user.role); // Debug log
      if (user.role === 'hr') {
        console.log('Redirecting logged in HR user to /hrdashboard'); // Debug log
        return <Navigate to="/hrdashboard" replace />;
      } else {
        console.log('Redirecting logged in employee to /home'); // Debug log
        return <Navigate to="/home" replace />;
      }
    }
    return <Login onLogin={handleLogin} />;
  }

  function PrivateRoute({ children, currentUser, redirectTo }) {
    return currentUser ? children : <Navigate to={redirectTo} replace />;
  }

  function UpdatePasswordWrapper() {
    const navigate = useNavigate();
    return (
      <UpdatePassword
        username={tempUser?.username}
        onSuccess={(user) => {
          // Defensive: always ensure username is present
          const completeUser = { ...user, username: user.username || tempUser?.username };
          setUser(completeUser);
          localStorage.setItem('user', JSON.stringify(completeUser));
          localStorage.setItem('userId', completeUser.id);
          localStorage.setItem('token', completeUser.token || 'employee');
          navigate('/home', { replace: true });
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <LogoutHandler>{(handleLogout) => (
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/update-password" element={<UpdatePasswordWrapper />} />
          <Route path="/employeehome" element={<Navigate to="/home" replace />} />
          <Route
            path="/home"
            element={
              <PrivateRoute currentUser={user} redirectTo="/login">
                {user?.role === 'hr' ? (
                  <Navigate to="/hrdashboard" replace />
                ) : (
                <EmployeeHome user={user} userId={user?.id} onLogout={handleLogout} />
                )}
              </PrivateRoute>
            }
          />
          <Route
            path="/ticketing"
            element={
              <PrivateRoute currentUser={user} redirectTo="/login">
                {user?.role === 'hr'
                  ? <HRTicketing user={user} onLogout={handleLogout} />
                  : <TicketingSystem user={user} userId={user?.id} onLogout={handleLogout} />
                }
              </PrivateRoute>
            }
          />
          <Route
            path="/hrdashboard"
            element={
              <PrivateRoute currentUser={user} redirectTo="/login">
                <HRDashboard user={user} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route path="/redirect-dashboard" element={<RedirectToDashboard />} />
          <Route path="/logout-redirect" element={<LogoutRedirect onLogout={() => {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            sessionStorage.clear();
          }} />} />
          <Route path="/post-login" element={<PostLoginRedirect role={user?.role} />} />
          {/* Catch-all route to always redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}</LogoutHandler>
    </BrowserRouter>
  );
}

const RootApp = () => (
  <UserProvider>
    <App />
  </UserProvider>
);

export default RootApp;
