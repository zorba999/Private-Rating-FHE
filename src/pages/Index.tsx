import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { RatingForm } from "@/components/RatingForm";
import { OwnerPanel } from "@/components/OwnerPanel";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { Shield, Users, Lock, Star } from "lucide-react";

export default function Index() {
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
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
            <Shield className="w-3 h-3" />
            FHE-Encrypted Ratings
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight">
            Private{" "}
            <span className="text-gradient-primary">Rating</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto">
            Rate anonymously with{" "}
            <strong className="text-foreground">Fully Homomorphic Encryption</strong>.
            Your vote is encrypted — no one can see it.
          </p>
        </header>

        {/* Stats card */}
        {serviceName && (
          <div className="glass rounded-xl p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Service</div>
                <div className="font-heading font-semibold text-sm truncate">{serviceName as string}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" /> Voters
                </div>
                <div className="font-heading font-semibold text-sm">{ratingCount?.toString() ?? "0"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
                  <Star className="w-3 h-3" /> Average
                </div>
                <div className="font-heading font-semibold text-sm flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-primary" />
                  Encrypted
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet */}
        <ConnectWallet />

        {/* Rating form */}
        <RatingForm hasRated={!!hasRated} />

        {/* Owner panel */}
        {owner && (
          <OwnerPanel
            owner={owner as string}
            ratingCount={Number(ratingCount ?? 0)}
          />
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground space-y-1 pt-4">
          <p>
            Built with{" "}
            <a href="https://cofhe-docs.fhenix.zone/" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              Fhenix CoFHE
            </a>{" "}
            on Base Sepolia
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/50">
            {CONTRACT_ADDRESS}
          </p>
        </footer>
      </div>
    </div>
  );
}
