import { useReadContract, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { MOCK_PSG_ADDRESS } from "../constants/contracts";
import { useActiveAccount } from "thirdweb/react";

// Standard ERC20 ABI for approve function
const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const psgTokenContract = getContract({
  client,
  chain: spicyTestnet,
  address: MOCK_PSG_ADDRESS,
  abi: ERC20_ABI
});

interface UseTokenApprovalProps {
  spenderAddress: string;
  amount: string;
}

export function useTokenApproval({ spenderAddress, amount }: UseTokenApprovalProps) {
  const account = useActiveAccount();
  
  // Check current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    contract: psgTokenContract,
    method: "allowance",
    params: [account?.address || "0x0", spenderAddress],
    queryOptions: {
      enabled: !!account?.address
    }
  });

  const amountInWei = amount ? toWei(amount) : BigInt(0);
  const needsApproval = currentAllowance ? BigInt(currentAllowance) < amountInWei : true;

  const approveTransaction = () => prepareContractCall({
    contract: psgTokenContract,
    method: "approve",
    params: [spenderAddress, amountInWei],
  });

  return {
    needsApproval,
    currentAllowance: currentAllowance ? BigInt(currentAllowance) : BigInt(0),
    amountInWei,
    approveTransaction,
    refetchAllowance
  };
}

interface ApprovalButtonProps {
  spenderAddress: string;
  amount: string;
  onApprovalConfirmed?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ApprovalButton({ 
  spenderAddress, 
  amount, 
  onApprovalConfirmed, 
  children, 
  className = "" 
}: ApprovalButtonProps) {
  const { needsApproval, approveTransaction, refetchAllowance } = useTokenApproval({
    spenderAddress,
    amount
  });

  if (!needsApproval) {
    return null; // No approval needed
  }

  return (
    <TransactionButton
      transaction={approveTransaction}
      onTransactionConfirmed={() => {
        refetchAllowance();
        onApprovalConfirmed?.();
      }}
      className={`w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${className}`}
    >
      {children || `🔐 Approve ${amount} PSG`}
    </TransactionButton>
  );
}
