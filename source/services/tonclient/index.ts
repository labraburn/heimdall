import * as synchronized from "synchronized-promise";
import * as fs from "fs";
import * as types from "./types";

import { dirname } from "path";

import fetch from "node-fetch";
import tonlib from "node-tonlib";

class Tonclient {
  private client: tonlib.Client;

  constructor() {
    let configuration: tonlib.Configuration = "";
    synchronized.default(async () => {
      const response = await fetch("https://ton.org/global-config.json");
      configuration = await response.text();
    })();

    const network = "mainnet";

    if (require.main === undefined) {
      throw new Error("Can't locate project root path");
    }

    const rootPath = dirname(require.main.filename);
    const keystorePath = `${rootPath}/keystore`;

    if (!fs.existsSync(keystorePath)) {
      fs.mkdirSync(keystorePath);
    }

    this.client = new tonlib.Client({
      configuration: configuration,
      keystorePath: keystorePath,
      network: network,
      logging: process.env.DEBUG ? 3 : 0,
    });

    log.info(`[TONCLIENT]: Successfully start network ${network}`);
  }

  /**
   * Synchronizes with masterchain
   * @returns last masterchain block id
   */
  async synchronize(): Promise<types.BlockID> {
    return (await this.client.send({
      "@type": "sync",
    })) as types.BlockID;
  }

  /**
   * Try to get block with parameters
   * @param parameters
   * @returns block id
   */
  async lookupBlock(parameters: {
    workchain: number;
    shard: string;
    seqno: number;
  }): Promise<types.BlockID | undefined> {
    return (await this.client.send({
      "@type": "blocks.lookupBlock",
      mode: 1,
      id: {
        "@type": "ton.blockId",
        workchain: parameters.workchain,
        shard: parameters.shard,
        seqno: parameters.seqno,
      },
    })) as types.BlockID | undefined;
  }

  /**
   * Try to get all shards with parameters from masterchain
   *
   * @note shards info lockated only in masterchain (-1)
   * @param parameters
   * @returns an array of shards block ids
   */
  async lookupShards(parameters: {
    masterchainSeqno: number;
    masterchainShard: string;
  }): Promise<types.ShardsArray> {
    return await this.lookupBlock({
      workchain: -1,
      shard: parameters.masterchainShard,
      seqno: parameters.masterchainSeqno,
    }).then((masterchainBlockID) => {
      return this.client.send({
        "@type": "blocks.getShards",
        id: masterchainBlockID,
      }) as Promise<types.ShardsArray>;
    });
  }

  /**
   * Returns all transactions in block with parameters
   * @param parameters
   * @returns
   */
  async lookupBlockTransactions(parameters: {
    blockID: types.BlockID;
  }): Promise<types.TransactionBlockArray> {
    return await this._lookupBlockTransactions({
      blockID: parameters.blockID,
      after: {
        account: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        lt: 0,
      },
    });
  }

  private async _lookupBlockTransactions(parameters: {
    blockID: types.BlockID;
    after: {
      lt: number;
      account: string;
    };
  }): Promise<types.TransactionBlockArray> {
    let result: types.TransactionIDBlock[] = [];

    let incomplete = true;
    let after = parameters.after;

    while (incomplete) {
      let q;
      const lresult = (await this.client.send({
        "@type": "blocks.getTransactions",
        id: parameters.blockID,
        count: 20,
        mode: 7 + 128,
        after: {
          "@type": "blocks.accountTransactionId",
          account: after.account,
          lt: after.lt,
        },
      })) as types.TransactionBlockArray;

      const count = lresult.transactions.length;
      if (count == 0) {
        break;
      }

      result = result.concat(lresult.transactions);
      incomplete = lresult.incomplete;
      after = lresult.transactions[count - 1];
    }

    return {
      id: parameters.blockID,
      incomplete: false,
      req_count: result.length,
      transactions: result,
    };
  }

  /**
   * Returns transaction with parameters
   * @param parameters
   * @returns full transactions
   */
  async lookupTransaction(parameters: {
    account: string;
    lt: number;
    hash: string;
  }): Promise<types.Transaction | undefined> {
    const result = (await this.client.send({
      "@type": "raw.getTransactions",
      account_address: {
        account_address: parameters.account,
      },
      from_transaction_id: {
        "@type": "internal.transactionId",
        lt: parameters.lt,
        hash: parameters.hash,
      },
    })) as types.TransactionArray;
    return result.transactions.length > 0 ? result.transactions[0] : undefined;
  }
}

export default Tonclient;
