"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { baseSepolia } from "wagmi/chains";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== baseSepolia.id;

  if (isConnected && address) {
    return (
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className={`badge ${isWrongNetwork ? "badge-muted" : "badge-success"}`}>
            {isWrongNetwork ? "Wrong Network" : "Connected"}
          </div>
          <p style={{ marginTop: "0.4rem", fontSize: "0.8rem", fontFamily: "monospace" }}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {isWrongNetwork && (
            <button
              className="btn-primary"
              style={{ width: "auto" }}
              disabled={isSwitching}
              onClick={() => switchChain({ chainId: baseSepolia.id })}
            >
              {isSwitching ? "Switching..." : "Switch to Base Sepolia"}
            </button>
          )}
          <button className="btn-secondary" style={{ width: "auto" }} onClick={() => disconnect()}>
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      className="btn-primary"
      disabled={isPending}
      onClick={() => connect({ connector: injected(), chainId: baseSepolia.id })}
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
