import React, { useState, useEffect } from 'react';
import {
  initWeb3,
  getBalance,
  getTicketPrice,
  getVendor,
  getTotalSupply,
  transferFrom,
  setDoorman,
} from '../components/TicketToken';
import Web3 from 'web3';

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

  // Initialize the doorman when the app starts
  useEffect(() => {
    const initializeDoorman = async () => {
      try {
        const { web3 } = await initWeb3();
        const accounts = await web3.eth.getAccounts();
        const ownerAddress = accounts[0];
        const doormanAddress = process.env.REACT_APP_DOORMAN_ADDRESS;

        if (!doormanAddress) {
          console.error('Doorman address is not defined in the environment variables.');
          return;
        }

        await setDoorman(doormanAddress, true, ownerAddress);
        console.log(`Doorman ${doormanAddress} has been successfully set.`);
      } catch (error) {
        console.error('Error initializing doorman:', error);
      }
    };

    initializeDoorman();
  }, []);

  // Connect MetaMask Wallet
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

  // Handle Keystore File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setKeystore(event.target.result);
      reader.readAsText(file);
    }
  };

  // Check Balances
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

  // Fetch Ticket Details
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

  // Burn Tickets
  const handleBurnTicket = async () => {
    try {
      const { web3 } = await initWeb3();
      const accounts = await web3.eth.getAccounts();
      const doorman = accounts[0];
      const doormanAddress = process.env.REACT_APP_DOORMAN_ADDRESS;
  
      // Validate inputs
      if (!burnTarget || !web3.utils.isAddress(burnTarget)) {
        setMessage('Invalid target wallet address.');
        return;
      }
      if (!burnAmount || isNaN(burnAmount) || burnAmount <= 0) {
        setMessage('Invalid ticket amount to burn.');
        return;
      }
  
      await transferFrom(burnTarget, doormanAddress, burnAmount, doorman);
      setMessage(`Successfully burned ${burnAmount} ticket(s) from ${burnTarget}.`);
    } catch (error) {
      console.error('Error burning ticket:', error);
      setMessage('Failed to burn ticket.');
    }
  };

  // Render Tabs
  const renderTabs = () => (
    <div style={{ marginBottom: '20px' }}>
      {['user', 'doorman', 'vendor'].map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          style={{
            marginRight: '10px',
            padding: '10px',
            backgroundColor: tab === t ? '#ccc' : '#f5f5f5',
            cursor: 'pointer',
          }}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Ticket Token Dashboard</h1>
      {renderTabs()}

      {tab === 'user' && (
        <>
          <div>
            <label>
              Wallet Address (MetaMask):
              <input
                type="text"
                value={walletAddress}
                readOnly
                style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
              />
            </label>
            <button onClick={connectWallet} style={{ marginLeft: '10px' }}>Connect Wallet</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label>
              Keystore File:
              <input type="file" accept=".json" onChange={handleFileUpload} style={{ marginLeft: '10px' }} />
            </label>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your keystore password"
                style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
              />
            </label>
          </div>

          <button onClick={handleCheckBalance} style={{ marginTop: '20px' }}>Check Balances</button>

          <div style={{ marginTop: '20px' }}>
            <h3>Balances</h3>
            <p>Crypto Balance: {cryptoBalance} ETH</p>
            <p>Ticket Token Balance: {ticketBalance}</p>
          </div>
        </>
      )}

      {tab === 'doorman' && (
        <div>
          <h3>Burn Ticket</h3>
          <label>
            Target Wallet:
            <input
              type="text"
              value={burnTarget}
              onChange={(e) => setBurnTarget(e.target.value)}
              placeholder="Wallet address to burn from"
              style={{ marginLeft: '10px', width: '400px' }}
            />
          </label>
          <br /><br />
          <label>
            Amount to Burn:
            <input
              type="number"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              min="1"
              style={{ marginLeft: '10px' }}
            />
          </label>
          <br /><br />
          <button onClick={handleBurnTicket}>Confirm & Burn Ticket</button>
        </div>
      )}

      {tab === 'vendor' && (
        <div>
          <h3>Vendor Dashboard</h3>
          <button onClick={handleFetchDetails}>Fetch Ticket Details</button>
          <p>Ticket Price: {ticketPrice} ETH</p>
          <p>Total Tickets Minted: {totalTickets}</p>
          <p>Vendor Address: {vendorAddress}</p>
        </div>
      )}

      {message && <p style={{ marginTop: '20px', color: 'blue' }}>{message}</p>}
    </div>
  );
};

export default BalanceChecker;

