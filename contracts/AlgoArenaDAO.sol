// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract AlgoArenaDAO {
    address public owner;
    IERC20 public stakingToken;

    struct Tournament {
        uint256 id;
        string name;
        uint256 prizePool;
        address winner;
        bool isCompleted;
    }

    uint256 public tournamentCount;
    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => mapping(address => uint256)) public userStakes;

    event TournamentCreated(uint256 indexed id, string name, uint256 initialPrize);
    event StakePlaced(uint256 indexed tournamentId, address indexed user, uint256 amount);
    event TournamentCompleted(uint256 indexed tournamentId, address indexed winner, uint256 totalPayout);

    constructor(address _stakingToken) {
        owner = msg.sender;
        stakingToken = IERC20(_stakingToken);
    }

    function createTournament(string calldata name, uint256 initialPrize) external returns (uint256) {
        tournamentCount++;
        tournaments[tournamentCount] = Tournament({
            id: tournamentCount,
            name: name,
            prizePool: initialPrize,
            winner: address(0),
            isCompleted: false
        });

        if (initialPrize > 0) {
            require(stakingToken.transferFrom(msg.sender, address(this), initialPrize), "Deposit failed");
        }

        emit TournamentCreated(tournamentCount, name, initialPrize);
        return tournamentCount;
    }

    function placeStake(uint256 tournamentId, uint256 amount) external {
        Tournament storage tourney = tournaments[tournamentId];
        require(!tourney.isCompleted, "Tournament completed");
        require(amount > 0, "Amount must be > 0");

        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Stake failed");
        userStakes[tournamentId][msg.sender] += amount;
        tourney.prizePool += amount;

        emit StakePlaced(tournamentId, msg.sender, amount);
    }

    function finalizeTournament(uint256 tournamentId, address winner) external {
        require(msg.sender == owner, "Only owner");
        Tournament storage tourney = tournaments[tournamentId];
        require(!tourney.isCompleted, "Already completed");

        tourney.winner = winner;
        tourney.isCompleted = true;

        uint256 payout = tourney.prizePool;
        require(stakingToken.transfer(winner, payout), "Transfer failed");

        emit TournamentCompleted(tournamentId, winner, payout);
    }
}
