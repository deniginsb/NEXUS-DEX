// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title USDT Token (Testnet)
 * @notice Stablecoin untuk price reference (1 USDT = $1 USD)
 */
contract USDT is ERC20, Ownable {
    uint8 private constant _decimals = 6; // USDT uses 6 decimals

    constructor(address initialOwner) ERC20("Tether USD", "USDT") Ownable(initialOwner) {
        // Mint initial supply (testnet only!)
        _mint(initialOwner, 10_000_000 * 10 ** _decimals); // 10M USDT
    }

    /**
     * @notice Mint new tokens (only owner - testnet only!)
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
