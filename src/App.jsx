import { ethers } from "ethers";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useState, useEffect, useMemo } from "react";
import { useWeb3 } from "@3rdweb/hooks";

//We instatiate the sdk on rinkeby
const sdk = new ThirdwebSDK("rinkeby");

//We can grab a reference to our ERC-1155 contract
const bundleDropModule = sdk.getBundleDropModule(
  "0xEb779600eD41819764691153D4c2BD0dB5cB3b5d"
);

//Reference to ERC-20 contract
const tokenModule = sdk.getTokenModule(
  "0x665B8DD84eaB88Db0a9fD12c546B226B4Eef52a7"
);

const voteModule = sdk.getVoteModule(
  "0xD6b84446c4b62527315Feb381959f0a0912B3A54"
);

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address);

  //The signer is required to sign transactions on the blockchain
  //Without it we can only read data, not write
  const signer = provider ? provider.getSigner() : undefined;

  //State variable for us to know if the user has my nft
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  //state isClaiming lets us keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  //Holds the amount of token each member has in state
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});

  //The array holding all members addresses
  const [memberAddresses, setMemberAddresses] = useState([]);

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // A simple call to voteModule.getAll() to grab the proposals.
    voteModule
      .getAll()
      .then((proposals) => {
        // Set state!
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      })
      .catch((err) => {
        console.error("failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  // We also need to check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }

    // Check if the user has already voted on the first proposal.
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        console.log("🥵 User has already voted");
      })
      .catch((err) => {
        console.error("failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

  //A function to shorten wallet address displayed
  const shortenAddresses = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  //This useEffect grabs all the addresses of our members holding our NFT
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    //Grabbing the users who use our NFTS with tokenIds "0"
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresses) => {
        console.log("🚀 Members addresses", addresses);
        setMemberAddresses(addresses);
      })
      .catch((err) => {
        console.err("failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  //This useEffect grabs the number token each member holds
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    //Grab all the balances
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts", amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  //Now we combine the memberAddresses and memberTokenamounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          //if the address is not in memberTokensAmount it means they dont hold any of our token
          memberTokenAmounts[address] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  //Another useEffect
  useEffect(() => {
    //We pass the signer to the sdk which enables us interact with our deployed contract.
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    //if they dont have a connected wallet, exit!
    if (!address) {
      return;
    }

    //check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        //if balance is greater than zero then they have our NFT
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      });
  }, [address]);

  if (error && error.name === "UnsupportedChainIdError") {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks in
          your connected wallet.
        </p>
      </div>
    );
  }

  // if user hasn't connected their wallet to my webapp.
  // let them call connectWallet.
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to FootballDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  // If the user has alraedy claimed their NFT, we want to display the internal DAO page to them.
  //only DAO members will see this. Render all the members + token amounts.
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>🍪FootballDAO Member Page</h1>
        <p className="text-xl">Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddresses(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                //lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,

                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "_" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                //first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);

                  //if the delegation is the 0x0 address that means they have not delegated their governance tokens
                  if (delegation === ethers.constants.AddressZero) {
                    //if they havent delegated their token yet,we'll have them delegate them
                    await tokenModule.delegateTO(address);
                  }
                  //then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        //before voting we first need to check whether the proposal is open for voting
                        //we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);

                        //then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          //if it is open for voting we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        //if the proposal is not open for voting we just return nothing
                        return;
                      })
                    );
                    try {
                      //if any of the proposals are ready to be executed, we'll execute them
                      //a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          //we'll first get the latest state of the proposal again, since we may have well voted again
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      //if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      //and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  //in either case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                  ? "You Already Voted"
                  : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const mintNft = () => {
    setIsClaiming(true);
    //call bundleDropModule.claim("0", 1) to mint NFT to user's wallet
    bundleDropModule
      .claim("0", 1)
      .catch((err) => {
        console.error("failed to claim", err);
        setIsClaiming(false);
      })
      .finally(() => {
        //stop loading state
        setIsClaiming(false);
        //set claim state
        setHasClaimedNFT(true);
        //show user their new minted nft
        console.log(
          `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
        );
      });
  };

  //Render mint nft screen
  return (
    <div className="mint-nft">
      <h1>Mint your free 🍪DAO Membership NFT</h1>
      <button disabled={isClaiming} onClick={() => mintNft()}>
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );

  // if we have the user's address then we call this.
  // return (
  //   <div className="landing">
  //     <h1>👀 wallet connected, now what!</h1>
  //   </div>
  // );
};

export default App;
