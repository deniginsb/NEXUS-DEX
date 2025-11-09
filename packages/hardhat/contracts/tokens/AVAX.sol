// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AVAX is ERC20 {
    constructor(address initialOwner) ERC20("Avalanche", "AVAX") {
        _mint(initialOwner, 720_000_000 * 10 ** 18); // 720M AVAX
    }
}
