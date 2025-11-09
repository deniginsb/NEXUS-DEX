// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PEPE is ERC20 {
    constructor(address initialOwner) ERC20("Pepe", "PEPE") {
        _mint(initialOwner, 420_690_000_000_000 * 10 ** 18); // 420.69T
    }
}
