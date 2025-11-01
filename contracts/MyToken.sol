// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ManagedAccess.sol";

contract MyToken is ManagedAccess {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed spender, uint256 amount);

    string public name;
    string public symbol;
    uint8 public decimals;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _amount) ManagedAccess(msg.sender, msg.sender) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _mint(_amount*10**uint256(decimals), msg.sender);
    }

    function approve(address _spender, uint256 _amount) external {
        allowance[msg.sender][_spender] = _amount;
        
        emit Approval(_spender, _amount);
    }

    function transferFrom(address _from, address _to, uint256 _amount) external {
        address spender = msg.sender;
        // require(balanceOf[_from] >= _amount, "insufficient balance");
        require(allowance[_from][spender] >= _amount, "insufficient allowance");
        allowance[_from][spender] -= _amount;
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;

        emit Transfer(_from, _to, _amount);
    }

    function mint(uint256 _amount, address _to) external onlyManager {
        _mint(_amount, _to);
    }

    function setManager(address _manager) external onlyOwner {
        manager = _manager;
    }

    function _mint(uint256 _amount, address _to) internal { 
        totalSupply += _amount;
        balanceOf[_to] += _amount;

        emit Transfer(address(0), _to, _amount);
    }

    function transfer(uint256 _amount, address _to) external {
        require(balanceOf[msg.sender] >= _amount, "insufficient balance");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;

        emit Transfer(msg.sender, _to, _amount);
    } 
}