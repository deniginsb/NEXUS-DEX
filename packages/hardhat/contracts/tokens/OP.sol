// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OP is ERC20 {
    constructor(address initialOwner) ERC20("Optimism", "OP") {
        _mint(initialOwner, 4_294_967_296 * 10 ** 18); // 4.3B OP
    }
}
