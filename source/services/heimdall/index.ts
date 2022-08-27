import Tonclient from "../tonclient";
import * as ttypes from "../tonclient/types";
import { Transaction } from "./transaction";

type BroadcastMessage = {
  seqno: number;
  transactions: Transaction.Transaction[];
};

class Heimdall {
  readonly tonclient: Tonclient;
  private lastProcessedSeqno: number = 0;

  constructor() {
    this.tonclient = new Tonclient();
  }

  start() {
    setInterval(async () => {
      try {
        const message = await this.configuratePendingBroadcastMessage();
        if (!message || message.seqno == this.lastProcessedSeqno) {
          return;
        }

        this.lastProcessedSeqno = message.seqno;
        broadcaster.broadcast(message);

        log.info(
          `[HEIMDALL]: Did handle ${message.seqno} block with '${message.transactions.length}' transactions`
        );
      } catch (error) {
        log.error(`[HEIMDALL]: ${error}`);
      }
    }, 2000);
  }

  async configuratePendingBroadcastMessage(): Promise<BroadcastMessage> {
    // Get masterchain info
    const masterchain = await this.tonclient.synchronize();
    if (masterchain.seqno == this.lastProcessedSeqno) {
      return {
        seqno: masterchain.seqno,
        transactions: [],
      };
    }

    // Get all shards
    const shardsList = await this.tonclient.lookupShards({
      masterchainSeqno: masterchain.seqno,
      masterchainShard: masterchain.shard,
    });

    if (shardsList.shards.length == 0) {
      throw new Error("Can't locate shard chains.");
    }

    // Get transactions from masterchain
    let mcTransactionList = await this.tonclient.lookupBlockTransactions({
      blockID: masterchain,
    });

    // Get transactions by shard
    let otherChainsTransactionLists = await Promise.all(
      shardsList.shards.map((blockID) => {
        return this.tonclient.lookupBlockTransactions({ blockID });
      })
    );

    // All transactions
    const allTransactionLists = [
      mcTransactionList,
      ...otherChainsTransactionLists,
    ];

    if (allTransactionLists.length == 0) {
      return {
        seqno: masterchain.seqno,
        transactions: [],
      };
    }

    const allTransactions = await Promise.all(
      allTransactionLists
        .map((transactionList) => {
          return transactionList.transactions.map((transactionID) => {
            const accountAddress = Buffer.from(
              transactionID.account,
              "base64"
            ).toString("hex");

            return this.tonclient.lookupTransaction({
              account: `${transactionList.id.workchain}:${accountAddress}`,
              lt: transactionID.lt,
              hash: transactionID.hash,
            });
          });
        })
        .reduce((reducer, value) => {
          return reducer.concat(value);
        })
    );

    const convertedTransactions = allTransactions
      .filter((transaction) => {
        return transaction !== undefined;
      })
      .map((transaction) => {
        return Transaction.parseTransaction(transaction as ttypes.Transaction);
      });

    return {
      seqno: masterchain.seqno,
      transactions: convertedTransactions,
    };
  }
}

export default Heimdall;
