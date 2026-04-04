export const GATEWAY_ADDRESS = "0xC5E455719175f4fED9A8E3A910Bcfd0264AD33D2";
export const VOTING_ADDRESS = "0xC5E455719175f4fED9A8E3A910Bcfd0264AD33D2";

// Basic ABI needed for demo
export const PRIVATE_VOTING_ABI = [
  "function createProposal(uint256 proposalId) external",
  "function castVote(uint256 proposalId, bytes calldata encryptedVote, bool voteChoice) external",
  "function requestTallyReveal(uint256 proposalId) external",
  "function getProposalStatus(uint256 proposalId) external view returns (bool active, bool revealed, uint32 yesVotes, uint32 noVotes)"
] as const;
