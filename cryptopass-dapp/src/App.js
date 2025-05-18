import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WalletPage from './pages/WalletPage';
import './styles/App.css';
import BalanceChecker from './pages/BalanceChecker';
import BuyTicket from './components/BuyTicket';
import ReturnTicket from './components/ReturnTicket';
import HomePage from './pages/HomePage';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Shows from './components/Shows';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={< HomePage/>} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/balance" element={<BalanceChecker />} />
        <Route path="/buy-ticket" element={<BuyTicket />} />
        <Route path="/return-ticket" element={<ReturnTicket />} />
        <Route path="/shows" element={<Shows />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;