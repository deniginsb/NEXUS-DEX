// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenPairPool
 * @notice AMM pool for any ERC20 token pair with dynamic pricing (x * y = k)
 * @dev Prevents exploit: Only tokens with funded pools can be swapped
 */
contract TokenPairPool is ERC20, Ownable {
    IERC20 public immutable token0; // First token (usually WNEX)
    IERC20 public immutable token1; // Second token (e.g., LEMON)
    
    uint256 public reserve0; // Reserve of token0
    uint256 public reserve1; // Reserve of token1
    
    uint256 public constant FEE_PERCENT = 3; // 0.3% fee (3/1000)
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    
    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity);
    event Swap(address indexed user, bool zeroForOne, uint256 amountIn, uint256 amountOut);
    
    constructor(
        address _token0,
        address _token1,
        string memory _name,
        string memory _symbol,
        address initialOwner
    ) ERC20(_name, _symbol) Ownable(initialOwner) {
        require(_token0 != _token1, "Identical tokens");
        require(_token0 != address(0) && _token1 != address(0), "Zero address");
        
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }
    
    /**
     * @notice Add liquidity to pool
     * @param amount0 Amount of token0 to add
     * @param amount1 Amount of token1 to add
     */
    function addLiquidity(uint256 amount0, uint256 amount1) external returns (uint256 liquidity) {
        require(amount0 > 0 && amount1 > 0, "Amounts must be > 0");
        
        // Transfer tokens to pool
        require(token0.transferFrom(msg.sender, address(this), amount0), "Transfer token0 failed");
        require(token1.transferFrom(msg.sender, address(this), amount1), "Transfer token1 failed");
        
        uint256 totalSupply = totalSupply();
        
        if (totalSupply == 0) {
            // First liquidity provider
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0x000000000000000000000000000000000000dEaD), MINIMUM_LIQUIDITY); // Lock minimum liquidity
        } else {
            // Subsequent liquidity providers
            liquidity = min(
                (amount0 * totalSupply) / reserve0,
                (amount1 * totalSupply) / reserve1
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        
        _mint(msg.sender, liquidity);
        
        // Update reserves
        reserve0 += amount0;
        reserve1 += amount1;
        
        emit LiquidityAdded(msg.sender, amount0, amount1, liquidity);
    }
    
    /**
     * @notice Remove liquidity from pool
     * @param liquidity Amount of LP tokens to burn
     */
    function removeLiquidity(uint256 liquidity) external returns (uint256 amount0, uint256 amount1) {
        require(liquidity > 0, "Liquidity must be > 0");
        require(balanceOf(msg.sender) >= liquidity, "Insufficient LP tokens");
        
        uint256 totalSupply = totalSupply();
        
        // Calculate amounts to return
        amount0 = (liquidity * reserve0) / totalSupply;
        amount1 = (liquidity * reserve1) / totalSupply;
        
        require(amount0 > 0 && amount1 > 0, "Insufficient liquidity burned");
        
        // Burn LP tokens
        _burn(msg.sender, liquidity);
        
        // Update reserves
        reserve0 -= amount0;
        reserve1 -= amount1;
        
        // Transfer tokens back to user
        require(token0.transfer(msg.sender, amount0), "Transfer token0 failed");
        require(token1.transfer(msg.sender, amount1), "Transfer token1 failed");
        
        emit LiquidityRemoved(msg.sender, amount0, amount1, liquidity);
    }
    
    /**
     * @notice Swap token0 for token1 or vice versa
     * @param amountIn Amount of input token
     * @param zeroForOne True if swapping token0 for token1, false otherwise
     * @param minAmountOut Minimum amount of output token (slippage protection)
     */
    function swap(
        uint256 amountIn,
        bool zeroForOne,
        uint256 minAmountOut
    ) external returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be > 0");
        require(reserve0 > 0 && reserve1 > 0, "No liquidity");
        
        // Calculate output amount using x * y = k formula
        amountOut = getAmountOut(amountIn, zeroForOne);
        require(amountOut >= minAmountOut, "Slippage too high");
        
        if (zeroForOne) {
            // Swap token0 for token1
            require(token0.transferFrom(msg.sender, address(this), amountIn), "Transfer in failed");
            require(token1.transfer(msg.sender, amountOut), "Transfer out failed");
            
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            // Swap token1 for token0
            require(token1.transferFrom(msg.sender, address(this), amountIn), "Transfer in failed");
            require(token0.transfer(msg.sender, amountOut), "Transfer out failed");
            
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }
        
        emit Swap(msg.sender, zeroForOne, amountIn, amountOut);
    }
    
    /**
     * @notice Calculate output amount for a given input (with 0.3% fee)
     * @param amountIn Amount of input token
     * @param zeroForOne True if swapping token0 for token1
     */
    function getAmountOut(uint256 amountIn, bool zeroForOne) public view returns (uint256) {
        require(amountIn > 0, "Amount must be > 0");
        require(reserve0 > 0 && reserve1 > 0, "No liquidity");
        
        // Apply 0.3% fee (997/1000)
        uint256 amountInWithFee = amountIn * 997;
        
        if (zeroForOne) {
            // token0 -> token1
            uint256 numerator = amountInWithFee * reserve1;
            uint256 denominator = (reserve0 * 1000) + amountInWithFee;
            return numerator / denominator;
        } else {
            // token1 -> token0
            uint256 numerator = amountInWithFee * reserve0;
            uint256 denominator = (reserve1 * 1000) + amountInWithFee;
            return numerator / denominator;
        }
    }
    
    /**
     * @notice Get current price (token1 per token0)
     */
    function getPrice() external view returns (uint256) {
        require(reserve0 > 0, "No liquidity");
        return (reserve1 * 1e18) / reserve0;
    }
    
    /**
     * @notice Get pool reserves
     */
    function getReserves() external view returns (uint256, uint256) {
        return (reserve0, reserve1);
    }
    
    // Helper functions
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
