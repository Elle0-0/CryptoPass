import React from 'react';
import { Link } from 'react-router-dom';


const HomePage = () => {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Welcome to CryptoPass</h1>
        <p>Your all-in-one solution for event ticketing on the blockchain.</p>
      </header>
      <div className="homepage-buttons">
        <Link to="/wallet">
          <button className="homepage-button">Manage Wallet</button>
        </Link>
        <Link to="/balance">
          <button className="homepage-button">Check Balances</button>
        </Link>
        <Link to="/buy-ticket">
          <button className="homepage-button">Buy Tickets</button>
        </Link>
        <Link to="/return-ticket">
          <button className="homepage-button">Return Tickets</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;