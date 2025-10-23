import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { Providers } from "./providers";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Bangin' on Base",
    description: "Daily music quiz on Base",
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: "/og.png",
        button: {
          title: "Launch Bangin' on Base",
          action: {
            name: "Launch Bangin' on Base",
            type: "launch_miniapp",
          },
        },
      }),
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceCodePro.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}