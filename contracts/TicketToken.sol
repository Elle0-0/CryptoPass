// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20Interface.sol";

contract TicketToken is ERC20Interface {
    string public name;
    string public symbol;
    uint256 public ticketPrice;
    uint8 public decimals;
    uint256 public totalSupply;
    address public owner;
    address public vendor;

    // uint256 public ticketPrice = 0.02 ether;

    bool private locked;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    mapping(address => bool) public doormen;
    mapping(address => uint256) public vendorBalances;


    event VendorChanged(address oldVendor, address newVendor);
    event TicketPurchased(address buyer, uint256 amount);
    event TicketRefunded(address buyer, uint256 amount);


    // constructor(uint256 initialSupply) {
    //     owner = msg.sender;
    //     vendor = msg.sender;
    //     totalSupply = initialSupply * 10 ** uint256(decimals);
    //     balances[vendor] = totalSupply;
    //     emit Transfer(address(0), vendor, totalSupply);
    // }

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 initialSupply,
        uint256 _ticketPrice,
        address _vendor
    ) {
        require(_vendor != address(0), "Vendor cannot be zero address");

        owner = msg.sender;
        vendor = _vendor;

        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        ticketPrice = _ticketPrice;

        totalSupply = initialSupply * 10 ** uint256(decimals);
        balances[vendor] = totalSupply;

        emit Transfer(address(0), vendor, totalSupply);
    }


    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }


    modifier onlyDoorman() {
        require(doormen[msg.sender], "Not authorized: Not a doorman");
        _;
    }

    modifier onlyVendor() {
        require(msg.sender == vendor, "Not vendor");
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


    // function buyTicket(uint256 amount) external payable {
    //     uint256 cost = ticketPrice * amount;
    //     require(msg.value == cost, "Incorrect ETH amount");
    //     require(balances[vendor] >= amount, "Not enough tickets");
    //     balances[vendor] -= amount;
    //     balances[msg.sender] += amount;
    //     emit Transfer(vendor, msg.sender, amount);
    //     emit TicketPurchased(msg.sender, amount);
    // }

    function buyTicket(uint256 amount) external payable noReentrancy {
        uint256 cost = ticketPrice * amount;

        require(amount > 0, "Amount must be greater than zero");
        require(msg.value == cost, "Incorrect ETH amount");
        require(balances[vendor] >= amount, "Not enough tickets");

        // Ticket transfer
        balances[vendor] -= amount;
        balances[msg.sender] += amount;

        // Log earnings for later withdrawal
        vendorBalances[vendor] += msg.value;

        emit Transfer(vendor, msg.sender, amount);
        emit TicketPurchased(msg.sender, amount);
    }



    // function refundTicket(uint256 amount) external noReentrancy {
    //     uint256 userBalance = balances[msg.sender];
    //     require(userBalance >= amount, "Insufficient ticket balance for refund");

    //     unchecked {
    //         balances[msg.sender] = userBalance - amount;
    //         balances[vendor] += amount;
    //     }

    //     payable(msg.sender).transfer(ticketPrice * amount);

    //     emit Transfer(msg.sender, vendor, amount);
    //     emit TicketRefunded(msg.sender, amount);
    // }

    function refundTicket(uint256 amount) external noReentrancy {
        require(amount > 0, "Must refund at least one ticket");

        uint256 userBalance = balances[msg.sender];
        require(userBalance >= amount, "Insufficient ticket balance for refund");

        uint256 refundAmount = ticketPrice * amount;
        require(vendorBalances[vendor] >= refundAmount, "Vendor has insufficient funds for refund");

        // Update balances BEFORE transferring ETH
        balances[msg.sender] = userBalance - amount;
        balances[vendor] += amount;

        vendorBalances[vendor] -= refundAmount;

        // Transfer ETH refund
        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund failed");

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

    function setDoorman(address user, bool status) external onlyOwner {
        require(user != address(0), "Invalid address");
        doormen[user] = status;
    }

    function burn(address from, uint256 amount) external onlyDoorman {
        require(from != address(0), "Cannot burn from zero address");
        uint256 fromBalance = balances[from];
        require(fromBalance >= amount, "Insufficient balance to burn");

        unchecked {
            balances[from] = fromBalance - amount;
            totalSupply -= amount;
        }

        emit Transfer(from, address(0), amount);
    }


    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function withdrawEarnings() external onlyVendor noReentrancy {
        uint256 amount = vendorBalances[msg.sender];
        require(amount > 0, "No funds to withdraw");

        vendorBalances[msg.sender] = 0; // Avoid reentrancy
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdrawal failed");
    }


    function mint(address to, uint256 amount) public {
    require(msg.sender == vendor, "Only vendor can mint");
    balances[to] += amount;
    }


    receive() external payable {}
}
