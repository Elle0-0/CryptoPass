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
      const { web3 } = await initWeb3();
      const wallet = web3.eth.accounts.decrypt(keystore, password);

      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);
      setKeystoreText(keystore);
    } catch (err) {
      setError('Decryption failed: ' + err.message);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="create-wallet-container">
      <h1 className="title">Decrypt a Wallet</h1>

      <div className="form-group">
        <label>Password for Keystore</label>
        <input
          type="password"
          className="input"
          placeholder="Enter password for the Key Store"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Keystore File</label>
        <input
          type="file"
          accept=".json"
          className="input"
          onChange={handleFileUpload}
        />
      </div>

      <button className="button" onClick={decryptWallet}>
        Decrypt Wallet
      </button>

      {walletAddress && (
        <div className="wallet-details">
          <div className="detail">
            <label>Wallet Address:</label>
            <textarea
              className="textarea"
              rows="2"
              value={walletAddress}
              readOnly
            />
          </div>

          <div className="detail">
            <label>Private Key:</label>
            <textarea
              className="textarea"
              rows="2"
              value={privateKey}
              readOnly
            />
          </div>

          <div className="detail">
            <label>Keystore File:</label>
            <textarea
              className="textarea"
              rows="5"
              value={keystoreText}
              readOnly
            />
          </div>
        </div>
      )}

      {showModal && (
        <div className="message error">
          <span style={{ float: 'right', cursor: 'pointer' }} onClick={closeModal}>
            &times;
          </span>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default DecryptWallet;
