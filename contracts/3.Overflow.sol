// SPDX-License-Identifier: None

// We can make use 0.8 version of solidity, which checks overflow by default
pragma solidity ^0.6.0;



contract VulnerableToken {
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;
    address public owner;
    constructor(uint256 _initialSupply) public {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        owner = msg.sender;
    }



    function transfer(address _to, uint256 _amount) public {
        require(balanceOf[msg.sender] - _amount >= 0, "Not enough tokens");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
    }

    function mint(uint256 _amount) external {
        totalSupply += _amount;
        balanceOf[owner] += _amount;
    }
}

/* 
    We can use SafeMath library from openzeppelin to avoid overflows
 */
contract SecureToken {
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;
    address public owner;
    constructor(uint256 _initialSupply) public {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        owner = msg.sender;
    }



    function transfer(address _to, uint256 _amount) public {
        /* 
            To avoid overflow, we can check if balance is greater than amount. This way
            we don't have to substract amount, avoiding overflow.
         */
        require(balanceOf[msg.sender] >= _amount, "Not enough tokens");
        balanceOf[msg.sender] -= _amount;  // Use sub method of SafeMath, while using SafeMath library 
        balanceOf[_to] += _amount; // Use add method of SafeMath, while using SafeMath library
    }

    function mint(uint256 _amount) external {
        totalSupply += _amount; // Use add method of SafeMath, while using SafeMath library
        balanceOf[owner] += _amount; // Use add method of SafeMath, while using SafeMath library
    }
}
