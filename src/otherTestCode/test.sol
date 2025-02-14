// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Name {
    function name(address[] memory add, uint256 _value) public payable {
        for(uint256 x = 0; x < add.length; x++) {
            address payable ap = payable(add[x]);
            ap.transfer(_value);
        }
    }
}

// Contract address: 0xFc042fAFD5788c45442DA45492ac6BB7FF4E81E0