// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMyToken {
    function transfer(uint256 _amount, address _to) external;
    function transferFrom(address _from, address _to, uint256 _amount) external;
    function mint(uint256 _amount, address _owner) external;
}

contract TinyBank {
    event Staked(address from, uint256 amount);
    event Withdraw(uint256 amount, address to);

    IMyToken public stakingToken;

    mapping(address => uint256) public lastClaimedBlock;
    uint256 rewardPerBlock = 1 * 10 ** 10;

    mapping(address => uint256) public staked;
    uint256 public totalStaked;

    constructor(IMyToken _stakingToken) {
        stakingToken = _stakingToken;
    }

    function distributeReward(address _to) internal {
        uint256 blocks = block.number - lastClaimedBlock[_to];
        uint256 reward = (blocks * rewardPerBlock * staked[_to]) / totalStaked;
        stakingToken.mint(reward, _to);
        lastClaimedBlock[_to] = block.number;
    }

    function stake(uint256 _amount) external {
        require(_amount >= 0, "cannot stake 0 amount");
        distributeReward(msg.sender);
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        staked[msg.sender] += _amount;
        totalStaked += _amount;

        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        require(staked[msg.sender] >= _amount, "insufficient staked token");
        distributeReward(msg.sender);
        stakingToken.transfer(_amount, msg.sender);
        staked[msg.sender] -= _amount;
        totalStaked -= _amount;

        emit Withdraw(_amount, msg.sender);
    }
}