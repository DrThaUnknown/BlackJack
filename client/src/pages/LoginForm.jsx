import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Alert from '@mui/material/Alert';


function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [showAlert, setShowAlert] = useState(false);

  const submit = async () => {
    setShowAlert(false);
    try {
      await login(username, password);
    } catch (err) {
      setShowAlert(true);
    }
  };

  const [alertSeverity, setAlertSeverity] = useState('warning');
  const [alertMsg, setAlertMsg] = useState('Login info not found.');

  return (
    <div className="login-form">
      <h3>Login</h3>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      {showAlert && (
        <Alert severity={alertSeverity} color={alertSeverity === 'success' ? 'success' : 'warning'}>
          {alertMsg}
        </Alert>
      )}

      <button
        onClick={async () => {
          setShowAlert(false);
          try {
            await login(username, password);
            setAlertSeverity('success');
            setAlertMsg('Login successful!');
            setShowAlert(true);
          } catch (err) {
            setAlertSeverity('warning');
            setAlertMsg('Login info not found.');
            setShowAlert(true);
          }
        }}
      >
        Login
      </button>

      <p className="register-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default LoginForm;
