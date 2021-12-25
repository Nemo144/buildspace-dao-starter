import sdk from "./1-initialize-sdk.js";

//Grab the appModule address
const appModule = sdk.getAppModule(
  "0xf47f3b01888fE94Ba6Feb78553D1a6B14a5C7381"
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      //Governance contract name
      name: "FootballDAO Epic Proposals",

      //The location of our governance token,our ERC-20 contract
      votingTokenAddress: "0x665B8DD84eaB88Db0a9fD12c546B226B4Eef52a7",

      //After a proposal is created, when can members start voting?
      //Setting this to immediately.
      proposalStartWaitTimeInSeconds: 0,

      //How long do members have to vote on proposals when it is created?
      //Setttings this to 48 hours(172800 seconds)
      proposalVotingTimeInSeconds: 48 * 60 * 60,

      //This shows how much token is needed to pass a proposal in the case of one person voting
      //and the proposalVotingTimeInSeconds elapses
      votingQuorumFraction: 0,

      //minimum amount of token required to create a proposal
      minimumNumberOfTokensNeededToPropose: "0",
    });

    console.log(
      "✅ Successfully deployed vote module, address:",
      voteModule.address
    );
  } catch (err) {
    console.log("Failed to deploy vote module", err);
  }
})();
