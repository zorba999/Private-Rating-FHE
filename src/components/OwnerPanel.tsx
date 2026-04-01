import { useState } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { baseSepolia as viemBaseSepolia } from "viem/chains";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { Eye, Loader2, Crown, Star } from "lucide-react";

export function OwnerPanel({
  owner,
  ratingCount,
}: {
  owner: string;
  ratingCount: number;
}) {
  const { address } = useAccount();
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

      const { createCofheClient, createCofheConfig } = await import("@cofhe/sdk/web");
      const { FheTypes } = await import("@cofhe/sdk");
      const { baseSepolia } = await import("@cofhe/sdk/chains");

      const config = createCofheConfig({ supportedChains: [baseSepolia], fheKeyStorage: null });
      const cofhe = createCofheClient(config);
      await cofhe.connect(pc as any, wc as any);

      const handle = await (pc as any).readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getTotalHandle",
        account: address,
      });

      const handleBigInt = BigInt(handle as string);

      // Generate or retrieve an existing self-permit (triggers wallet signature if new)
      const permit = await cofhe.permits.getOrCreateSelfPermit();

      const unsealed = await cofhe
        .decryptForView(handleBigInt, FheTypes.Uint32)
        .setPermit(permit)
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
    <div className="glass rounded-xl p-8 space-y-5 border-accent/30 glow-accent">
      <div className="flex items-center gap-2">
        <Crown className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-heading font-bold">Owner Panel</h3>
        <span className="ml-auto text-xs font-mono text-accent/70 bg-accent/10 px-2 py-0.5 rounded-full">
          Only you see this
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total ratings</span>
        <span className="font-mono font-semibold">{ratingCount}</span>
      </div>

      {average !== null && (
        <div className="rounded-lg bg-accent/10 p-4 text-center space-y-2">
          <div className="text-4xl font-heading font-bold text-accent">
            {average}
          </div>
          <p className="text-sm text-muted-foreground">/ 5 stars average</p>
          <div className="flex justify-center gap-0.5 text-xl">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(average) ? "fill-star text-star" : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={revealAverage}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-accent/20 text-accent font-semibold hover:bg-accent/30 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Decrypting...
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            {average !== null ? "Refresh average" : "Reveal average"}
          </>
        )}
      </button>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
