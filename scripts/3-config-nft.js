import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0xEb779600eD41819764691153D4c2BD0dB5cB3b5d"
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Club Jersey",
        description: "This NFT will give you access to FootballDAO!",
        image: readFileSync("scripts/assets/ball.jpg"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();
