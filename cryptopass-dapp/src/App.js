import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WalletPage from './pages/WalletPage';
import './styles/App.css';
// import AnotherPage from './pages/AnotherPage'; // later if you want

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WalletPage />} />
        {/* Example of adding more pages later */}
        {/* <Route path="/another" element={<AnotherPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
