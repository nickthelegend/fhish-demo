export const GATEWAY_ADDRESS = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
export const VOTING_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

// ABI for PrivateVotingV2 (from Phase 3)
export const PRIVATE_VOTING_ABI = [
  "function vote(bytes32 handleA, bytes calldata proofA, bytes32 handleB, bytes calldata proofB) external",
  "function tallyOptionA() external view returns (uint256)",
  "function tallyOptionB() external view returns (uint256)",
  "function getProposalStatus(uint256 proposalId) external view returns (bool active, bool revealed, uint32 yesVotes, uint32 noVotes)",
  "function requestTallyReveal(uint256 proposalId) external",
  "event VoteCast(address indexed voter)"
] as const;
