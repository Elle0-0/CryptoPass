import React, { useState } from 'react';

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

  const decryptWallet = () => {
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
      const web3 = new window.Web3();
      var wallet = web3.eth.accounts.decrypt(keystore, password);
  
      console.log("Keystore string:", keystore);
      console.log("Wallet address:", wallet.address);
  
      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);
      setKeystoreText(keystore);
    } catch (err) {
      console.error("Decryption failed:", err);
      setError('Decryption failed: ' + err.message);
      setShowModal(true);
    }
  };
  

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="DecryptWallet">
      <h1>Decrypt a Wallet</h1>

      <button onClick={decryptWallet}>Decrypt Wallet</button>

      <br /><br />

      <input 
        type="password" 
        placeholder="Enter a password for the Key Store"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <input 
        type="file" 
        accept=".json" 
        onChange={handleFileUpload}
      />
      <br /><br />

      <label>Wallet Address:</label><br />
      <textarea rows="5" cols="50" value={walletAddress} readOnly />
      <br />
      <label>Private Key:</label><br />
      <textarea rows="5" cols="50" value={privateKey} readOnly />
      <br />
      <label>Keystore File:</label><br />
      <textarea rows="5" cols="50" value={keystoreText} readOnly />

      {/* Error Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DecryptWallet;
