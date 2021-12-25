import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

//This is the token module address generated from 5-deploy-tokens.js
const tokenModule = sdk.getTokenModule(
  "0x665B8DD84eaB88Db0a9fD12c546B226B4Eef52a7"
);

(async () => {
  try {
    //What's the maximum supply you want to set?
    const amount = 3_000_000;

    //We use the utils function from "ethers" to convert the amount
    //to have 18 decimals which is the standard for ERC20 tokens
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);

    //Interact with your deployed ERC-20 contract and mint the tokens
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();

    //print how manyof our tokens are out there now
    console.log(
      "✅ There now is",
      ethers.utils.formatUnits(totalSupply, 18),
      "$BALLS in circulation"
    );
  } catch (error) {
    console.error("Failed to print money", error);
  }
})();
