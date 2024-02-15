// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

contract Account {
    address public owner;

    constructor(address payable _owner) {
        owner = _owner;
    }

    function setOwner(address _owner) public {
        require(msg.sender == owner);
        owner = _owner;
    }

    function destroy(address payable recipient) public {
        require(msg.sender == owner);
        recipient.transfer(address(this).balance);
        // selfdestruct(recipient);
    }

    receive() external payable {}
}
