import "../App.css";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';

function Account() {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/blackjack/stats', { withCredentials: true });
      setStats(res.data);
      setError(null);

      if (res.data.wallet !== undefined) {
        setUser(prev => ({ ...prev, wallet: res.data.wallet }));
      }
    } catch (error) {
      setError('Failed to fetch stats. Please make sure the server is running and CORS is enabled.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
  }, []);

  return (
    <div className="account-page-container">
      <h1 className="home-title">Account Page</h1>
      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {stats && !loading && !error && (
        <div className="user-info-section">
          <h2>User Info</h2>
          <p>Username: {stats?.username || user?.username}</p>
          <p>Wallet: {stats?.wallet ?? user?.wallet}</p>
          <p>Streak: {stats?.streak}</p>
          <h3>Last 5 Games</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(stats?.last5) && stats.last5.length > 0 ? (
                stats.last5.map(game => (
                  <tr key={game._id}>
                    <td>
                      {new Date(game.date).toLocaleString()}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {game.result}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center' }}>No recent games.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Account;