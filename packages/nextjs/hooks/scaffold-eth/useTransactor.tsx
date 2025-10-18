import { createPublicClient, http } from "viem";
import { Hash, SendTransactionParameters, TransactionReceipt, WalletClient } from "viem";
import { useWalletClient } from "wagmi";
import { mainnet } from "wagmi/chains";
import { getBlockExplorerTxLink, getParsedError, notification } from "~~/utils/scaffold-eth";

type TransactionFunc = (
  tx: (() => Promise<Hash | { hash: Hash }>) | SendTransactionParameters,
  options?: {
    onBlockConfirmation?: (txnReceipt: TransactionReceipt) => void;
    blockConfirmations?: number;
  },
) => Promise<Hash | undefined>;

/**
 * Custom notification content for TXs.
 */
const TxnNotification = ({ message, blockExplorerLink }: { message: string; blockExplorerLink?: string }) => {
  return (
    <div className="flex flex-col ml-1 cursor-default">
      <p className="my-0">{message}</p>
      {blockExplorerLink && blockExplorerLink.length > 0 && (
        <a href={blockExplorerLink} target="_blank" rel="noreferrer" className="block link text-md">
          check out transaction
        </a>
      )}
    </div>
  );
};

/**
 * Runs Transaction passed in to returned function showing UI feedback.
 * @param _walletClient - Optional wallet client to use. If not provided, will use the one from useWalletClient.
 * @returns function that takes in transaction function as callback, shows UI feedback for transaction and returns a promise of the transaction hash
 */
export const useTransactor = (_walletClient?: WalletClient): TransactionFunc => {
  let walletClient = _walletClient;
  const { data } = useWalletClient();
  if (!walletClient && data) {
    walletClient = data;
  }

  const result: TransactionFunc = async (tx, options) => {
    if (!walletClient) {
      notification.error("Cannot access account");
      console.error("⚡️ ~ file: useTransactor.tsx ~ error");
      return;
    }

    let notificationId: string | null = null;
    let transactionHash: Hash | undefined = undefined;

    try {
      const network = await walletClient.getChainId();
      //const publicClient = getPublicClient();
      const publicClient = createPublicClient({
        chain: mainnet, // ganti sesuai chain kamu, bisa pakai variable network
        transport: http(),
      });

      notificationId = notification.loading(<TxnNotification message="Awaiting for user confirmation" />);

      if (typeof tx === "function") {
        const result = await tx();
        transactionHash = typeof result === "string" ? result : result.hash;
      } else {
        transactionHash = await walletClient.sendTransaction(tx);
      }

      notification.remove(notificationId);

      const blockExplorerTxURL = network ? getBlockExplorerTxLink(network, transactionHash) : "";

      notificationId = notification.loading(
        <TxnNotification message="Waiting for transaction to complete." blockExplorerLink={blockExplorerTxURL} />,
      );

      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
        confirmations: options?.blockConfirmations,
      });

      notification.remove(notificationId);

      notification.success(
        <TxnNotification message="Transaction completed successfully!" blockExplorerLink={blockExplorerTxURL} />,
        { icon: "🎉" },
      );

      if (options?.onBlockConfirmation) options.onBlockConfirmation(transactionReceipt);
    } catch (error: any) {
      if (notificationId) notification.remove(notificationId);
      console.error("⚡️ ~ file: useTransactor.ts ~ error", error);
      notification.error(getParsedError(error));
      throw error;
    }

    return transactionHash;
  };

  return result;
};
