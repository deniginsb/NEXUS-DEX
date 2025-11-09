// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SOL is ERC20 {
    constructor(address initialOwner) ERC20("Solana", "SOL") {
        _mint(initialOwner, 500_000_000 * 10 ** 18); // 500M SOL
    }
}
