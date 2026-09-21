// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IZkMLVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) external view returns (bool);
}

contract AlgoArenaZkMLTournament {
    IZkMLVerifier public immutable verifier;
    mapping(bytes32 => bool) public verifiedMatches;

    event MatchVerified(bytes32 indexed matchHash, address indexed winner);

    constructor(address _verifierAddress) {
        verifier = IZkMLVerifier(_verifierAddress);
    }

    function submitVerifiedMatch(
        bytes32 matchHash,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) external {
        require(verifier.verifyProof(a, b, c, input), "Invalid zk-ML Proof");
        verifiedMatches[matchHash] = true;
        emit MatchVerified(matchHash, msg.sender);
    }
}
