import React, { useState } from 'react';
import { initWeb3 } from './TicketToken';

function CreateWallet() {
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [keystore, setKeystore] = useState('');
  const [message, setMessage] = useState('');

  const validatePassword = (password) => {
    if (password.includes(' ')) {
      return 'Password cannot contain spaces.';
    }
    if (password.length < 3) {
      return 'Password must be at least 3 characters long.';
    }
    return null;
  };

  const createWallet = async () => {
    const validationError = validatePassword(password);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      const { web3 } = await initWeb3(); // Use the existing initWeb3 function
      const wallet = web3.eth.accounts.create(); // Create a new wallet
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
    if (keystore === '') {
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
    <div className="CreateWalletPage" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Create a Wallet</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Password for Keystore:
          <input
            type="password"
            placeholder="Enter a password for the Key Store"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
          />
        </label>
      </div>

      <button onClick={createWallet} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Create Wallet
      </button>

      {message && <p style={{ marginTop: '20px', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}

      {walletAddress && (
        <div style={{ marginTop: '20px' }}>
          <h3>Wallet Details</h3>
          <p>
            <strong>Wallet Address:</strong>
            <textarea rows="2" cols="50" value={walletAddress} readOnly style={{ marginTop: '10px' }} />
          </p>
          <p>
            <strong>Private Key:</strong>
            <textarea rows="2" cols="50" value={privateKey} readOnly style={{ marginTop: '10px' }} />
          </p>
          <p>
            <strong>Keystore File:</strong>
            <textarea rows="5" cols="50" value={keystore} readOnly style={{ marginTop: '10px' }} />
          </p>
          <button onClick={downloadKeystore} style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}>
            Download Keystore
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateWallet;
