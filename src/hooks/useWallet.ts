import { useAccount, useBalance, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { opnTestnet } from '@/config/wagmi';

export function useWallet() {
  const { address, isConnected, isConnecting, connector } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { data: balance } = useBalance({
    address: address,
  });

  const isCorrectNetwork = chainId === opnTestnet.id;

  const switchToOPN = () => {
    if (switchChain) {
      switchChain({ chainId: opnTestnet.id });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isPending,
    connector,
    connectors,
    connect,
    disconnect,
    error,
    balance,
    chainId,
    isCorrectNetwork,
    switchToOPN,
    formatAddress,
  };
}
