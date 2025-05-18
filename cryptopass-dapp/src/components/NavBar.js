import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">CryptoPass</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/wallet">Wallet</Link></li>
        <li><Link to="/balance">Balance</Link></li>
        <li><Link to="/buy-ticket">Buy Ticket</Link></li>
        <li><Link to="/return-ticket">Return Ticket</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;