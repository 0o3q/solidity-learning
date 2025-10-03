// SPDX-License-Identifer: MIT
pragma solidity ^0.8.28;

contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _mint(1*10**uint256(decimals), msg.sender);
    }

    function _mint(uint256 _amount, address _owner) internal {
        totalSupply += _amount;
        balanceOf[_owner] += _amount;
    }
}