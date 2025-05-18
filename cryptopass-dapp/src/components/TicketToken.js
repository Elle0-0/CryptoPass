import TicketTokenArtifact from '../abi/TicketToken.json';
const TicketTokenABI = TicketTokenArtifact.abi;   

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

let web3;
let contract;


export const initWeb3 = async () => {
    if (window.ethereum) {
      web3 = new window.Web3(window.ethereum); 
      await window.ethereum.request({ method: 'eth_requestAccounts' }); 
  
      contract = new web3.eth.Contract(TicketTokenABI, CONTRACT_ADDRESS);
      return { web3, contract };
    } else {
      throw new Error('MetaMask not found. Please install MetaMask.');
    }
  };


export const getTicketPrice = async () => {
  if (!contract || !web3) {
    await initWeb3();
  }
  const price = await contract.methods.ticketPrice().call();
  return web3.utils.fromWei(price, 'ether');
};


export const getBalance = async (address) => {
  const balance = await contract.methods.balanceOf(address).call();
  return balance;
};

export const getAllowance = async (owner, spender) => {
  const allowance = await contract.methods.allowance(owner, spender).call();
  return allowance;
};

export const getTotalSupply = async () => {
  const totalSupply = await contract.methods.totalSupply().call();
  return totalSupply;
};

export const getDecimals = async () => {
  const decimals = await contract.methods.decimals().call();
  return decimals;
};

export const getName = async () => {
  const name = await contract.methods.name().call();
  return name;
};

export const getSymbol = async () => {
  const symbol = await contract.methods.symbol().call();
  return symbol;
};

export const getOwner = async () => {
  const owner = await contract.methods.owner().call();
  return owner;
};

export const getVendor = async () => {
  const vendor = await contract.methods.vendor().call();
  return vendor;
};

// Transactional Functions
export const buyTicket = async (amount, fromAddress) => {
  const price = await contract.methods.ticketPrice().call();
  const total = web3.utils.toBN(price).mul(web3.utils.toBN(amount));

  return contract.methods.buyTicket(amount).send({
    from: fromAddress,
    value: total.toString(),
  });
};

export const refundTicket = async (amount, fromAddress) => {
  return contract.methods.refundTicket(amount).send({ from: fromAddress });
};

export const mintTokens = async (to, amount, fromAddress) => {
  return contract.methods.mint(to, amount).send({ from: fromAddress });
};

export const transferTokens = async (to, amount, fromAddress) => {
  return contract.methods.transfer(to, amount).send({ from: fromAddress });
};

export const transferFrom = async (from, to, amount, senderAddress) => {
  return contract.methods.transferFrom(from, to, amount).send({ from: senderAddress });
};

export const approveSpender = async (spender, amount, fromAddress) => {
  return contract.methods.approve(spender, amount).send({ from: fromAddress });
};

export const setTicketPrice = async (newPrice, fromAddress) => {
  return contract.methods.setTicketPrice(newPrice).send({ from: fromAddress });
};

export const setVendor = async (newVendor, fromAddress) => {
  return contract.methods.setVendor(newVendor).send({ from: fromAddress });
};

export const withdrawFunds = async (fromAddress) => {
  return contract.methods.withdraw().send({ from: fromAddress });
};

export const burnTicket = async (fromAddress, amount) => {
  if (!contract || !web3) {
    await initWeb3();
  }
  return contract.methods.burn(fromAddress, amount).send({ from: fromAddress });
};

export const setDoorman = async (doormanAddress, status, fromAddress) => {
  if (!contract || !web3) {
    await initWeb3();
  }
  return contract.methods.setDoorman(doormanAddress, status).send({ from: fromAddress });
};

// Withdraw Vendor Earnings
export const withdrawVendorEarnings = async (fromAddress) => {
  if (!contract || !web3) {
    await initWeb3();
  }
  return contract.methods.withdrawEarnings().send({ from: fromAddress });
};


