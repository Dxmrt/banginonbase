'use client';

import { useAccount, useConnect } from 'wagmi';

export function FarcasterWallet() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  // Si está conectado, mostrar la dirección de la wallet
  if (isConnected && address) {
    return (
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-3 sm:p-4 border border-cyan-500/30">
        <div className="text-center">
          <p className="text-cyan-400 font-bold mb-1">🔗 {address.slice(0, 6)}...{address.slice(-4)}</p>
          <p className="text-gray-300 text-sm font-mono">Connected</p>
        </div>
      </div>
    );
  }

  // Si no está conectado, mostrar botón de conexión
  return (
    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-3 sm:p-4 border border-cyan-500/30">
      <div className="text-center">
        <button
          onClick={() => connect({ connector: connectors[0] })}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold px-6 py-2 rounded-lg transition-colors"
        >
          🔐 Connect Wallet
        </button>
        <p className="text-gray-300 text-sm mt-2">Connect to start playing</p>
      </div>
    </div>
  );
}
