import { useState } from 'react';
import axios from 'axios';
import Alert from '@mui/material/Alert';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const submit = async () => {
    setShowAlert(false);
    try {
      await axios.post('http://localhost:5000/api/auth/register', { username, password }, { withCredentials: true });
      setAlertMsg("Registered successfully! You can now log in.");
      setAlertSeverity('success');
      setShowAlert(true);
    } catch (err) {
      setAlertMsg(err.response?.data?.error || 'Registration failed');
      setAlertSeverity('warning');
      setShowAlert(true);
    }
  };

  return (
    <div className="register-form">
      <h3>Register</h3>
      
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {showAlert && (
        <Alert severity={alertSeverity} color={alertSeverity === 'success' ? 'success' : 'warning'}>
          {alertMsg}
        </Alert>
      )}
      <button onClick={submit}>Register</button>
    </div>
  );
}

export default RegisterForm;
