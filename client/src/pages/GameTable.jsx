import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../pages/AuthContext';
import CountUp from '../components/CountUp'
import "../App.css"

function GameTable() {
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');
  const [bet, setBet] = useState('');

  const startGame = async () => {
  try {
    setBet(''); // Clear bet early to prevent re-using old value
    const res = await axios.post('http://localhost:5000/api/blackjack/start', { bet }, { withCredentials: true });
    setPlayer(res.data.player);
    setDealer(res.data.dealer);
    setStatus(res.data.status);
    setResult('');
    if (res.data.wallet !== undefined) {
      setUser(prev => ({ ...prev, wallet: res.data.wallet }));
    }
  } catch (err) {
    alert(err.response?.data?.error || 'Error starting game');
  }
};


  const hit = async () => {
    const res = await axios.post('http://localhost:5000/api/blackjack/hit', {}, { withCredentials: true });
    setPlayer(res.data.player);
    setStatus(res.data.status);
    setResult(res.data.result || '');

    
  };
  const { user, setUser } = useAuth();

  const stand = async () => {
    const res = await axios.post('http://localhost:5000/api/blackjack/stand', {}, { withCredentials: true });
    setDealer(res.data.dealer);
    setStatus(res.data.status);
    setResult(`You ${res.data.result}!`);

    // ✅ update wallet in context
    if (res.data.wallet !== undefined) {
      setUser(prev => ({ ...prev, wallet: res.data.wallet }));
    }
  };



  const getCardImg = (value, suit) => {
    let val = value;
    if (value === 'A') val = 'A';
    else if (value === 'K') val = 'king';
    else if (value === 'Q') val = 'queen';
    else if (value === 'J') val = 'jack';
    else val = value.toLowerCase();
    return `/img/${val}_of_${suit.toLowerCase()}.png`;
  };

  const renderCards = (cards, showHidden = false) => (
    cards.map((card, i) =>
      card.hidden && !showHidden
        ? <img key={i} src="/img/back.png" alt="Hidden Card" className="card-img" />
        : <img key={i} src={getCardImg(card.value, card.suit)} alt={`${card.value} of ${card.suit}`} className="card-img" />
    )
  );

  const calculateValue = (hand) => {
    let value = 0, aceCount = 0;
    for (const card of hand) {
      if (card.hidden) continue;
      if (card.value === 'A') {
        value += 11;
        aceCount++;
      } else if (['K', 'Q', 'J', 'King', 'Queen', 'Jack'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }
    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount--;
    }
    return value;
  };

  const resetWallet = async () => {
  try {
    const res = await axios.patch(
      'http://localhost:5000/api/user/wallet',
      { wallet: 1000 },
      { withCredentials: true }
    );
    setUser(prev => ({ ...prev, wallet: res.data.wallet }));
  } catch (err) {
    alert(err.response?.data?.error || 'Could not reset wallet');
  }
};


  return (
  <div className="game-table-root">
    <h1 className="table-title">♠ Blackjack Table ♣</h1>

    <div className="table-area">
      {/* Dealer Area */}
      <div className="dealer-area">
        <h2 className="area-title">Dealer</h2>
        <div className="cards-container">
          {dealer.map((card, i) => {
            if (card.hidden && result) {
              return (
                <img
                  key={i}
                  src={getCardImg(card.value, card.suit)}
                  alt={`${card.value} of ${card.suit}`}
                  className="card-img reveal-animation"
                />
              );
            }
            if (card.hidden) {
              return (
                <img
                  key={i}
                  src="/img/back.png"
                  alt="Hidden Card"
                  className="card-img"
                />
              );
            }
            return (
              <img
                key={i}
                src={getCardImg(card.value, card.suit)}
                alt={`${card.value} of ${card.suit}`}
                className="card-img"
              />
            );
          })}
        </div>
        <h4 className="score-label">Dealer Total: {result ? calculateValue(dealer) : '?'}</h4>
      </div>

      {/* Player Area */}
      <div className="player-area">
        <h2 className="area-title">Player</h2>
        <div className="cards-container">{renderCards(player)}</div>
      </div>

      {/* Stats and Controls */}
      <div className="controls-area">
        <h4 className="score-label">Player Total: {calculateValue(player)}</h4>

        {result && <h3 className="result-text">{result}</h3>}
        {status === 'ended' && <p className="status-message">Place a new bet to play again.</p>}

        <div className="button-row">
          <button
            className="btn btn-start"
            onClick={startGame}
            disabled={status === 'in progress' || !bet || bet <= 0 || bet > (user?.wallet ?? 0)}
          >
            Start
          </button>
          <button
            className="btn btn-hit"
            onClick={hit}
            disabled={status !== 'in progress'}
          >
            Hit
          </button>
          <button
            className="btn btn-stand"
            onClick={stand}
            disabled={status !== 'in progress'}
          >
            Stand
          </button>
        </div>

        {(user?.wallet ?? 0) <= 9 && status !== 'in progress' && (
          <button
            className="btn btn-reset"
            onClick={resetWallet}
          >
            Reset Wallet
          </button>
        )}
      </div>
    </div>

    {/* Wallet and Bet Input */}
    <div className="wallet-area">
      <p className="wallet-text">
        Wallet: $
        <CountUp
          from={0}
          to={user?.wallet ?? 0}
          separator=","
          direction="up"
          duration={1}
          className='wallet-text'
        />
      </p>
      <input
        type="number"
        value={bet}
        onChange={(e) => setBet(e.target.value)}
        placeholder="Enter your bet"
        disabled={status === 'in progress'}
        className="bet-input"
        min={10}
      />
    </div>
  </div>
);
}

export default GameTable;
