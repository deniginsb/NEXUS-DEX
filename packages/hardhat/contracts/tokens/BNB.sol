// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BNB is ERC20 {
    constructor(address initialOwner) ERC20("BNB", "BNB") {
        _mint(initialOwner, 200_000_000 * 10 ** 18); // 200M BNB
    }
}
