import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const app = sdk.getAppModule("0xf47f3b01888fE94Ba6Feb78553D1a6B14a5C7381");

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      //The collection's name
      name: "FootballDAO Membership",

      //A description for the collection
      description: "A DAO for football fans",

      //The image for the collection that will show up on OpenSea
      image: readFileSync("scripts/assets/goats.jpg"),

      //I need to pass in the address of the person that will be receiving the proceeds from sales of nfts in the module.
      //If i do not want to charge for the drop i should pass in the 0x0 address
      //if i want to charge for the drop, i should pass in my own address
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });

    console.log(
      "✅ Successfully deployed bundleDrop module, address:",
      bundleDropModule.address
    );
    console.log(
      "✅ bundleDrop metadata:",
      await bundleDropModule.getMetadata()
    );
  } catch (error) {
    console.log("failed to deploy bundleDrop module", error);
  }
})();
