import sdk from "./1-initialize-sdk.js";

//To deploy the contract, we need the app module
const app = sdk.getAppModule("0xf47f3b01888fE94Ba6Feb78553D1a6B14a5C7381");

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      // What's your token's name? Ex. "Ethereum"
      name: "FootballDAO Governance Token",
      // What's your token's symbol? Ex. "ETH"
      symbol: "BALL",
    });
    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address
    );
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();
