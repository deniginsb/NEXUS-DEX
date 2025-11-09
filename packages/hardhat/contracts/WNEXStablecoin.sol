// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WNEXStablecoin
 * @dev Wrapped NEX as a mintable/burnable stablecoin
 * Supply is dynamic - minted when NEX is deposited, burned when withdrawn
 * 1 NEX = 1 WNEX (1:1 peg)
 */
contract WNEXStablecoin is ERC20, Ownable {
    // Authorized minters (e.g., NativeNEXSwap contract)
    mapping(address => bool) public isMinter;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    constructor(address initialOwner) ERC20("Wrapped NEX Stablecoin", "WNEX") Ownable(initialOwner) {
        // No initial supply - supply is dynamic based on NEX deposits
    }

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    /**
     * @dev Add authorized minter (e.g., swap contract)
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        isMinter[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove authorized minter
     */
    function removeMinter(address minter) external onlyOwner {
        isMinter[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint WNEX tokens (called by authorized minters)
     */
    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /**
     * @dev Burn WNEX tokens (can be called by anyone to burn their own tokens)
     */
    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    }

    /**
     * @dev Burn WNEX tokens from a specific address (called by authorized minters)
     */
    function burnFrom(address from, uint256 amount) external onlyMinter {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        _burn(from, amount);
        emit Burned(from, amount);
    }
}
