// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title rideTheBet
 * @notice This version fixes a critical issue with using strings as public mapping keys,
 * ensuring compatibility with real EVM networks like Chiliz Spicy Testnet.
 * It uses keccak256 hashes for name registration.
 */
contract rideTheBet is Ownable, ReentrancyGuard {

    // --- State Variables ---
    uint256 public minimumInfluencerStake;
    Bet[] public bets;

    // CORRECTED MAPPINGS
    // This mapping stores the HASH of the name to the influencer's address.
    // It is NOT public to avoid the getter issue. We will write our own getter.
    mapping(bytes32 => address) private _registeredNameHashes;

    // This mapping stores the address to the name for easy reverse lookup.
    mapping(address => string) public influencerNames;

    // ... (rest of your structs and mappings are fine)
    struct BetIdentifier {
        uint256 matchId;
        uint8 betTypeId;
    }
    struct Bet {
        address influencer;
        address tokenAddress;
        uint256 influencerStake;
        uint256 upvotePoolTotal;
        uint256 downvotePoolTotal;
        uint256 resolutionTimestamp;
        bool isResolved;
        bool influencerWasRight;
    }
    mapping(uint256 => BetIdentifier) public betIdentifiers;
    mapping(uint256 => mapping(address => uint256)) public upvoterStakes;
    mapping(uint256 => mapping(address => uint256)) public downvoterStakes;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // --- Events ---
    event InfluencerRegistered(address indexed influencer, string name);
    // ... (rest of your events are fine)
    event BetCreated(uint256 indexed betId, address indexed influencer, uint256 matchId, uint8 betTypeId, uint256 resolutionTimestamp);
    event Voted(uint256 indexed betId, address indexed user, uint256 amount, bool isUpvote);
    event BetResolved(uint256 indexed betId, bool influencerWasRight);
    event WinningsClaimed(uint256 indexed betId, address indexed user, uint256 totalPayout);


    constructor(uint256 _initialMinimumStake, address initialOwner) Ownable(initialOwner) {
        minimumInfluencerStake = _initialMinimumStake;
    }

    // --- Public & External Functions ---

    /**
     * @notice Registers a unique influencer name.
     * @dev This function now uses a keccak256 hash of the name to prevent EVM errors
     * and ensure gas-efficient lookups.
     */
    function registerInfluencer(string memory _name) external {
        require(bytes(_name).length > 0, "Name cannot be empty");

        bytes32 nameHash = keccak256(abi.encodePacked(_name));

        require(_registeredNameHashes[nameHash] == address(0), "Name is already taken");
        require(bytes(influencerNames[msg.sender]).length == 0, "Address has already registered a name");

        _registeredNameHashes[nameHash] = msg.sender;
        influencerNames[msg.sender] = _name;

        emit InfluencerRegistered(msg.sender, _name);
    }

    /**
     * @notice A public getter to check which address has registered a name.
     * @return The address of the owner, or the zero address if not registered.
     */
    function getAddressForName(string memory _name) public view returns (address) {
        bytes32 nameHash = keccak256(abi.encodePacked(_name));
        return _registeredNameHashes[nameHash];
    }

    // --- PASTE THE REST OF YOUR WORKING FUNCTIONS HERE ---
    // (createBet, upvote, downvote, claimWinnings, resolveBet, etc.)
    // They do not need to be changed.
    function createBet(
        uint256 _matchId,
        uint8 _betTypeId,
        address _tokenAddress,
        uint256 _influencerStake,
        uint256 _resolutionTimestamp
    ) external nonReentrant {
        require(_influencerStake >= minimumInfluencerStake, "Stake is below minimum");
        require(_tokenAddress != address(0), "Token address cannot be zero");
        require(_resolutionTimestamp > block.timestamp, "Resolution time must be in the future");

        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _influencerStake);

        uint256 betId = bets.length;
        upvoterStakes[betId][msg.sender] = _influencerStake;

        betIdentifiers[betId] = BetIdentifier(_matchId, _betTypeId);

        bets.push(Bet({
            influencer: msg.sender,
            tokenAddress: _tokenAddress,
            influencerStake: _influencerStake,
            upvotePoolTotal: _influencerStake,
            downvotePoolTotal: 0,
            resolutionTimestamp: _resolutionTimestamp,
            isResolved: false,
            influencerWasRight: false
        }));

        emit BetCreated(betId, msg.sender, _matchId, _betTypeId, _resolutionTimestamp);
        emit Voted(betId, msg.sender, _influencerStake, true);
    }

    function upvote(uint256 _betId, uint256 _amount) external nonReentrant {
        _vote(_betId, _amount, true);
    }

    function downvote(uint256 _betId, uint256 _amount) external nonReentrant {
        _vote(_betId, _amount, false);
    }

    function claimWinnings(uint256 _betId) external nonReentrant {
        require(_betId < bets.length, "Bet does not exist");
        require(bets[_betId].isResolved, "Bet is not yet resolved");
        require(!hasClaimed[_betId][msg.sender], "Winnings already claimed");

        uint256 userUpvoteStake = upvoterStakes[_betId][msg.sender];
        uint256 userDownvoteStake = downvoterStakes[_betId][msg.sender];
        require(userUpvoteStake > 0 || userDownvoteStake > 0, "You did not participate");

        hasClaimed[_betId][msg.sender] = true;
        uint256 payout = 0;

        Bet memory bet = bets[_betId];

        if (bet.influencerWasRight) {
            if (userUpvoteStake > 0 && bet.upvotePoolTotal > 0) {
                uint256 winnings = (userUpvoteStake * bet.downvotePoolTotal) / bet.upvotePoolTotal;
                payout = userUpvoteStake + winnings;
            }
        } else {
            if (userDownvoteStake > 0 && bet.downvotePoolTotal > 0) {
                uint256 winnings = (userDownvoteStake * bet.upvotePoolTotal) / bet.downvotePoolTotal;
                payout = userDownvoteStake + winnings;
            }
        }

        if (payout > 0) {
            IERC20(bet.tokenAddress).transfer(msg.sender, payout);
        }

        emit WinningsClaimed(_betId, msg.sender, payout);
    }


    function resolveBet(uint256 _betId, bool _wasInfluencerRight) external onlyOwner {
        require(_betId < bets.length, "Bet does not exist");
        Bet storage bet = bets[_betId];
        require(!bet.isResolved, "Bet is already resolved");
        bet.isResolved = true;
        bet.influencerWasRight = _wasInfluencerRight;
        emit BetResolved(_betId, _wasInfluencerRight);
    }

    function _vote(uint256 _betId, uint256 _amount, bool _isUpvote) internal {
        require(_betId < bets.length, "Bet does not exist");
        require(_amount > 0, "Stake amount must be positive");
        Bet storage bet = bets[_betId];
        require(!bet.isResolved, "Bet is already resolved");
        require(block.timestamp < bet.resolutionTimestamp, "Voting period has ended");
        require(upvoterStakes[_betId][msg.sender] == 0 && downvoterStakes[_betId][msg.sender] == 0, "You have already voted");

        IERC20(bet.tokenAddress).transferFrom(msg.sender, address(this), _amount);

        if (_isUpvote) {
            upvoterStakes[_betId][msg.sender] = _amount;
            bet.upvotePoolTotal += _amount;
        } else {
            downvoterStakes[_betId][msg.sender] = _amount;
            bet.downvotePoolTotal += _amount;
        }
        emit Voted(_betId, msg.sender, _amount, _isUpvote);
    }
    
    function setMinimumStake(uint256 _newAmount) external onlyOwner {
        minimumInfluencerStake = _newAmount;
    }

    function getBetCount() external view returns (uint256) {
        return bets.length;
    }

}
