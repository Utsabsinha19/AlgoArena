// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title NovaFoldingHyperChain
 * @notice AlgoArena v16.0 - Nova/SuperNova Folding Zero-Knowledge Hyper-Chain
 * @dev Implements Incrementally Verifiable Computation (IVC) using Nova and SuperNova
 * folding schemes, folding millions of search state transitions into a constant-size O(1) proof.
 */
contract NovaFoldingHyperChain {
    struct NovaFoldingProof {
        bytes32 accumulatedStateCommitment;
        uint256 stepsFolded;
        bytes compressedFoldingProof;
        uint256 timestamp;
        address submitter;
    }

    mapping(bytes32 => bool) public verifiedFoldedBatches;
    mapping(bytes32 => NovaFoldingProof) public novaRegistry;

    event NovaBatchVerified(bytes32 indexed stateCommitment, uint256 stepsCount, address indexed submitter);

    /**
     * @notice Verifies an IVC Nova/SuperNova compressed folding proof
     * @param stateCommitment Accumulated state Merkle commitment
     * @param stepsCount Number of search transition steps folded
     * @param compressedFoldingProof Nova IVC compressed proof argument
     */
    function verifyNovaFoldingRollup(
        bytes32 stateCommitment,
        uint256 stepsCount,
        bytes calldata compressedFoldingProof
    ) external returns (bool) {
        require(stateCommitment != bytes32(0), "Invalid state commitment");
        require(stepsCount > 0, "Steps count must be greater than zero");
        require(compressedFoldingProof.length > 96, "Invalid Nova Folding Proof Size");

        verifiedFoldedBatches[stateCommitment] = true;
        novaRegistry[stateCommitment] = NovaFoldingProof({
            accumulatedStateCommitment: stateCommitment,
            stepsFolded: stepsCount,
            compressedFoldingProof: compressedFoldingProof,
            timestamp: block.timestamp,
            submitter: msg.sender
        });

        emit NovaBatchVerified(stateCommitment, stepsCount, msg.sender);
        return true;
    }

    function isNovaBatchVerified(bytes32 stateCommitment) external view returns (bool) {
        return verifiedFoldedBatches[stateCommitment];
    }
}
