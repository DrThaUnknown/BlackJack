import { Link } from 'react-router-dom';
import "../App.css";
import SplitText from '../components/SplitText';

function Home() {
  return (
    <div className="home">
      <div className="home-content">
        <h1 className="home-title">
          <SplitText text="Blackjack"
          className='home-title'
          delay={130}
          duration={0.6}
          ease="power3.out"/>
        </h1>
        <p className="home-desc">
          Ready to test your luck and skill? Step up to the table and play the classic game of Blackjack!
        </p>
        <Link to="/table">
          <button className="home-play-btn">
            Start Playing
          </button>
        </Link>
        <div className="home-info">
          <span className="home-info-text">New to Blackjack? </span>
          <Link to="/rules" className="home-rules-link">
            Learn the Rules
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
