"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { RatingForm } from "@/components/RatingForm";
import { OwnerPanel } from "@/components/OwnerPanel";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address } = useAccount();

  const { data: serviceName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "serviceName",
  });

  const { data: ratingCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "ratingCount",
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "owner",
  });

  const { data: hasRated } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "hasRated",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  if (!mounted) return null;

  return (
    <main className="container">
      <div className="header">
        <h1>Private Rating</h1>
        <p>
          Rate anonymously with{" "}
          <strong style={{ color: "#a855f7" }}>Fully Homomorphic Encryption</strong>
          <br />
          Your vote is encrypted — no one can see it, not even the server.
        </p>
      </div>

      <ConnectWallet />

      {serviceName && (
        <div className="card">
          <div className="stat">
            <span>Service</span>
            <span className="stat-value">{serviceName as string}</span>
          </div>
          <div className="stat">
            <span>Total voters</span>
            <span className="stat-value">{ratingCount?.toString() ?? "0"}</span>
          </div>
          <div className="stat">
            <span>Average rating</span>
            <span className="stat-value" style={{ color: "var(--muted)" }}>
              Encrypted
            </span>
          </div>
        </div>
      )}

      <RatingForm hasRated={hasRated as boolean ?? false} />

      {owner && (
        <OwnerPanel
          owner={owner as string}
          ratingCount={Number(ratingCount ?? 0)}
        />
      )}
    </main>
  );
}
