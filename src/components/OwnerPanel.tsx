"use client";

import { useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { baseSepolia as viemBaseSepolia } from "viem/chains";
import { createCofheClient, createCofheConfig } from "@cofhe/sdk/web";
import { FheTypes } from "@cofhe/sdk";
import { baseSepolia } from "@cofhe/sdk/chains";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract";

export function OwnerPanel({
  owner,
  ratingCount,
}: {
  owner: string;
  ratingCount: number;
}) {
  const { address } = useAccount();
  const wagmiPublicClient = usePublicClient();
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOwner = address?.toLowerCase() === owner?.toLowerCase();
  if (!isOwner) return null;

  async function revealAverage() {
    if (!address || !window.ethereum) return;

    try {
      setLoading(true);
      setError("");

      const pc = createPublicClient({ chain: viemBaseSepolia, transport: http() });
      const wc = createWalletClient({
        chain: viemBaseSepolia,
        transport: custom(window.ethereum),
        account: address,
      });

      const config = createCofheConfig({ supportedChains: [baseSepolia], fheKeyStorage: null });
      const cofhe = createCofheClient(config);
      await cofhe.connect(pc as any, wc as any);

      // Get the ciphertext handle from the contract
      const handle = await pc.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getTotalHandle",
        account: address,
      });

      // Decrypt via Threshold Network using permit
      // bytes32 → bigint for decryptForView
      const handleBigInt = BigInt(handle as string);
      const unsealed = await cofhe
        .decryptForView(handleBigInt, FheTypes.Uint32)
        .withPermit()
        .execute();

      const total = Number(unsealed);
      const avg = ratingCount > 0 ? total / ratingCount : 0;
      setAverage(Math.round(avg * 10) / 10);
    } catch (err: any) {
      setError(err?.message || "Failed to decrypt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ borderColor: "#7c3aed55" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Owner Panel</h2>
        <div className="badge badge-muted">Only you see this</div>
      </div>

      <div className="stat">
        <span>Total ratings</span>
        <span className="stat-value">{ratingCount}</span>
      </div>

      {average !== null && (
        <div className="average-display" style={{ margin: "1rem 0" }}>
          <div className="average-number">{average}</div>
          <div className="average-label">/ 5 stars average</div>
          <div style={{ fontSize: "1.5rem", marginTop: "0.25rem" }}>
            {"★".repeat(Math.round(average))}
            {"☆".repeat(5 - Math.round(average))}
          </div>
        </div>
      )}

      <button
        className="btn-primary"
        onClick={revealAverage}
        disabled={loading || ratingCount === 0}
        style={{ marginTop: "0.5rem" }}
      >
        {loading
          ? "Decrypting..."
          : average !== null
          ? "Refresh average"
          : "Reveal average"}
      </button>

      {error && <div className="msg msg-error">{error}</div>}
    </div>
  );
}
