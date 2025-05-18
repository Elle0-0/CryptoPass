import React, { useState } from 'react';
import { initWeb3, refundTicket, getTicketPrice } from './TicketToken';

const ReturnTicket = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [keystore, setKeystore] = useState(null);
  const [password, setPassword] = useState('');
  const [ticketAmount, setTicketAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Option 1: Connect MetaMask Wallet
  const connectWallet = async () => {
    try {
      const { web3 } = await initWeb3();
      const accounts = await web3.eth.requestAccounts(); // Prompt MetaMask to select an account
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]); // Set the selected wallet address
        setMessage('Wallet connected successfully.');
      } else {
        setMessage('No wallet connected. Please connect your wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setMessage('Failed to connect wallet. Please try again.');
    }
  };

  // Option 2: Handle Keystore File Upload
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

  // Return Ticket Logic (Handles Both Options)
  const handleReturnTicket = async () => {
    if (!walletAddress && (!keystore || !password)) {
      setMessage('Please connect your wallet or upload a keystore file with a password.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const { web3 } = await initWeb3();
      const priceInEther = await getTicketPrice();
      const priceInWei = web3.utils.toWei(priceInEther, 'ether'); // Convert price to Wei
      const totalRefund = web3.utils.toBN(priceInWei).mul(web3.utils.toBN(ticketAmount)).toString();

      if (walletAddress) {
        // Option 1: Use MetaMask Wallet
        await refundTicket(ticketAmount, walletAddress);
        setMessage(`Successfully returned ${ticketAmount} ticket(s) for ${web3.utils.fromWei(totalRefund, 'ether')} ETH.`);
      } else if (keystore && password) {
        // Option 2: Use Keystore File
        const wallet = web3.eth.accounts.decrypt(keystore, password);

        // Create the transaction
        const tx = {
          to: '0x69775bbd965cb4af12d24ee583122d2ef70dfaf9', // Contract address
          gas: 2000000,
          data: web3.eth.abi.encodeFunctionCall(
            {
              name: 'refundTicket',
              type: 'function',
              inputs: [
                {
                  type: 'uint256',
                  name: 'amount',
                },
              ],
            },
            [ticketAmount]
          ),
        };

        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, wallet.privateKey);

        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        setMessage(`Successfully returned ${ticketAmount} ticket(s). Transaction Hash: ${receipt.transactionHash}`);
      }
    } catch (error) {
      console.error('Error returning tickets:', error);
      setMessage('Failed to return tickets. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Return Tickets</h1>

      {/* Option 1: MetaMask Wallet */}
      <div>
        <label>
          Wallet Address (MetaMask):
          <input
            type="text"
            value={walletAddress}
            readOnly
            placeholder="Connect your wallet"
            style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
          />
        </label>
        <button onClick={connectWallet} style={{ marginLeft: '10px', padding: '5px 10px' }}>
          Connect Wallet
        </button>
      </div>

      {/* Option 2: Keystore File */}
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

      {/* Ticket Amount */}
      <div style={{ marginTop: '20px' }}>
        <label>
          Ticket Amount:
          <input
            type="number"
            value={ticketAmount}
            onChange={(e) => setTicketAmount(e.target.value)}
            placeholder="Enter ticket amount"
            style={{ marginLeft: '10px', padding: '5px', width: '100px' }}
          />
        </label>
      </div>

      {/* Return Tickets */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleReturnTicket}
          style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Return Tickets'}
        </button>
      </div>

      {/* Message */}
      {message && <p style={{ marginTop: '20px', color: loading ? 'blue' : 'red' }}>{message}</p>}
    </div>
  );
};

export default ReturnTicket;