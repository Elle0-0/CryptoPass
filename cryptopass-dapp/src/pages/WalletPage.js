import React, { useState } from 'react';
import CreateWallet from '../components/CreateWallet';
import DecryptWallet from '../components/DecryptWallet';

function WalletPage() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="WalletPage">
      <h1>Wallet Management</h1>

      <div className="tab-buttons">
        <button 
          onClick={() => setActiveTab('create')} 
          className={activeTab === 'create' ? 'active' : ''}
        >
          Create Wallet
        </button>
        <button 
          onClick={() => setActiveTab('decrypt')} 
          className={activeTab === 'decrypt' ? 'active' : ''}
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
