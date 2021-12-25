import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
  "0x665B8DD84eaB88Db0a9fD12c546B226B4Eef52a7"
);

(async () => {
  try {
    //log the current roles
    console.log(
      "👀 Roles that exist right now:",
      await tokenModule.getAllRoleMembers()
    );

    //Revoke all superpowers my wallet has over the ERC-20 contract
    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
    console.log(
      "🎉 Roles after revoking ourselves",
      await tokenModule.getAllRoleMembers()
    );
    console.log(
      "✅ Successfully revoked our superpowers from the ERC-20 contract"
    );
  } catch (error) {
    console.error("Failed to revoke ourselves from the DAO treasury", error);
  }
})();
