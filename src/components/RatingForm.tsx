import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { baseSepolia as viemBaseSepolia } from "viem/chains";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { Lock, ShieldCheck, Loader2, CheckCircle2, Star } from "lucide-react";

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

      const pc = createPublicClient({ chain: viemBaseSepolia, transport: http() });
      const wc = createWalletClient({
        chain: viemBaseSepolia,
        transport: custom(window.ethereum),
        account: address,
      });

      const { createCofheClient, createCofheConfig } = await import("@cofhe/sdk/web");
      const { Encryptable } = await import("@cofhe/sdk");
      const { baseSepolia } = await import("@cofhe/sdk/chains");

      const config = createCofheConfig({ supportedChains: [baseSepolia], fheKeyStorage: null });
      const cofhe = createCofheClient(config);
      await cofhe.connect(pc as any, wc as any);

      const [encryptedRating] = await cofhe
        .encryptInputs([Encryptable.uint8(BigInt(selected))])
        .execute();

      setStatus("submitting");

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "submitRating",
        args: [encryptedRating as any],
        chain: viemBaseSepolia,
        account: address,
      } as any);

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.shortMessage || err?.message || "Transaction failed");
    }
  }

  if (!isConnected) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Connect your wallet to rate.</p>
      </div>
    );
  }

  if (hasRated) {
    return (
      <div className="glass rounded-xl p-8 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-primary mx-auto" />
        <h3 className="text-lg font-heading font-semibold">Already rated</h3>
        <p className="text-sm text-muted-foreground">
          You already submitted your encrypted rating. Thank you!
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="glass rounded-xl p-8 text-center space-y-4 glow-primary">
        <div className="text-5xl animate-float">🎉</div>
        <h3 className="text-xl font-heading font-bold text-primary">Rating submitted!</h3>
        <p className="text-sm text-muted-foreground">
          Your encrypted rating was added anonymously.
        </p>
      </div>
    );
  }

  const isLoading = status === "encrypting" || status === "submitting";
  const display = hovered || selected;

  return (
    <div className="glass rounded-xl p-8 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-heading font-bold">Submit your rating</h3>
        <p className="text-sm text-muted-foreground">
          Your rating is encrypted — no one can see what you chose.
        </p>
      </div>

      {/* Star selector */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(star)}
            disabled={isLoading}
            className="group transition-all duration-200 disabled:opacity-50"
          >
            <Star
              className={`w-10 h-10 transition-all duration-200 ${
                display >= star
                  ? "fill-star text-star glow-star drop-shadow-lg scale-110"
                  : "text-muted-foreground/40 hover:text-muted-foreground/60"
              }`}
            />
          </button>
        ))}
      </div>

      {selected > 0 && (
        <p className="text-center text-sm font-medium text-star">
          {selected} star{selected > 1 ? "s" : ""} selected
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={selected === 0 || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all glow-primary disabled:opacity-40 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {status === "encrypting" ? "Encrypting..." : "Submitting..."}
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            Submit (encrypted)
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" />
        Your rating is encrypted with FHE before leaving your device
      </p>

      {status === "error" && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
