// SPDX-License-Identifier: NONE
pragma solidity ^0.8.9;

/*
 *
 ******** Contract for AgreedPrice between to parties
 *
 */

contract VulnerableAgreedPrice {
    uint256 public price;

    constructor(uint256 _price) {
        price = _price;
    }

    /*
     * @notice vulnerable function because anyone can change price, which make it useless
     */
    function updatePrice(uint256 _price) external {
        price = _price;
    }
}

contract SecureAgreedPrice {
    uint256 public price;
    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "You're not authorized");
        _;
    }

    constructor(uint256 _price) {
        price = _price;
        owner = msg.sender;
    }

    function changeOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    function updatePrice(uint256 _price) external onlyOwner{
        price = _price;
    }
}
