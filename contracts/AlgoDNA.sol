// contracts/AlgoDNA.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AlgoDNA - Dynamic ERC-721 Algorithm Genome Token
 * @notice Stores and mutates algorithm traits (Speed, Accuracy, Adaptability)
 * based on verified tournament victories on-chain.
 */
contract AlgoDNA is ERC721, Ownable {
    uint256 public nextTokenId;

    struct Genome {
        uint8 speed;
        uint8 accuracy;
        uint8 explorationStyle;
        uint8 adaptability;
        uint32 wins;
        uint32 matchesPlayed;
    }

    mapping(uint256 => Genome) public genomes;

    event GenomeMutated(uint256 indexed tokenId, uint8 newSpeed, uint8 newAccuracy);
    event MatchRecorded(uint256 indexed tokenId, bool won);

    constructor() ERC721("AlgoArena DNA", "ALGODNA") Ownable(msg.sender) {}

    function mintAlgorithmDNA(
        address recipient,
        uint8 speed,
        uint8 accuracy,
        uint8 explorationStyle,
        uint8 adaptability
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _safeMint(recipient, tokenId);
        genomes[tokenId] = Genome(speed, accuracy, explorationStyle, adaptability, 0, 0);
        return tokenId;
    }

    function recordMatch(uint256 tokenId, bool won) external onlyOwner {
        Genome storage g = genomes[tokenId];
        g.matchesPlayed++;
        if (won) {
            g.wins++;
            if (g.speed < 100) g.speed += 1;
            if (g.accuracy < 100) g.accuracy += 1;
            emit GenomeMutated(tokenId, g.speed, g.accuracy);
        }
        emit MatchRecorded(tokenId, won);
    }

    function getGenome(uint256 tokenId) external view returns (Genome memory) {
        return genomes[tokenId];
    }
}
