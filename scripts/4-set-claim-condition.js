import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0xEb779600eD41819764691153D4c2BD0dB5cB3b5d"
);

(async () => {
  try {
    const claimCoinditionFactory = bundleDrop.getClaimConditionFactory();
    //Specify conditions
    claimCoinditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 50_000,
      maxQuantityPerTransaction: 1,
    });

    await bundleDrop.setClaimCondition(0, claimCoinditionFactory);
    console.log("✅ Sucessfully set claim condition!");
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }
})();
