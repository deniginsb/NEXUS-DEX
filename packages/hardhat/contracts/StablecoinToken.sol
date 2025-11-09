// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StablecoinToken is ERC20, Ownable {
    uint256 public priceInNEX; // Price in NEX (with 18 decimals), e.g., 150e18 means 150 NEX per token
    address public swapContract; // Contract that can mint/burn
    
    event Minted(address indexed to, uint256 amount, uint256 nexPaid);
    event Burned(address indexed from, uint256 amount, uint256 nexReceived);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _priceInNEX,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        priceInNEX = _priceInNEX;
        swapContract = address(0);
    }
    
    function setSwapContract(address _swapContract) external onlyOwner {
        swapContract = _swapContract;
    }
    
    function setPrice(uint256 _priceInNEX) external onlyOwner {
        priceInNEX = _priceInNEX;
    }
    
    // Mint tokens by paying NEX (only swap contract can call)
    function mintWithNEX(address to, uint256 nexAmount) external returns (uint256) {
        require(msg.sender == swapContract, "Only swap contract");
        require(nexAmount > 0, "Amount must be > 0");
        
        // Calculate tokens to mint: nexAmount / priceInNEX
        uint256 tokensToMint = (nexAmount * 1e18) / priceInNEX;
        _mint(to, tokensToMint);
        
        emit Minted(to, tokensToMint, nexAmount);
        return tokensToMint;
    }
    
    // Burn tokens to get NEX back (only swap contract can call)
    function burnForNEX(address from, uint256 tokenAmount) external returns (uint256) {
        require(msg.sender == swapContract, "Only swap contract");
        require(tokenAmount > 0, "Amount must be > 0");
        require(balanceOf(from) >= tokenAmount, "Insufficient balance");
        
        // Calculate NEX to return: tokenAmount * priceInNEX / 1e18
        uint256 nexToReturn = (tokenAmount * priceInNEX) / 1e18;
        _burn(from, tokenAmount);
        
        emit Burned(from, tokenAmount, nexToReturn);
        return nexToReturn;
    }
}
