import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, CreditCard, Ticket, RotateCcw, Calendar } from 'lucide-react'; 
import '../styles/HomePage.css'; 

const HomePage = () => {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Welcome to CryptoPass</h1>
        <p>Breaking the chain of paper tickets, One block at a time</p>
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

        <Link to="/shows" className="homepage-button-card">
          <Calendar size={32} />
          <span>What's On</span>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
