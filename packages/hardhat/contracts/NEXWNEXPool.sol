// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NEXWNEXPool
 * @dev Liquidity pool for NEX (native) + WNEX (ERC20) pair
 * Features:
 * - Add liquidity: deposit NEX + WNEX, receive LP tokens
 * - Remove liquidity: burn LP tokens, withdraw NEX + WNEX
 * - Fixed 1:1 ratio (both 18 decimals)
 * - LP tokens represent pool ownership
 */
contract NEXWNEXPool is ERC20, Ownable {
    // Token addresses
    address public immutable WNEX_TOKEN;
    
    // Pool reserves
    uint256 public reserveNEX;
    uint256 public reserveWNEX;
    
    // Fee (basis points - 300 = 3%)
    uint256 public feePercentage = 300;
    uint256 public constant MAX_FEE = 1000; // Max 10%
    
    // Minimum liquidity locked forever to prevent division by zero
    uint256 private constant MINIMUM_LIQUIDITY = 10**3;
    
    // Events
    event LiquidityAdded(
        address indexed provider,
        uint256 nexAmount,
        uint256 wnexAmount,
        uint256 lpTokens
    );
    
    event LiquidityRemoved(
        address indexed provider,
        uint256 nexAmount,
        uint256 wnexAmount,
        uint256 lpTokens
    );
    
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    
    constructor(
        address _wnexToken,
        address initialOwner
    ) ERC20("NEX-WNEX LP Token", "NEX-WNEX-LP") Ownable(initialOwner) {
        WNEX_TOKEN = _wnexToken;
    }
    
    /**
     * @dev Add liquidity to the pool (1:1 ratio)
     * @param wnexAmount Amount of WNEX to deposit
     * @return lpTokens Amount of LP tokens minted
     */
    function addLiquidity(uint256 wnexAmount) 
        external 
        payable 
        returns (uint256 lpTokens) 
    {
        uint256 nexAmount = msg.value;
        require(nexAmount > 0 && wnexAmount > 0, "Amounts must be > 0");
        require(nexAmount == wnexAmount, "Must be 1:1 ratio");
        
        // Transfer WNEX from user
        require(
            IERC20(WNEX_TOKEN).transferFrom(msg.sender, address(this), wnexAmount),
            "WNEX transfer failed"
        );
        
        // Calculate LP tokens to mint
        uint256 totalSupply = totalSupply();
        
        if (totalSupply == 0) {
            // First liquidity provider
            // Mint LP tokens equal to amount (minus minimum liquidity)
            lpTokens = nexAmount - MINIMUM_LIQUIDITY;
            
            // Lock minimum liquidity forever (mint to dead address instead of address(0))
            _mint(address(0x000000000000000000000000000000000000dEaD), MINIMUM_LIQUIDITY);
        } else {
            // Subsequent liquidity providers
            // LP tokens proportional to share of pool
            lpTokens = (nexAmount * totalSupply) / reserveNEX;
        }
        
        require(lpTokens > 0, "Insufficient LP tokens");
        
        // Update reserves
        reserveNEX += nexAmount;
        reserveWNEX += wnexAmount;
        
        // Mint LP tokens to provider
        _mint(msg.sender, lpTokens);
        
        emit LiquidityAdded(msg.sender, nexAmount, wnexAmount, lpTokens);
    }
    
    /**
     * @dev Remove liquidity from the pool
     * @param lpTokens Amount of LP tokens to burn
     * @return nexAmount Amount of NEX withdrawn
     * @return wnexAmount Amount of WNEX withdrawn
     */
    function removeLiquidity(uint256 lpTokens) 
        external 
        returns (uint256 nexAmount, uint256 wnexAmount) 
    {
        require(lpTokens > 0, "LP tokens must be > 0");
        require(balanceOf(msg.sender) >= lpTokens, "Insufficient LP tokens");
        
        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, "No liquidity");
        
        // Calculate share of pool
        nexAmount = (lpTokens * reserveNEX) / totalSupply;
        wnexAmount = (lpTokens * reserveWNEX) / totalSupply;
        
        require(nexAmount > 0 && wnexAmount > 0, "Insufficient liquidity withdrawn");
        
        // Apply fee
        uint256 nexFee = (nexAmount * feePercentage) / 10000;
        uint256 wnexFee = (wnexAmount * feePercentage) / 10000;
        
        nexAmount -= nexFee;
        wnexAmount -= wnexFee;
        
        // Update reserves
        reserveNEX -= (nexAmount + nexFee);
        reserveWNEX -= (wnexAmount + wnexFee);
        
        // Burn LP tokens
        _burn(msg.sender, lpTokens);
        
        // Transfer tokens to user
        require(
            IERC20(WNEX_TOKEN).transfer(msg.sender, wnexAmount),
            "WNEX transfer failed"
        );
        
        payable(msg.sender).transfer(nexAmount);
        
        emit LiquidityRemoved(msg.sender, nexAmount, wnexAmount, lpTokens);
    }
    
    /**
     * @dev Get pool reserves
     */
    function getReserves() external view returns (uint256 _reserveNEX, uint256 _reserveWNEX) {
        return (reserveNEX, reserveWNEX);
    }
    
    /**
     * @dev Calculate LP tokens for given amounts
     */
    function calculateLPTokens(uint256 nexAmount, uint256 wnexAmount) 
        external 
        view 
        returns (uint256 lpTokens) 
    {
        require(nexAmount > 0 && wnexAmount > 0, "Amounts must be > 0");
        require(nexAmount == wnexAmount, "Must be 1:1 ratio");
        
        uint256 totalSupply = totalSupply();
        
        if (totalSupply == 0) {
            lpTokens = nexAmount - MINIMUM_LIQUIDITY;
        } else {
            lpTokens = (nexAmount * totalSupply) / reserveNEX;
        }
    }
    
    /**
     * @dev Calculate withdrawal amounts for given LP tokens
     */
    function calculateWithdrawal(uint256 lpTokens) 
        external 
        view 
        returns (uint256 nexAmount, uint256 wnexAmount) 
    {
        require(lpTokens > 0, "LP tokens must be > 0");
        
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) return (0, 0);
        
        nexAmount = (lpTokens * reserveNEX) / totalSupply;
        wnexAmount = (lpTokens * reserveWNEX) / totalSupply;
        
        // Apply fee
        uint256 nexFee = (nexAmount * feePercentage) / 10000;
        uint256 wnexFee = (wnexAmount * feePercentage) / 10000;
        
        nexAmount -= nexFee;
        wnexAmount -= wnexFee;
    }
    
    /**
     * @dev Update fee percentage (only owner)
     */
    function updateFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        
        uint256 oldFee = feePercentage;
        feePercentage = newFee;
        
        emit FeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Emergency withdraw (only owner, for stuck tokens)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            // Withdraw NEX (only excess, not reserves)
            uint256 excess = address(this).balance - reserveNEX;
            require(excess >= amount, "Insufficient excess NEX");
            payable(owner()).transfer(amount);
        } else {
            // Withdraw ERC20 (only excess, not reserves if WNEX)
            uint256 balance = IERC20(token).balanceOf(address(this));
            if (token == WNEX_TOKEN) {
                uint256 excess = balance - reserveWNEX;
                require(excess >= amount, "Insufficient excess WNEX");
            }
            require(IERC20(token).transfer(owner(), amount), "Transfer failed");
        }
    }
    
    // Receive NEX
    receive() external payable {}
}
