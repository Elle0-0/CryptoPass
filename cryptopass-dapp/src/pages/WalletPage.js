import React, { useState } from 'react';
import CreateWallet from '../components/CreateWallet';
import DecryptWallet from '../components/DecryptWallet';

function WalletPage() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="wallet-page-container">
      <h1 className="wallet-title">Wallet Management</h1>

      <div className="tab-buttons">
        <button
          onClick={() => setActiveTab('create')}
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
        >
          Create Wallet
        </button>
        <button
          onClick={() => setActiveTab('decrypt')}
          className={`tab-button ${activeTab === 'decrypt' ? 'active' : ''}`}
        >
          Decrypt Wallet
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'create' && <CreateWallet />}
        {activeTab === 'decrypt' && <DecryptWallet />}
      </div>
    </div>
  );
}

export default WalletPage;
