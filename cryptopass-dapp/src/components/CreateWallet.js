import React, { useState } from 'react';

function CreateWallet() {
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [keystore, setKeystore] = useState('');

  const createWallet = () => {
    if (password === '') {
      alert('Please enter a password for the Key Store');
      return;
    }

    const web3 = new window.Web3();
    const wallet = web3.eth.accounts.create();
    setWalletAddress(wallet.address);
    setPrivateKey(wallet.privateKey);

    const encryptedKeystore = web3.eth.accounts.encrypt(wallet.privateKey, password);
    setKeystore(JSON.stringify(encryptedKeystore));
  };

  const downloadKeystore = () => {
    if (keystore === '') {
      alert('Please create a wallet first');
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
    <div className="CreateWalletPage">
      <h1>Create a Wallet</h1>

      <button onClick={createWallet}>Create Wallet</button>

      <br/><br/>
      
      <input 
        type="password" 
        placeholder="Enter a password for the Key Store" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br/><br/>

      <label>Wallet Address:</label><br/>
      <textarea rows="5" cols="50" value={walletAddress} readOnly />

      <br/>
      <label>Private Key:</label><br/>
      <textarea rows="5" cols="50" value={privateKey} readOnly />

      <br/>
      <label>Keystore File:</label><br/>
      <textarea rows="5" cols="50" value={keystore} readOnly />

      <br/><br/>

      <button onClick={downloadKeystore}>Download Keystore</button>
    </div>
  );
}

export default CreateWallet;
