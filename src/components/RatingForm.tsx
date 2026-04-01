"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { baseSepolia as viemBaseSepolia } from "viem/chains";
import { createCofheClient, createCofheConfig } from "@cofhe/sdk/web";
import { Encryptable, EncryptStep } from "@cofhe/sdk";
import { baseSepolia } from "@cofhe/sdk/chains";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract";

export function RatingForm({ hasRated }: { hasRated: boolean }) {
  const { address, isConnected } = useAccount();
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [status, setStatus] = useState<"idle" | "encrypting" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { writeContractAsync } = useWriteContract();

  async function handleSubmit() {
    if (!address || selected === 0) {
      setStatus("error");
      setErrorMsg("Please select a rating first.");
      return;
    }

    if (!window.ethereum) {
      setStatus("error");
      setErrorMsg("MetaMask not found.");
      return;
    }

    try {
      setStatus("encrypting");
      setErrorMsg("");

      // Create viem clients directly from window.ethereum
      const pc = createPublicClient({ chain: viemBaseSepolia, transport: http() });
      const wc = createWalletClient({
        chain: viemBaseSepolia,
        transport: custom(window.ethereum),
        account: address,
      });

      const config = createCofheConfig({ supportedChains: [baseSepolia], fheKeyStorage: null });
      const cofhe = createCofheClient(config);
      await cofhe.connect(pc as any, wc as any);

      // Encrypt the rating (1-5)
      const [encryptedRating] = await cofhe
        .encryptInputs([Encryptable.uint8(BigInt(selected))])
        .execute();

      setStatus("submitting");

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "submitRating",
        args: [encryptedRating as any],
      });

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.shortMessage || err?.message || "Transaction failed");
    }
  }

  if (!isConnected) {
    return (
      <div className="card">
        <p style={{ textAlign: "center" }}>Connect your wallet to rate.</p>
      </div>
    );
  }

  if (hasRated) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div className="badge badge-success" style={{ margin: "0 auto" }}>
          Already rated
        </div>
        <p style={{ marginTop: "0.75rem" }}>You already submitted your rating. Thank you!</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem" }}>🎉</div>
        <h2 style={{ marginTop: "0.5rem" }}>Rating submitted!</h2>
        <p>Your encrypted rating was added anonymously.</p>
      </div>
    );
  }

  const isLoading = status === "encrypting" || status === "submitting";
  const display = hovered || selected;

  return (
    <div className="card">
      <h2>Submit your rating</h2>
      <p>Your rating is encrypted — no one can see what you chose.</p>

      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star ${display >= star ? "active" : ""}`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(star)}
            disabled={isLoading}
          >
            ★
          </button>
        ))}
      </div>

      {selected > 0 && (
        <p style={{ textAlign: "center", marginBottom: "1rem" }}>
          {selected} star{selected > 1 ? "s" : ""} selected
        </p>
      )}

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={selected === 0 || isLoading}
      >
        {status === "encrypting"
          ? "Encrypting..."
          : status === "submitting"
          ? "Submitting..."
          : "Submit (encrypted)"}
      </button>

      <div className="lock-icon">
        Your rating is encrypted with FHE before leaving your device
      </div>

      {status === "error" && <div className="msg msg-error">{errorMsg}</div>}
    </div>
  );
}
