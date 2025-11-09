// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DOGE is ERC20 {
    constructor(address initialOwner) ERC20("Dogecoin", "DOGE") {
        _mint(initialOwner, 100_000_000_000 * 10 ** 18); // 100B DOGE
    }
}
