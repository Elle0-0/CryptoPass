import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, CreditCard, Ticket, RotateCcw } from 'lucide-react'; // Icon library
import '../styles/HomePage.css'; // CSS for styling

const HomePage = () => {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Welcome to CryptoPass</h1>
        <p>Secure and seamless blockchain ticketing—right at your fingertips.</p>
      </header>

      <div className="homepage-buttons-grid">
        <Link to="/wallet" className="homepage-button-card">
          <Wallet size={32} />
          <span>Manage Wallet</span>
        </Link>

        <Link to="/balance" className="homepage-button-card">
          <CreditCard size={32} />
          <span>Check Balances</span>
        </Link>

        <Link to="/buy-ticket" className="homepage-button-card">
          <Ticket size={32} />
          <span>Buy Tickets</span>
        </Link>

        <Link to="/return-ticket" className="homepage-button-card">
          <RotateCcw size={32} />
          <span>Return Tickets</span>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
