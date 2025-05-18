// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "remix_tests.sol"; // Auto-included in Remix IDE
import "contracts/TicketToken.sol";

contract TicketTokenTest {
    TicketToken token;
    address owner;
    address user = address(0x123);
    uint256 initialSupply = 1000;
    uint256 ticketPrice;


    // Helper to fund a contract
    receive() external payable {}

    function beforeEach() public {
        token = new TicketToken(initialSupply);
        owner = address(this);
        ticketPrice = token.ticketPrice();
    }

    function testInitialSupply() public {
        uint256 expected = initialSupply * (10 ** 18);
        Assert.equal(token.totalSupply(), expected, "Total supply mismatch");
        Assert.equal(token.balanceOf(token.vendor()), expected, "Vendor balance mismatch");
    }

    function testTransferSuccess() public {
        uint256 transferAmount = 100 * (10 ** 18);
        token.transfer(user, transferAmount);
        Assert.equal(token.balanceOf(user), transferAmount, "User should receive tokens");
    }

    function testTransferFail_NotEnoughBalance() public {
        uint256 transferAmount = 9999999999999999 * (10 ** 18);

        // Try to transfer and catch the revert
        try token.transfer(user, transferAmount) {
            // If it succeeds, the test should fail
            Assert.ok(false, "Transfer should fail for insufficient tokens");
        } catch {
            // If revert happens as expected, the test passes
            Assert.ok(true, "Caught expected revert due to insufficient balance");
        }
    }



    function testApproveAndAllowance() public {
        uint256 amount = 50 * (10 ** 18);
        Assert.equal(token.approve(user, amount), true, "Approve failed");
        Assert.equal(token.allowance(address(this), user), amount, "Allowance mismatch");
    }


    function testTransferFromSuccess() public {
        uint256 amount = 10 * (10 ** 18);

        token.approve(address(this), amount);

        uint256 allowanceBefore = token.allowance(address(this), address(this));
        Assert.equal(allowanceBefore, amount, "Allowance mismatch");

        uint256 balanceBefore = token.balanceOf(address(this));
        Assert.equal(balanceBefore, initialSupply * (10 ** 18), "Contract balance mismatch");

        bool success = token.transferFrom(address(this), user, amount);
        Assert.ok(success, "transferFrom failed");

        Assert.equal(token.balanceOf(user), amount, "User balance did not increase as expected");
    }


    function testTransferFromFailsWithoutApproval() public {
        uint256 amount = 10 * (10 ** 18);
        (bool success, ) = address(token).call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", address(this), user, amount)
        );
        Assert.ok(!success, "transferFrom should fail without approval");
    }


    function testBuyTicketFailsWrongEth() public {
        (bool success, ) = address(token).call{value: ticketPrice / 2}(
            abi.encodeWithSignature("buyTicket(uint256)", 1)
        );
        Assert.ok(!success, "Should fail due to incorrect ETH");
    }


    function testRefundTicketFails_NotEnoughBalance() public {
        (bool success, ) = address(token).call(
            abi.encodeWithSignature("refundTicket(uint256)", 100)
        );
        Assert.ok(!success, "Refund should fail");
    }

    function testSetTicketPriceOnlyOwner() public {
        uint256 newPrice = 0.02 ether;
        token.setTicketPrice(newPrice);
        Assert.equal(token.ticketPrice(), newPrice, "Ticket price should be updated");
    }

    function testSetVendorSuccess() public {
        address newVendor = address(0x999);
        token.setVendor(newVendor);
        Assert.equal(token.vendor(), newVendor, "Vendor should be updated");
    }

    function testSetVendorFailsZeroAddress() public {
        (bool success, ) = address(token).call(
            abi.encodeWithSignature("setVendor(address)", address(0))
        );
        Assert.ok(!success, "setVendor should fail for zero address");
    }

    function testWithdrawFails_NotEnoughBalance() public {
        (bool success, ) = address(token).call{value: ticketPrice}(
            abi.encodeWithSignature("withdraw()")
        );
        Assert.ok(!success, "Should fail due to insufficient balance");
    }
}
