// contracts/fhe/FHEStrategyVault.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Abstracted FHE library interface
interface IFHEEngine {
    function addEncrypted(bytes calldata a, bytes calldata b) external pure returns (bytes memory);
    function compareEncrypted(bytes calldata a, bytes calldata b) external pure returns (bytes memory);
}

contract FHEStrategyVault {
    struct EncryptedPathState {
        bytes encryptedCost;
        bytes encryptedNodeIndex;
    }

    mapping(address => EncryptedPathState) private playerStrategies;

    event EncryptedStrategySubmitted(address indexed player);

    function submitEncryptedStrategy(bytes calldata _cost, bytes calldata _nodeIdx) external {
        playerStrategies[msg.sender] = EncryptedPathState(_cost, _nodeIdx);
        emit EncryptedStrategySubmitted(msg.sender);
    }

    function executeHomomorphicRace(address playerA, address playerB, IFHEEngine fhe) external view returns (bytes memory encryptedWinner) {
        EncryptedPathState memory stateA = playerStrategies[playerA];
        EncryptedPathState memory stateB = playerStrategies[playerB];

        // Execute homomorphic comparison without decrypting strategy values
        return fhe.compareEncrypted(stateA.encryptedCost, stateB.encryptedCost);
    }
}
