// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NativeNEXSwap
 * @dev Multi-swap contract that supports both native NEX and ERC20 token swaps
 * Features:
 * - Direct NEX native swaps (no wrap needed!)
 * - ERC20 token swaps
 * - Admin-controlled swap rates
 * - Fee collection system
 * - Multiple token pairs support
 */
contract NativeNEXSwap is Ownable {
    // Events
    event NEXSwapExecuted(
        address indexed user,
        uint256 nexAmount,
        address indexed tokenAddress,
        uint256 tokenAmount,
        uint256 fee
    );

    event ERC20SwapExecuted(
        address indexed user,
        address indexed fromToken,
        address indexed toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 fee
    );

    event SwapRateUpdated(
        address indexed fromToken,
        address indexed toToken,
        uint256 oldRate,
        uint256 newRate
    );

    event FeeUpdated(uint256 oldFee, uint256 newFee);

    event TokensWithdrawn(address indexed token, uint256 amount, address indexed to);

    // Constants
    uint256 private constant DECIMAL_MULTIPLIER = 10**12;

    // State variables
    mapping(address => mapping(address => uint256)) public swapRates;
    mapping(address => bool) public supportedTokens;

    // Default swap rate (basis points - 300 = 3%)
    uint256 public feePercentage = 300;
    uint256 public constant MAX_FEE = 1000; // Max 10%

    // Supported token addresses
    address public immutable NEXA_TOKEN;
    address public immutable NEXB_TOKEN;
    address public immutable WNEX_TOKEN;

    constructor(
        address _nexaToken,
        address _nexbToken,
        address _wnexToken,
        address initialOwner
    ) Ownable(initialOwner) {
        NEXA_TOKEN = _nexaToken;
        NEXB_TOKEN = _nexbToken;
        WNEX_TOKEN = _wnexToken;

        // Mark tokens as supported
        supportedTokens[_nexaToken] = true;
        supportedTokens[_nexbToken] = true;
        supportedTokens[_wnexToken] = true;

        // Set initial swap rates
        // Native NEX swaps (1:1 for WNEX, 1:1,000,000 for NEXA/NEXB)
        swapRates[address(0)][_nexaToken] = DECIMAL_MULTIPLIER; // NEX -> NEXA (1:1,000,000)
        swapRates[address(0)][_nexbToken] = DECIMAL_MULTIPLIER; // NEX -> NEXB (1:1,000,000)
        swapRates[address(0)][_wnexToken] = 10**18; // NEX -> WNEX (1:1)

        // ERC20 swaps
        swapRates[_nexaToken][_nexbToken] = 1; // NEXA -> NEXB (1:1)
        swapRates[_nexbToken][_nexaToken] = 1; // NEXB -> NEXA (1:1)

        swapRates[_nexaToken][_wnexToken] = DECIMAL_MULTIPLIER; // NEXA -> WNEX (1:1,000,000)
        swapRates[_wnexToken][_nexaToken] = DECIMAL_MULTIPLIER; // WNEX -> NEXA (1:1,000,000)

        swapRates[_nexbToken][_wnexToken] = DECIMAL_MULTIPLIER; // NEXB -> WNEX (1:1,000,000)
        swapRates[_wnexToken][_nexbToken] = DECIMAL_MULTIPLIER; // WNEX -> NEXB (1:1,000,000)
    }

    // MODIFIERS
    modifier validToken(address token) {
        require(supportedTokens[token] || token == address(0), "Token not supported");
        _;
    }

    // NATIVE NEX SWAPS
    /**
     * @dev Swap NEX native directly to NEXA
     */
    function swapNEXToNEXA() external payable {
        uint256 nexaAmount = (msg.value * swapRates[address(0)][NEXA_TOKEN]) / 10**18;
        uint256 fee = (nexaAmount * feePercentage) / 10000;
        uint256 userAmount = nexaAmount - fee;

        require(userAmount > 0, "Amount too small");

        // Transfer NEXA to user
        require(IERC20(NEXA_TOKEN).transfer(msg.sender, userAmount), "NEXA transfer failed");

        emit NEXSwapExecuted(msg.sender, msg.value, NEXA_TOKEN, userAmount, fee);
    }

    /**
     * @dev Swap NEX native directly to NEXB
     */
    function swapNEXToNEXB() external payable {
        uint256 nexbAmount = (msg.value * swapRates[address(0)][NEXB_TOKEN]) / 10**18;
        uint256 fee = (nexbAmount * feePercentage) / 10000;
        uint256 userAmount = nexbAmount - fee;

        require(userAmount > 0, "Amount too small");

        // Transfer NEXB to user
        require(IERC20(NEXB_TOKEN).transfer(msg.sender, userAmount), "NEXB transfer failed");

        emit NEXSwapExecuted(msg.sender, msg.value, NEXB_TOKEN, userAmount, fee);
    }

    /**
     * @dev Swap NEX native directly to WNEX (1:1)
     */
    function swapNEXToWNEX() external payable {
        uint256 wnexAmount = (msg.value * swapRates[address(0)][WNEX_TOKEN]) / 10**18;
        uint256 fee = (wnexAmount * feePercentage) / 10000;
        uint256 userAmount = wnexAmount - fee;

        require(userAmount > 0, "Amount too small");

        // Transfer WNEX to user
        require(IERC20(WNEX_TOKEN).transfer(msg.sender, userAmount), "WNEX transfer failed");

        emit NEXSwapExecuted(msg.sender, msg.value, WNEX_TOKEN, userAmount, fee);
    }

    // ERC20 TOKEN SWAPS
    /**
     * @dev Generic ERC20 to ERC20 swap
     */
    function swapTokens(
        address fromToken,
        address toToken,
        uint256 amount
    ) external validToken(fromToken) validToken(toToken) {
        require(fromToken != toToken, "Cannot swap same token");
        require(amount > 0, "Amount must be greater than 0");

        // Calculate swap rate
        uint256 rate = swapRates[fromToken][toToken];
        require(rate > 0, "Swap pair not supported");

        // Calculate output amount
        uint256 toAmount = (amount * rate) / 10**18;
        require(toAmount > 0, "Output amount too small");

        // Calculate and collect fee
        uint256 fee = (toAmount * feePercentage) / 10000;
        uint256 userAmount = toAmount - fee;

        // Transfer fromToken from user
        require(IERC20(fromToken).transferFrom(msg.sender, address(this), amount), "Transfer from failed");

        // Transfer toToken to user
        require(IERC20(toToken).transfer(msg.sender, userAmount), "Transfer to failed");

        emit ERC20SwapExecuted(msg.sender, fromToken, toToken, amount, userAmount, fee);
    }

    // ADMIN FUNCTIONS
    /**
     * @dev Update swap rate for a token pair
     */
    function updateSwapRate(
        address fromToken,
        address toToken,
        uint256 newRate
    ) external onlyOwner validToken(fromToken) validToken(toToken) {
        require(newRate > 0, "Rate must be greater than 0");
        require(fromToken != toToken, "Cannot set rate for same token");

        uint256 oldRate = swapRates[fromToken][toToken];
        swapRates[fromToken][toToken] = newRate;

        emit SwapRateUpdated(fromToken, toToken, oldRate, newRate);
    }

    /**
     * @dev Update fee percentage (in basis points)
     */
    function updateFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        require(newFee >= 0, "Fee cannot be negative");

        uint256 oldFee = feePercentage;
        feePercentage = newFee;

        emit FeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Add support for a new token
     */
    function addTokenSupport(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    /**
     * @dev Remove support for a token
     */
    function removeTokenSupport(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    /**
     * @dev Withdraw accumulated fees or tokens
     */
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            // Withdraw native NEX
            require(address(this).balance >= amount, "Insufficient balance");
            payable(owner()).transfer(amount);
        } else {
            require(IERC20(token).transfer(owner(), amount), "Withdrawal failed");
        }

        emit TokensWithdrawn(token, amount, owner());
    }

    /**
     * @dev Get swap rate between two tokens
     */
    function getSwapRate(address fromToken, address toToken) external view returns (uint256) {
        return swapRates[fromToken][toToken];
    }

    /**
     * @dev Check if a token is supported
     */
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }

    /**
     * @dev Get contract balance of a token
     */
    function getContractBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        }
        return IERC20(token).balanceOf(address(this));
    }

    // VIEW FUNCTIONS
    /**
     * @dev Calculate output amount for a given input
     */
    function getExpectedOutput(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view validToken(fromToken) validToken(toToken) returns (uint256) {
        if (amount == 0) return 0;

        uint256 rate = swapRates[fromToken][toToken];
        if (rate == 0) return 0;

        uint256 toAmount = (amount * rate) / 10**18;
        uint256 fee = (toAmount * feePercentage) / 10000;

        return toAmount - fee;
    }

    // RECEIVE FUNCTION
    receive() external payable {
        // Allow contract to receive native NEX
    }
}
