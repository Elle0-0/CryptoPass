// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20Interface.sol";

contract TicketToken is ERC20Interface {
    string public name = "CryptoPass";
    string public symbol = "CYP";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;
    address public vendor;

    uint256 public ticketPrice = 0.05 ether;

    bool private locked;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    event VendorChanged(address oldVendor, address newVendor);
    event TicketPurchased(address buyer, uint256 amount);
    event TicketRefunded(address buyer, uint256 amount);


    constructor(uint256 initialSupply) {
        owner = msg.sender;
        vendor = msg.sender;
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balances[vendor] = totalSupply;
        emit Transfer(address(0), vendor, totalSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier noReentrancy() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return balances[account];
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        uint256 senderBalance = balances[msg.sender];
        require(senderBalance >= amount, "Not enough balance");

        unchecked {
            balances[msg.sender] = senderBalance - amount;
            balances[to] += amount;
        }

        emit Transfer(msg.sender, to, amount);
        return true;
    }


    function allowance(address _owner, address spender) public view override returns (uint256) {
        return allowances[_owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        uint256 fromBalance = balances[from];
        uint256 currentAllowance = allowances[from][msg.sender];

        require(fromBalance >= amount, "Not enough balance");
        require(currentAllowance >= amount, "Not approved");

        unchecked {
            balances[from] = fromBalance - amount;
            balances[to] += amount;
            allowances[from][msg.sender] = currentAllowance - amount;
        }

        emit Transfer(from, to, amount);
        return true;
    }


    function buyTicket(uint256 amount) external payable {
        uint256 cost = ticketPrice * amount;
        require(msg.value == cost, "Incorrect ETH amount");
        require(balances[vendor] >= amount, "Not enough tickets");
        balances[vendor] -= amount;
        balances[msg.sender] += amount;
        emit Transfer(vendor, msg.sender, amount);
        emit TicketPurchased(msg.sender, amount);
    }

    function refundTicket(uint256 amount) external noReentrancy {
        uint256 userBalance = balances[msg.sender];
        require(userBalance >= amount, "Insufficient ticket balance for refund");

        unchecked {
            balances[msg.sender] = userBalance - amount;
            balances[vendor] += amount;
        }

        payable(msg.sender).transfer(ticketPrice * amount);

        emit Transfer(msg.sender, vendor, amount);
        emit TicketRefunded(msg.sender, amount);
    }


    function setTicketPrice(uint256 newPrice) external onlyOwner {
        ticketPrice = newPrice;
    }

    function setVendor(address newVendor) external onlyOwner {
        require(newVendor != address(0), "Vendor cannot be zero address");
        address oldVendor = vendor;
        vendor = newVendor;
        emit VendorChanged(oldVendor, newVendor);
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function mint(address to, uint256 amount) public {
    require(msg.sender == vendor, "Only vendor can mint");
    balances[to] += amount;
}


    receive() external payable {}
}
