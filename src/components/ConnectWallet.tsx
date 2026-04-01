import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { baseSepolia } from "wagmi/chains";
import { Wallet, AlertTriangle, LogOut, CheckCircle } from "lucide-react";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== baseSepolia.id;

  if (isConnected && address) {
    return (
      <div className="glass rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isWrongNetwork ? (
              <AlertTriangle className="w-4 h-4 text-warning" />
            ) : (
              <CheckCircle className="w-4 h-4 text-primary" />
            )}
            <span className="text-sm font-medium">
              {isWrongNetwork ? "Wrong Network" : "Connected"}
            </span>
          </div>
          <code className="font-mono text-xs text-muted-foreground">
            {address.slice(0, 6)}...{address.slice(-4)}
          </code>
        </div>

        {isWrongNetwork && (
          <button
            onClick={() => switchChain({ chainId: baseSepolia.id })}
            className="w-full py-2 px-4 rounded-md bg-warning/20 text-warning text-sm font-medium hover:bg-warning/30 transition-colors"
          >
            {isSwitching ? "Switching..." : "Switch to Base Sepolia"}
          </button>
        )}

        <button
          onClick={() => disconnect()}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected(), chainId: baseSepolia.id })}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:brightness-110 transition-all glow-primary disabled:opacity-50"
    >
      <Wallet className="w-5 h-5" />
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
