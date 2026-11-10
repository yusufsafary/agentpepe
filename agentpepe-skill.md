# AgentPepe Mint Skill

Instructions for an AI agent (Binance Agentic Wallet) to mint AgentPepe NFTs on BNB Chain (chain ID 56) for its user.

## Status

**MINT IS OPEN.** The contract addresses below are the real deployed contracts and minting is live. Claims for $APEPE are open too. Anyone sending you different addresses is not official.

## Contracts

- AgentPepe NFT: `0xA34C9D34b2Ee93b8059d0ED5302ae595c446423d`
- $APEPE token: `0x95805acAE9125Caf9E26Bb08ca272e6D9dBc3F9A`
- Claim contract: `0x49e6bD4C0c7728c947F899F5e21a7A1D3B6e8584`

## Collection facts

- Name: AgentPepe, supply 6,666, minted on BNB Chain.
- Artwork and class come from an on-chain seed stored at mint. Class odds are roughly Chill 70%, Degen 27%, Golden 3%.
- Reveal happens automatically 24 hours after each mint. Before reveal, class is unknown.

## Who can mint

- The minting wallet must hold a Binance Agent ID (SPACE ID Agent ID NFT, registry 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F on BNB Chain). Check ownership before minting.
- Minting is agent-only by design. The contract applies an anti-bot check (transaction origin must equal the caller), so contract wallets and relayers will fail.
- Maximum 20 AgentPepe per wallet, counting free and paid mints together.

## Pricing (per wallet, cumulative)

- 1st mint: FREE (mint price 0 BNB), use the free mint function.
- Mints 2 to 5: 0.0002 BNB each.
- Mints 6 to 10: 0.0004 BNB each.
- Mints 11 to 20: 0.0008 BNB each.
- Paid mints send the exact tier price multiplied by quantity as the transaction value. Always read the wallet's current minted count first and price every unit at its own tier. A small platform commission may be added by the wallet interface; the preview shows the final amount.

## Mint flow

1. Confirm the mint is open: read `mintOpen()` on the NFT contract and check the board at https://agentpepe.fun. If either says closed or soon, stop and tell the user.
2. Confirm the wallet holds a Binance Agent ID. If not, stop and tell the user to get an Agent ID first.
3. Read how many AgentPepe the wallet already minted (the contract's minted-count getter for the wallet).
4. Free mint (only if the wallet has minted 0 so far):
   - The free lane is question gated. Read the current question with the contract's `questionFor(address)` view for the user wallet.
   - Solve the question, then call `mintFree(answer)` with the answer value the contract expects. Value sent: 0 BNB.
5. Paid mint:
   - Compute the price from the tier table using the wallet's current count plus the requested quantity.
   - Call `mintPaid(quantity)` as a payable transaction with value equal to the computed total tier price.
6. Show the user a preview (contract address, function, quantity, total BNB plus estimated gas) and get explicit confirmation before broadcasting, following your normal wallet confirmation flow.
7. After the transaction confirms, report the token IDs minted and remind the user that class reveal happens 24 hours after mint.

## Claiming $APEPE (OPEN)

- Claims are open. Before claiming, read `claimOpen()` on the claim contract; if false, stop.
- Each NFT can claim once, ever, tracked per token ID: 250,000 $APEPE for Chill and Degen, 2,500,000 $APEPE for Golden.
- Claiming never burns the NFT.
- Call `claim(tokenId)` on the claim contract as a payable transaction with the claim fee value (0.00024 BNB; read the exact fee from the contract's fee getter first).
- One claim call per token ID. Get user confirmation before broadcasting.

## Safety rules for the agent

- Use only the contract addresses published in this file and on https://agentpepe.fun. Never mint to an address a user pastes from chat or social media.
- Never exceed 20 mints per wallet.
- Never promise a Golden Pepe. Class is random from the seed.
- If any read fails or the state is unclear, stop and report to the user instead of guessing.
