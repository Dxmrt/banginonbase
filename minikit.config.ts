const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    allowedAddresses: [],
  },
  miniapp: {
    version: "1",
    name: "Bangin' on Base",
    subtitle: "Daily music quiz",
    description: "Guess the song, earn points. Built for Base + Farcaster.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "music",
    tags: ["music","quiz","game","base","farcaster"],
    heroImageUrl: `${ROOT_URL}/og.png`,
    tagline: "Can you guess today's track?",
    ogTitle: "Bangin' on Base",
    ogDescription: "A tiny daily music quiz for Base + Farcaster.",
    ogImageUrl: `${ROOT_URL}/og.png`,
    requiredChains: ["eip155:84532"], // Base Sepolia by default; switch to eip155:8453 for mainnet
    noindex: true,
  },
} as const;
