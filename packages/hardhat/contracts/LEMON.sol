// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LEMON Token
 * @notice Simple ERC20 token with minting capability
 */
contract LEMON is ERC20, Ownable {
    uint8 private constant _decimals = 18;

    constructor(address initialOwner) ERC20("Lemon Token", "LEMON") Ownable(initialOwner) {
        // Mint initial supply to owner (optional)
        _mint(initialOwner, 1000000 * 10 ** _decimals); // 1M LEMON
    }

    /**
     * @notice Mint new tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
}
