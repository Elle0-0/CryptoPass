import React, { useState } from 'react';
import { initWeb3, refundTicket, getTicketPrice, getBalance } from './TicketToken';
import '../styles/ReturnTicket.css';

const ReturnTicket = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [keystore, setKeystore] = useState(null);
  const [password, setPassword] = useState('');
  const [ticketAmount, setTicketAmount] = useState('');
  const [ticketBalance, setTicketBalance] = useState(0); // Track user's ticket balance
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const connectWallet = async () => {
    try {
      const { web3 } = await initWeb3();
      const accounts = await web3.eth.requestAccounts();
      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);

        // Fetch the user's ticket balance
        const balance = await getBalance(address);
        setTicketBalance(balance);

        if (balance === 0) {
          setMessage('You do not have any tickets to return.');
        } else {
          setMessage('Wallet connected successfully.');
        }
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
      reader.onload = (e) => {
        setKeystore(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleReturnTicket = async () => {
    if (!walletAddress && (!keystore || !password)) {
      setMessage('Please connect your wallet or upload a keystore file with a password.');
      return;
    }

    if (ticketBalance === 0) {
      setMessage('You do not have any tickets to return.');
      return;
    }

    if (ticketAmount <= 0 || ticketAmount > ticketBalance) {
      setMessage('Invalid ticket amount. Please enter a valid number of tickets to return.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const { web3 } = await initWeb3();
      const priceInEther = await getTicketPrice();
      const priceInWei = web3.utils.toWei(priceInEther, 'ether');
      const totalRefund = web3.utils.toBN(priceInWei).mul(web3.utils.toBN(ticketAmount)).toString();

      if (walletAddress) {
        await refundTicket(ticketAmount, walletAddress);
        setMessage(`Successfully returned ${ticketAmount} ticket(s) for ${web3.utils.fromWei(totalRefund, 'ether')} ETH.`);

        // Update the ticket balance after returning tickets
        const updatedBalance = await getBalance(walletAddress);
        setTicketBalance(updatedBalance);

        if (updatedBalance === 0) {
          setMessage('You have returned all your tickets.');
        }
      } else if (keystore && password) {
        const wallet = web3.eth.accounts.decrypt(keystore, password);
        const tx = {
          to: '0x69775bbd965cb4af12d24ee583122d2ef70dfaf9',
          gas: 2000000,
          data: web3.eth.abi.encodeFunctionCall(
            {
              name: 'refundTicket',
              type: 'function',
              inputs: [{ type: 'uint256', name: 'amount' }],
            },
            [ticketAmount]
          ),
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        setMessage(`Successfully returned ${ticketAmount} ticket(s). Transaction Hash: ${receipt.transactionHash}`);

        // Update the ticket balance after returning tickets
        const updatedBalance = await getBalance(wallet.address);
        setTicketBalance(updatedBalance);

        if (updatedBalance === 0) {
          setMessage('You have returned all your tickets.');
        }
      }
    } catch (error) {
      console.error('Error returning tickets:', error);
      setMessage('Failed to return tickets. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="return-ticket-container">
      <h1 className="title">Return Tickets</h1>

      <div className="input-group">
        <label>Wallet Address (MetaMask):</label>
        <input
          type="text"
          value={walletAddress}
          readOnly
          placeholder="Connect your wallet"
        />
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>

      {walletAddress && (
        <p className="info">You currently have {ticketBalance} ticket(s).</p>
      )}

      <div className="input-group">
        <label>Keystore File:</label>
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </div>

      <div className="input-group">
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your keystore password"
        />
      </div>

      <div className="input-group">
        <label>Ticket Amount:</label>
        <input
          type="number"
          value={ticketAmount}
          onChange={(e) => setTicketAmount(Math.max(0, Math.min(ticketBalance, e.target.value)))} // Restrict input to valid range
          placeholder="Enter ticket amount"
        />
      </div>

      <div className="action-group">
        <button
          onClick={handleReturnTicket}
          className="return-button"
          disabled={loading || ticketBalance === 0}
        >
          {loading ? 'Processing...' : 'Return Tickets'}
        </button>
      </div>

      {message && <p className={`message ${loading ? 'loading' : message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}
    </div>
  );
};

export default ReturnTicket;