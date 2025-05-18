import React, { useState } from 'react';
import { initWeb3 } from './TicketToken';

function DecryptWallet() {
  const [password, setPassword] = useState('');
  const [keystore, setKeystore] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [keystoreText, setKeystoreText] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setKeystore(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const decryptWallet = async () => {
    setError('');
    setWalletAddress('');
    setPrivateKey('');

    if (!password) {
      setError('Please enter a password');
      setShowModal(true);
      return;
    }

    if (!keystore) {
      setError('Please select a keystore file');
      setShowModal(true);
      return;
    }

    try {
      const { web3 } = await initWeb3(); // Use the existing initWeb3 function
      const wallet = web3.eth.accounts.decrypt(keystore, password);

      console.log('Keystore string:', keystore);
      console.log('Wallet address:', wallet.address);

      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);
      setKeystoreText(keystore);
    } catch (err) {
      console.error('Decryption failed:', err);
      setError('Decryption failed: ' + err.message);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="DecryptWallet" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Decrypt a Wallet</h1>

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

      <div style={{ marginBottom: '20px' }}>
        <label>
          Keystore File:
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>

      <button onClick={decryptWallet} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Decrypt Wallet
      </button>

      {walletAddress && (
        <div style={{ marginTop: '20px' }}>
          <h3>Decrypted Wallet Details</h3>
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
            <textarea rows="5" cols="50" value={keystoreText} readOnly style={{ marginTop: '10px' }} />
          </p>
        </div>
      )}

      {/* Error Modal */}
      {showModal && (
        <div className="modal" style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <div className="modal-content">
            <span
              className="close"
              onClick={closeModal}
              style={{ cursor: 'pointer', float: 'right', fontSize: '20px', fontWeight: 'bold' }}
            >
              &times;
            </span>
            <p style={{ color: 'red' }}>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DecryptWallet;
