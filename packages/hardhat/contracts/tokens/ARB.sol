// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ARB is ERC20 {
    constructor(address initialOwner) ERC20("Arbitrum", "ARB") {
        _mint(initialOwner, 10_000_000_000 * 10 ** 18); // 10B ARB
    }
}
