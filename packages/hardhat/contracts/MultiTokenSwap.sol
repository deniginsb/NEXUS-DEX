// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMintableBurnable {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
}

/**
 * @title MultiTokenSwap - Universal Token Swap Contract
 * @dev Supports multiple tokens with WNEX as special stablecoin
 */
contract MultiTokenSwap is Ownable {
    
    // WNEX stablecoin contract
    address public immutable wnexToken;
    
    // All supported tokens
    address[] public tokens;
    mapping(address => bool) public isSupported;
    mapping(address => string) public tokenSymbols;
    
    // Swap configuration
    uint256 public swapFee = 300; // 3% = 300 basis points
    uint256 public constant MAX_FEE = 1000; // 10% max
    uint256 public constant RATE_PRECISION = 1e18;
    
    // Simple 1:1 swap rates for all tokens (except WNEX)
    mapping(address => mapping(address => uint256)) public swapRates;
    
    // Collected fees
    mapping(address => uint256) public collectedFees;
    uint256 public collectedNEXFees;
    
    // Events
    event TokenSwap(
        address indexed user,
        address indexed fromToken,
        address indexed toToken,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );
    
    event WNEXMinted(address indexed user, uint256 nexAmount, uint256 wnexAmount);
    event WNEXBurned(address indexed user, uint256 wnexAmount, uint256 nexAmount);
    event TokenAdded(address indexed token, string symbol);
    
    constructor(address _wnexToken, address _owner) Ownable(_owner) {
        wnexToken = _wnexToken;
        
        // Add WNEX as supported token
        tokens.push(_wnexToken);
        isSupported[_wnexToken] = true;
        tokenSymbols[_wnexToken] = "WNEX";
        
        emit TokenAdded(_wnexToken, "WNEX");
    }
    
    // Add multiple tokens at once
    function addTokens(address[] memory _tokens, string[] memory _symbols) external onlyOwner {
        require(_tokens.length == _symbols.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < _tokens.length; i++) {
            require(_tokens[i] != address(0), "Invalid token address");
            require(!isSupported[_tokens[i]], "Token already supported");
            
            tokens.push(_tokens[i]);
            isSupported[_tokens[i]] = true;
            tokenSymbols[_tokens[i]] = _symbols[i];
            
            // Set 1:1 swap rates with all existing tokens
            for (uint256 j = 0; j < tokens.length; j++) {
                if (tokens[j] != _tokens[i] && tokens[j] != wnexToken) {
                    swapRates[_tokens[i]][tokens[j]] = RATE_PRECISION; // 1:1
                    swapRates[tokens[j]][_tokens[i]] = RATE_PRECISION; // 1:1
                }
            }
            
            emit TokenAdded(_tokens[i], _symbols[i]);
        }
    }
    
    // NEX to WNEX (Mint WNEX)
    function swapNEXToWNEX() external payable {
        require(msg.value > 0, "Must send NEX");
        
        uint256 fee = (msg.value * swapFee) / 10000;
        uint256 amountOut = msg.value - fee;
        
        // Mint WNEX to user
        IMintableBurnable(wnexToken).mint(msg.sender, amountOut);
        
        // Collect fee
        collectedNEXFees += fee;
        
        emit WNEXMinted(msg.sender, msg.value, amountOut);
        emit TokenSwap(msg.sender, address(0), wnexToken, msg.value, amountOut, fee);
    }
    
    // WNEX to NEX (Burn WNEX)
    function swapWNEXToNEX(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(IERC20(wnexToken).balanceOf(msg.sender) >= amount, "Insufficient WNEX");
        
        uint256 fee = (amount * swapFee) / 10000;
        uint256 amountOut = amount - fee;
        
        // Transfer WNEX from user and burn it
        IERC20(wnexToken).transferFrom(msg.sender, address(this), amount);
        IMintableBurnable(wnexToken).burn(amount);
        
        // Send NEX to user
        require(address(this).balance >= amountOut, "Insufficient NEX in contract");
        payable(msg.sender).transfer(amountOut);
        
        emit WNEXBurned(msg.sender, amount, amountOut);
        emit TokenSwap(msg.sender, wnexToken, address(0), amount, amountOut, fee);
    }
    
    // NEX to any token (except WNEX)
    function swapNEXToToken(address toToken) external payable {
        require(msg.value > 0, "Must send NEX");
        require(isSupported[toToken], "Token not supported");
        require(toToken != wnexToken, "Use swapNEXToWNEX for WNEX");
        
        uint256 fee = (msg.value * swapFee) / 10000;
        uint256 amountOut = msg.value - fee;
        
        // Transfer tokens to user
        require(IERC20(toToken).transfer(msg.sender, amountOut), "Token transfer failed");
        
        // Collect fee
        collectedNEXFees += fee;
        
        emit TokenSwap(msg.sender, address(0), toToken, msg.value, amountOut, fee);
    }
    
    // Token to NEX
    function swapTokenToNEX(address fromToken, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(isSupported[fromToken], "Token not supported");
        require(fromToken != wnexToken, "Use swapWNEXToNEX for WNEX");
        
        uint256 fee = (amount * swapFee) / 10000;
        uint256 amountOut = amount - fee;
        
        // Transfer token from user
        require(IERC20(fromToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Send NEX to user
        require(address(this).balance >= amountOut, "Insufficient NEX in contract");
        payable(msg.sender).transfer(amountOut);
        
        // Collect fee
        collectedFees[fromToken] += fee;
        
        emit TokenSwap(msg.sender, fromToken, address(0), amount, amountOut, fee);
    }
    
    // Token to token swap (1:1 rate)
    function swapTokenToToken(address fromToken, address toToken, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(isSupported[fromToken] && isSupported[toToken], "Token not supported");
        require(fromToken != toToken, "Same token");
        require(fromToken != wnexToken && toToken != wnexToken, "Use specific WNEX functions");
        
        uint256 fee = (amount * swapFee) / 10000;
        uint256 amountOut = amount - fee;
        
        // Transfer from token from user
        require(IERC20(fromToken).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Transfer to token to user (1:1 ratio)
        require(IERC20(toToken).transfer(msg.sender, amountOut), "Transfer failed");
        
        // Collect fee
        collectedFees[fromToken] += fee;
        
        emit TokenSwap(msg.sender, fromToken, toToken, amount, amountOut, fee);
    }
    
    // Admin functions
    function updateFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        swapFee = newFee;
    }
    
    function withdrawTokenFees(address token, uint256 amount) external onlyOwner {
        require(collectedFees[token] >= amount, "Insufficient fees");
        collectedFees[token] -= amount;
        require(IERC20(token).transfer(owner(), amount), "Transfer failed");
    }
    
    function withdrawNEXFees(uint256 amount) external onlyOwner {
        require(collectedNEXFees >= amount, "Insufficient fees");
        require(address(this).balance >= amount, "Insufficient balance");
        collectedNEXFees -= amount;
        payable(owner()).transfer(amount);
    }
    
    // Fund contract with tokens for trading
    function fundContract(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
    
    // Emergency functions
    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(address(this).balance);
        } else {
            IERC20(token).transfer(owner(), IERC20(token).balanceOf(address(this)));
        }
    }
    
    // View functions
    function getSupportedTokens() external view returns (address[] memory) {
        return tokens;
    }
    
    function getTokenCount() external view returns (uint256) {
        return tokens.length;
    }
    
    function getSwapAmountOut(uint256 amountIn) external view returns (uint256) {
        if (amountIn == 0) return 0;
        uint256 fee = (amountIn * swapFee) / 10000;
        return amountIn - fee;
    }
    
    // Receive NEX
    receive() external payable {}
}