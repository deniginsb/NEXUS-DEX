// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenSwap {
    IERC20 public tokenA;
    IERC20 public tokenB;
    IERC20 public wnex;

    uint256 private constant DECIMAL_MULTIPLIER = 10**12; // Convert from 6 to 18 decimals

    event Swap(address indexed user, address tokenFrom, address tokenTo, uint256 amount);

    constructor(address _tokenA, address _tokenB, address _wnex) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        wnex = IERC20(_wnex);
    }

    // Swap TokenA (6 decimals) to TokenB (6 decimals) with 1:1 ratio
    function swapAtoB(uint256 amount) public {
        require(amount > 0, "Amount must be > 0");
        require(tokenA.transferFrom(msg.sender, address(this), amount), "TokenA transfer failed");
        
        // Mint TokenB to user (same amount, same decimals)
        // This is a simplified version - in real scenario TokenB should be a mintable/burnable token
        // For this demo, we assume TokenB has a mint function or the swapper is the owner
        try this.mintTokenB(msg.sender, amount) {
            emit Swap(msg.sender, address(tokenA), address(tokenB), amount);
        } catch {
            revert("TokenB mint failed - ensure TokenB has mint functionality");
        }
    }

    // Swap TokenB (6 decimals) to TokenA (6 decimals) with 1:1 ratio
    function swapBtoA(uint256 amount) public {
        require(amount > 0, "Amount must be > 0");
        require(tokenB.transferFrom(msg.sender, address(this), amount), "TokenB transfer failed");
        
        // Transfer TokenA to user (same amount, same decimals)
        require(tokenA.transfer(msg.sender, amount), "TokenA transfer failed");
        emit Swap(msg.sender, address(tokenB), address(tokenA), amount);
    }

    // Swap TokenA to WNEX (6 decimals to 18 decimals)
    function swapAtoWNEX(uint256 amount) public {
        require(amount > 0, "Amount must be > 0");
        require(tokenA.transferFrom(msg.sender, address(this), amount), "TokenA transfer failed");
        
        // Convert: amount (6 decimals) * 10^12 = WNEX amount (18 decimals)
        uint256 wnexAmount = amount * DECIMAL_MULTIPLIER;
        require(wnex.transfer(msg.sender, wnexAmount), "WNEX transfer failed");
        
        emit Swap(msg.sender, address(tokenA), address(wnex), amount);
    }

    // Swap WNEX to TokenA (18 decimals to 6 decimals)
    function swapWNEXtoA(uint256 amount) public {
        require(amount > 0, "Amount must be > 0");
        require(wnex.transferFrom(msg.sender, address(this), amount), "WNEX transfer failed");
        
        // Convert: amount (18 decimals) / 10^12 = TokenA amount (6 decimals)
        uint256 tokenAAmount = amount / DECIMAL_MULTIPLIER;
        require(tokenAAmount > 0, "Amount too small");
        require(tokenA.transfer(msg.sender, tokenAAmount), "TokenA transfer failed");
        
        emit Swap(msg.sender, address(wnex), address(tokenA), amount);
    }

    // Swap TokenB to WNEX (6 decimals to 18 decimals)
    function swapBtoWNEX(uint256 amount) public {
        require(amount > 0, "Amount must be > 0");
        require(tokenB.transferFrom(msg.sender, address(this), amount), "TokenB transfer failed");
        
        // Convert: amount (6 decimals) * 10^12 = WNEX amount (18 decimals)
        uint256 wnexAmount = amount * DECIMAL_MULTIPLIER;
        require(wnex.transfer(msg.sender, wnexAmount), "WNEX transfer failed");
        
        emit Swap(msg.sender, address(tokenB), address(wnex), amount);
    }

    // Swap WNEX to TokenB (18 decimals to 6 decimals)
    function swapWNEXtoB(uint256 amount) public {
        require(amount > 0, "Amount must be > 0");
        require(wnex.transferFrom(msg.sender, address(this), amount), "WNEX transfer failed");
        
        // Convert: amount (18 decimals) / 10^12 = TokenB amount (6 decimals)
        uint256 tokenBAmount = amount / DECIMAL_MULTIPLIER;
        require(tokenBAmount > 0, "Amount too small");
        require(tokenB.transfer(msg.sender, tokenBAmount), "TokenB transfer failed");
        
        emit Swap(msg.sender, address(wnex), address(tokenB), amount);
    }

    // Helper function to mint TokenB (only for TokenSwap contract)
    function mintTokenB(address to, uint256 amount) public {
        require(msg.sender == address(this), "Only self-call allowed");
        // In a real implementation, TokenB should have a mint function
        // For this demo, we'll just revert if TokenB doesn't have mint capability
        revert("TokenB must implement mint function for TokenSwap to work");
    }

    // Admin function to withdraw tokens (in case of emergency or cleanup)
    function withdrawTokens(address token, uint256 amount) public {
        require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
    }
}
