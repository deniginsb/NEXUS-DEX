// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StablecoinToken.sol";

/**
 * @title StablecoinSwap
 * @dev Handles swapping between NEX and any StablecoinToken
 */
contract StablecoinSwap {
    address public owner;
    
    event Swapped(address indexed user, address indexed token, uint256 nexAmount, uint256 tokenAmount, bool isNEXToToken);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    /**
     * @dev Swap NEX for Stablecoin Token
     * User sends NEX, receives tokens based on token's priceInNEX
     */
    function swapNEXForToken(address tokenAddress) external payable {
        require(msg.value > 0, "Must send NEX");
        
        StablecoinToken token = StablecoinToken(tokenAddress);
        
        // Calculate how many tokens user gets
        // tokenAmount = nexAmount / priceInNEX
        uint256 priceInNEX = token.priceInNEX();
        uint256 tokenAmount = (msg.value * 1e18) / priceInNEX;
        
        // Mint tokens to user
        token.mintWithNEX(msg.sender, msg.value);
        
        emit Swapped(msg.sender, tokenAddress, msg.value, tokenAmount, true);
    }
    
    /**
     * @dev Swap Stablecoin Token for NEX
     * User burns tokens, receives NEX based on token's priceInNEX
     */
    function swapTokenForNEX(address tokenAddress, uint256 tokenAmount) external {
        require(tokenAmount > 0, "Must swap > 0");
        
        StablecoinToken token = StablecoinToken(tokenAddress);
        
        // Calculate how much NEX user gets
        // nexAmount = tokenAmount * priceInNEX / 1e18
        uint256 priceInNEX = token.priceInNEX();
        uint256 nexAmount = (tokenAmount * priceInNEX) / 1e18;
        
        require(address(this).balance >= nexAmount, "Insufficient NEX in contract");
        
        // Burn user's tokens
        token.burnForNEX(msg.sender, tokenAmount);
        
        // Send NEX to user
        payable(msg.sender).transfer(nexAmount);
        
        emit Swapped(msg.sender, tokenAddress, nexAmount, tokenAmount, false);
    }
    
    /**
     * @dev Fund contract with NEX for liquidity
     */
    function fundContract() external payable onlyOwner {
        require(msg.value > 0, "Must send NEX");
    }
    
    /**
     * @dev Withdraw NEX from contract
     */
    function withdrawNEX(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner).transfer(amount);
    }
    
    /**
     * @dev Get contract NEX balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    receive() external payable {}
}
