# Private Rating FHE

A mini dapp that lets users submit **encrypted star ratings** using Fully Homomorphic Encryption (FHE). No one can see individual ratings — not even the contract owner. Only the aggregate average can be decrypted, and only by the owner.

Built with [Fhenix CoFHE](https://cofhe-docs.fhenix.zone) + Next.js.

## How it works

1. User connects MetaMask (Base Sepolia)
2. Selects a star rating (1–5)
3. Rating is **encrypted client-side** using FHE before leaving the device
4. Encrypted rating is submitted to the smart contract
5. Contract adds it to the encrypted total (FHE addition — no decryption happens)
6. Owner can decrypt the **average** via the CoFHE Threshold Network

```
User → encrypt(4) → contract.submitRating(ciphertext)
                          ↓
                   totalRating = FHE.add(totalRating, rating)  ← encrypted
                          ↓
Owner → decryptForView(handle) → Threshold Network → 4.2 ⭐
```

## Stack

| Layer | Tech |
|-------|------|
| Smart contract | Solidity 0.8.25 + `@fhenixprotocol/cofhe-contracts` |
| FHE encryption | `@cofhe/sdk` |
| Frontend | Next.js 15 + React 18 |
| Wallet | wagmi v2 + viem |
| Network | Base Sepolia (chainId 84532) |

## Contract

Deployed on Base Sepolia:
```
0x62A48598c09B10c2Befc317007aF9569482158F2
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x62A48598c09B10c2Befc317007aF9569482158F2
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), connect MetaMask on **Base Sepolia**, and submit a rating.

### 4. Deploy your own contract (optional)

```bash
# Add your private key to .env.local
PRIVATE_KEY=your_private_key_here
SERVICE_NAME=My Service

npm run deploy
```

Copy the output address to `NEXT_PUBLIC_CONTRACT_ADDRESS`.

## Deploy to Vercel

1. Push to GitHub
2. Import repo on [vercel.com/new](https://vercel.com/new)
3. Add environment variable:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS = 0x62A48598c09B10c2Befc317007aF9569482158F2
   ```
4. Deploy

## Project structure

```
├── contracts/
│   └── PrivateRating.sol      # FHE smart contract
├── scripts/
│   └── deploy.ts              # Deployment script
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main page
│   │   ├── layout.tsx
│   │   ├── providers.tsx      # Wagmi + ReactQuery
│   │   └── globals.css
│   ├── components/
│   │   ├── ConnectWallet.tsx  # Wallet connection + network check
│   │   ├── RatingForm.tsx     # FHE encryption + submit
│   │   └── OwnerPanel.tsx     # Decrypt average (owner only)
│   └── lib/
│       ├── wagmi.ts           # Chain config
│       └── contract.ts        # ABI + address
├── hardhat.config.ts
└── package.json
```

## Security

- Individual ratings are **never stored in plaintext** — not on-chain, not off-chain
- FHE operations run on encrypted data; the contract never sees the raw value
- Only the owner's address can call `getTotalHandle()` to retrieve the encrypted total
- Decryption requires a signed permit and goes through the CoFHE Threshold Network (multi-party computation)
