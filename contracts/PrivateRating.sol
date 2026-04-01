// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract PrivateRating {
    euint32 private totalRating;
    uint32 public ratingCount;
    address public owner;
    string public serviceName;

    mapping(address => bool) public hasRated;

    event RatingSubmitted(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(string memory _serviceName) {
        owner = msg.sender;
        serviceName = _serviceName;
        totalRating = FHE.asEuint32(0);
        // Allow contract + owner to access totalRating from the start
        FHE.allowThis(totalRating);
        FHE.allow(totalRating, owner);
    }

    // Kol user ysawt mra wahda b rating encrypted (1-5)
    function submitRating(InEuint8 calldata encryptedRating) external {
        require(!hasRated[msg.sender], "Already rated");

        euint8 rating = FHE.asEuint8(encryptedRating);
        totalRating = FHE.add(totalRating, FHE.asEuint32(rating));

        // ACL: allow contract + owner to read new totalRating handle
        FHE.allowThis(totalRating);
        FHE.allow(totalRating, owner);

        ratingCount++;
        hasRated[msg.sender] = true;

        emit RatingSubmitted(msg.sender);
    }

    // Owner gets the ciphertext handle — SDK decrypts it via Threshold Network
    function getTotalHandle() external view onlyOwner returns (bytes32) {
        return euint32.unwrap(totalRating);
    }
}
