// SPDX-License-Identifier: NONE
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

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

contract SecureAgreedPrice is Ownable {
    uint256 public price;

    constructor(uint256 _price) {
        price = _price;
    }

    function updatePrice(uint256 _price) external onlyOwner {
        price = _price;
    }
}
