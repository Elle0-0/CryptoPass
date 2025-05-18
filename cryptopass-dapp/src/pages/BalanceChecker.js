import React, { useState } from 'react';
import {
  initWeb3, getBalance, getTicketPrice, getVendor, getTotalSupply } from '../components/TicketToken';
import Web3 from 'web3';
import '../styles/BalanceChecker.css'; 

const BalanceChecker = () => {
  const [tab, setTab] = useState('user');
  const [walletAddress, setWalletAddress] = useState('');
  const [keystore, setKeystore] = useState(null);
  const [password, setPassword] = useState('');
  const [cryptoBalance, setCryptoBalance] = useState('');
  const [ticketBalance, setTicketBalance] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [burnTarget, setBurnTarget] = useState('');
  const [burnAmount, setBurnAmount] = useState('1');
  const [message, setMessage] = useState('');

  const connectWallet = async () => {
    try {
      const { web3 } = await initWeb3();
      const accounts = await web3.eth.requestAccounts();
      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        const balance = await web3.eth.getBalance(address);
        setCryptoBalance(Web3.utils.fromWei(balance, 'ether'));
        setMessage('Wallet connected successfully.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setMessage('Failed to connect wallet.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setKeystore(event.target.result);
      reader.readAsText(file);
    }
  };

  const handleCheckBalance = async () => {
    try {
      const { web3 } = await initWeb3();
      let address = walletAddress;

      if (keystore && password) {
        const wallet = web3.eth.accounts.decrypt(keystore, password);
        address = wallet.address;
        setWalletAddress(address);
      }

      const balance = await web3.eth.getBalance(address);
      const ticketTokenBalance = await getBalance(address);
      setCryptoBalance(Web3.utils.fromWei(balance, 'ether'));
      setTicketBalance(ticketTokenBalance);
      setMessage('Balances fetched successfully.');
    } catch (error) {
      console.error('Error checking balance:', error);
      setMessage('Failed to fetch balances.');
    }
  };

  const handleFetchDetails = async () => {
    try {
      const price = await getTicketPrice();
      const vendor = await getVendor();
      const total = await getTotalSupply();
      setTicketPrice(price);
      setVendorAddress(vendor);
      setTotalTickets(total);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const handleBurnTicket = async () => {
    try {
      const { web3, contract } = await initWeb3();
      const accounts = await web3.eth.getAccounts();
      const doorman = accounts[0];

      if (!burnTarget || !web3.utils.isAddress(burnTarget)) {
        setMessage('Invalid target wallet address.');
        return;
      }
      if (!burnAmount || isNaN(burnAmount) || burnAmount <= 0) {
        setMessage('Invalid ticket amount to burn.');
        return;
      }

      await contract.methods.burn(burnTarget, burnAmount).send({ from: doorman });
      setMessage(`Successfully burned ${burnAmount} ticket(s) from ${burnTarget}.`);
    } catch (error) {
      console.error('Error burning ticket:', error);
      setMessage('Failed to burn ticket.');
    }
  };

  const renderTabs = () => (
    <div className="tab-buttons">
      {['user', 'doorman', 'vendor'].map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`tab-button ${tab === t ? 'active' : ''}`}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="create-wallet-container balance-checker-container">
      <h1 className="title">Ticket Token Dashboard</h1>
      {renderTabs()}

      {tab === 'user' && (
        <>
          <div className="form-group">
            <label>Wallet Address (MetaMask):</label>
            <input
              type="text"
              value={walletAddress}
              readOnly
              className="input"
              placeholder="Connect your wallet"
            />
            <button className="button" onClick={connectWallet}>Connect Wallet</button>
          </div>

          <div className="form-group">
            <label>Keystore File:</label>
            <input type="file" accept=".json" onChange={handleFileUpload} className="input-file" />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your keystore password"
              className="input"
            />
          </div>

          <button className="button" onClick={handleCheckBalance}>Check Balances</button>

          <div className="wallet-details">
            <h3>Balances</h3>
            <p>Crypto Balance: {cryptoBalance || '-' } ETH</p>
            <p>Ticket Token Balance: {ticketBalance || '-'}</p>
          </div>
        </>
      )}

      {tab === 'doorman' && (
        <>
          <h3>Burn Ticket</h3>
          <div className="form-group">
            <label>Target Wallet:</label>
            <input
              type="text"
              value={burnTarget}
              onChange={(e) => setBurnTarget(e.target.value)}
              placeholder="Wallet address to burn from"
              className="input"
            />
          </div>

          <div className="form-group">
            <label>Amount to Burn:</label>
            <input
              type="number"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              min="1"
              className="input"
            />
          </div>

          <button className="button" onClick={handleBurnTicket}>Confirm & Burn Ticket</button>
        </>
      )}

      {tab === 'vendor' && (
        <>
          <h3>Vendor Dashboard</h3>
          <button className="button" onClick={handleFetchDetails}>Fetch Ticket Details</button>
          <p>Ticket Price: {ticketPrice || '-' } ETH</p>
          <p>Total Tickets Minted: {totalTickets || '-'}</p>
          <p>Vendor Address: {vendorAddress || '-'}</p>
        </>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default BalanceChecker;
