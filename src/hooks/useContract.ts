/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { CONTRACTS } from '@/config/contracts';

// ABIs
const ROUTER_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amountOutMin", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" }
    ],
    name: "swapExactETHForTokens",
    outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "address[]", name: "path", type: "address[]" }
    ],
    name: "getAmountsOut",
    outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  }
];

const WETH_ABI = [
  { inputs: [], name: "deposit", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "wad", type: "uint256" }], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" }
];

const FACTORY_ABI = [
  { inputs: [], name: "allPairsLength", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }
];

const ERC20_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" }
];

export function useRouter() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const swapExactETHForTokens = (
    amountOutMin: bigint, 
    path: readonly `0x${string}`[], 
    to: `0x${string}`, 
    deadline: bigint, 
    value: bigint
  ) => {
    (writeContract as any)({
      address: CONTRACTS.ROUTER,
      abi: ROUTER_ABI,
      functionName: 'swapExactETHForTokens',
      args: [amountOutMin, [...path], to, deadline],
      value,
    });
  };

  return { swapExactETHForTokens, hash, isPending, isConfirming, isSuccess, error };
}

export function useGetAmountsOut(amountIn: bigint | undefined, path: `0x${string}`[]) {
  const result = useReadContract({
    address: CONTRACTS.ROUTER as `0x${string}`,
    abi: ROUTER_ABI as any,
    functionName: 'getAmountsOut',
    args: amountIn && amountIn > 0n ? [amountIn, path] : undefined,
    query: { enabled: !!amountIn && amountIn > 0n && path.length >= 2 },
  });
  return { ...result, data: result.data as bigint[] | undefined };
}

export function useAllPairsLength() {
  const result = useReadContract({ 
    address: CONTRACTS.FACTORY as `0x${string}`, 
    abi: FACTORY_ABI as any, 
    functionName: 'allPairsLength' 
  });
  return { ...result, data: result.data as bigint | undefined };
}

export function useWETH() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const deposit = (value: bigint) => {
    (writeContract as any)({ 
      address: CONTRACTS.WETH, 
      abi: WETH_ABI, 
      functionName: 'deposit', 
      value 
    });
  };
  
  const withdraw = (amount: bigint) => {
    (writeContract as any)({ 
      address: CONTRACTS.WETH, 
      abi: WETH_ABI, 
      functionName: 'withdraw', 
      args: [amount] 
    });
  };
  
  return { deposit, withdraw, hash, isPending, isConfirming, isSuccess, error };
}

export function useTokenBalance(tokenAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  const result = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI as any,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!tokenAddress && !!userAddress },
  });
  return { ...result, data: result.data as bigint | undefined };
}

export function useTokenAllowance(
  tokenAddress: `0x${string}` | undefined, 
  ownerAddress: `0x${string}` | undefined, 
  spenderAddress: `0x${string}` | undefined
) {
  const result = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI as any,
    functionName: 'allowance',
    args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
    query: { enabled: !!tokenAddress && !!ownerAddress && !!spenderAddress },
  });
  return { ...result, data: result.data as bigint | undefined };
}

export function useApprove() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const approve = (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    (writeContract as any)({ 
      address: tokenAddress, 
      abi: ERC20_ABI, 
      functionName: 'approve', 
      args: [spender, amount] 
    });
  };
  
  return { approve, hash, isPending, isConfirming, isSuccess, error };
}

export { parseEther, formatEther, parseUnits, formatUnits };
