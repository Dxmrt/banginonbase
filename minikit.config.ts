const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Mirrors farcaster.json manifest.
 * Keep this in sync with public/.well-known/farcaster.json
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjExMDE1ODIsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgzZjlCODczYUM0MUUzMzA1NGU2YUY1NTIyMWFBMGU1YUZmOGQ3MkVDIn0",
    payload: "eyJkb21haW4iOiJiYW5naW5vbmJhc2UudmVyY2VsLmFwcCJ9",
    signature:
      "0szyKzRq2LdtCxr3HUpbbgen7TcogoUfdq01vhCOLVg7cHahkipXjNgEaf0DFdJwyMCLm9uKDOdBhdyGup940Bs=",
  },
  baseBuilder: {
     ownerAddress: "0xEB94358F4A8932Eed925CBc1d39132A573Dd34E2"
  },
  miniapp: {
    // === frame fields ===
    version: "1",
    name: "Bangin' on Base",
    subtitle: "Play. Guess. Bang on Base.",
    description: "Guess the song, earn points and compete with your friends!",
    iconUrl: `${ROOT_URL}/icon.png`,
    homeUrl: ROOT_URL,
    imageUrl: `${ROOT_URL}/og.png`,
    buttonTitle: "Launch Bangin' on Base!",
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    webhookUrl: `${ROOT_URL}/api/webhook`,
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    primaryCategory: "games",
    tags: ["music", "quiz", "base", "game"],
    heroImageUrl: `${ROOT_URL}/og.png`,
    tagline: "Play. Guess. Bang on Base.",
    ogTitle: "Bangin' on Base",
    ogDescription:
      "Guess the daily song, earn onchain points, and climb the leaderboard!",
    ogImageUrl: `${ROOT_URL}/og.png`,

   
    requiredChains: ["eip155:84532"], 

    noindex: false,
  },
} as const;
