import { useAccount, useBalance } from 'wagmi';
import { useReadContracts } from 'wagmi';
import { TOKENS, TOKEN_LIST } from '@/config/contracts';
import { formatUnits } from 'viem';

const ERC20_BALANCE_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function useWalletPortfolio() {
  const { address, isConnected } = useAccount();

  const { data: nativeBalance } = useBalance({ address });

  const tokenAddresses = Object.values(TOKENS);

  const { data: tokenBalances } = useReadContracts({
    contracts: address
      ? tokenAddresses.map((addr) => ({
          address: addr as `0x${string}`,
          abi: ERC20_BALANCE_ABI,
          functionName: 'balanceOf',
          args: [address],
        }))
      : [],
    query: { enabled: !!address, refetchInterval: 15000 },
  });

  const getPortfolioSummary = (): string => {
    if (!isConnected || !address) return 'Wallet not connected';

    const lines: string[] = [`Wallet: ${address}`];

    // Native OPN
    if (nativeBalance) {
      const opnBal = parseFloat(formatUnits(nativeBalance.value, 18));
      lines.push(`OPN (native): ${opnBal.toFixed(4)}`);
    }

    // ERC20 tokens
    const symbols = Object.keys(TOKENS);
    if (tokenBalances) {
      tokenBalances.forEach((result, i) => {
        if (result.status === 'success' && result.result) {
          const bal = parseFloat(formatUnits(result.result as bigint, 18));
          if (bal > 0) {
            lines.push(`${symbols[i]}: ${bal.toFixed(4)}`);
          }
        }
      });
    }

    return lines.join('\n');
  };

  return { isConnected, address, getPortfolioSummary };
}
