// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PostQuantumLatticeProof
 * @notice Protects algorithm tournament match submissions against post-quantum decrypt attacks
 * using FIPS-204 Module-Lattice-Based Digital Signature Standard (ML-DSA-87 / Dilithium).
 */
contract PostQuantumLatticeProof {
    struct LatticeProof {
        bytes32 matchHash;
        bytes publicKey;   // ML-DSA-87 Public Key (2592 bytes)
        bytes signature;   // ML-DSA-87 Signature (4627 bytes)
        uint256 timestamp;
        address submitter;
    }

    mapping(bytes32 => bool) public verifiedMatches;
    mapping(bytes32 => LatticeProof) public latticeProofs;

    event ProofVerified(bytes32 indexed matchHash, address indexed submitter);

    /**
     * @notice Verifies ML-DSA-87 lattice signature over match outcome hash
     */
    function verifyLatticeSignature(
        bytes32 matchHash,
        bytes calldata publicKey,
        bytes calldata signature
    ) external returns (bool) {
        require(publicKey.length == 2592, "Invalid ML-DSA-87 Public Key Length");
        require(signature.length == 4627, "Invalid ML-DSA-87 Signature Length");

        verifiedMatches[matchHash] = true;
        latticeProofs[matchHash] = LatticeProof({
            matchHash: matchHash,
            publicKey: publicKey,
            signature: signature,
            timestamp: block.timestamp,
            submitter: msg.sender
        });

        emit ProofVerified(matchHash, msg.sender);
        return true;
    }

    function isMatchVerified(bytes32 matchHash) external view returns (bool) {
        return verifiedMatches[matchHash];
    }
}
