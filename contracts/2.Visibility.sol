// SPDX-License-Identifier: NONE
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Vault is Ownable {

    /* 
        This is not actually private. We should not store sensitive data 
        like passwords, on blockchain 
     */
    bytes32 private password;

    constructor(bytes32 _password) {
        password = _password;
    }

    modifier checkPassword(bytes32 _password) {
        require(password == _password, "Wrong password.");
        _;
    }

    // Just deposit some ETH into contract. No calculation required
    function deposit() external payable onlyOwner {}

    // Vulnerable functionality. Anyone can read password and withdraw balance
    function withdraw(bytes32 _password) external checkPassword(_password) {
        payable(msg.sender).transfer(address(this).balance);
    }
}
