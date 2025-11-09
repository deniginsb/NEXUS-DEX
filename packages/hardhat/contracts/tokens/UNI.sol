// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UNI is ERC20 {
    constructor(address initialOwner) ERC20("Uniswap", "UNI") {
        _mint(initialOwner, 1_000_000_000 * 10 ** 18); // 1B UNI
    }
}
