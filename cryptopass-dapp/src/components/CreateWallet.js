import React, { useState } from 'react';
import { initWeb3 } from './TicketToken';
import '../styles/CreateWallet.css'; 

function CreateWallet() {
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [keystore, setKeystore] = useState('');
  const [message, setMessage] = useState('');

  const validatePassword = (password) => {
    if (password.includes(' ')) return 'Password cannot contain spaces.';
    if (password.length < 3) return 'Password must be at least 3 characters long.';
    return null;
  };

  const createWallet = async () => {
    const validationError = validatePassword(password);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      const { web3 } = await initWeb3();
      const wallet = web3.eth.accounts.create();
      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);

      const encryptedKeystore = web3.eth.accounts.encrypt(wallet.privateKey, password);
      setKeystore(JSON.stringify(encryptedKeystore));
      setMessage('Wallet created successfully!');
    } catch (error) {
      console.error('Error creating wallet:', error);
      setMessage('Failed to create wallet. Please try again.');
    }
  };

  const downloadKeystore = () => {
    if (!keystore) {
      alert('Please create a wallet first.');
      return;
    }

    const blob = new Blob([keystore], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${walletAddress}.json`;
    a.click();
  };

  return (
    <div className="create-wallet-container">
      <h1 className="title">Create a Wallet</h1>

      <div className="form-group">
        <label htmlFor="password">Password for Keystore:</label>
        <input
          id="password"
          type="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </div>

      <button className="button" onClick={createWallet}>
        Create Wallet
      </button>

      {message && (
        <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      {walletAddress && (
        <div className="wallet-details">
          <h3>Wallet Details</h3>

          <div className="detail">
            <label>Wallet Address:</label>
            <textarea value={walletAddress} readOnly className="textarea" rows="2" />
          </div>

          <div className="detail">
            <label>Private Key:</label>
            <textarea value={privateKey} readOnly className="textarea" rows="2" />
          </div>

          <div className="detail">
            <label>Keystore File:</label>
            <textarea value={keystore} readOnly className="textarea" rows="5" />
          </div>

          <button className="button secondary" onClick={downloadKeystore}>
            Download Keystore
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateWallet;
