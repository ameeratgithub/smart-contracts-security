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

    constructor(uint256 _price) {
        price = _price;
        owner = msg.sender;
    }

    /*
     * @notice vulnerable function because anyone can change price, which make it useless
     */
    function updatePrice(uint256 _price) external {
        require(owner==msg.sender,"You're not authorized");
        price = _price;
    }
}
