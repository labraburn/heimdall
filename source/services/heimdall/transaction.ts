import { Address } from "ton";
import * as ttypes from "../tonclient/types";

export namespace Transaction {
  export interface ID {
    /** Int64, logical time */
    lt: number;
    /** Int64, transaction hash */
    hash: string;
  }

  export interface Message {
    /** Source address of message */
    source?: string;

    /**
     * account address
     */
    destination: string;

    /** nanotons, int64 */
    value: number;

    /** nanotons, int64 */
    fees: {
      forward: number;
      routing: number;
    };

    /** Logical time of creation, int64 */
    createdLT: number;

    /** Transaction message body hash, base64 */
    bodyHash: string;

    /** Message body */
    body?: {
      /** raw | */
      type: "raw" | "text";
      value: string;
    };
  }

  export interface Transaction {
    id: ID;

    /**
     * Incoming message
     *
     * @remarks
     * An external message or internal message from anothet smartcontract
     */
    incomingMessages?: Message;

    /**
     * All outgoing messages
     *
     * @remarks
     * An internal messages produced by current smartcontract
     */
    outgoingMessages?: Message[];

    /** Date of transaction, ; */
    date: Date;

    /** Body of trnasaction, hex string */
    data: string;

    /** nanotons, int64 */
    fees: {
      common: number;
      storage: number;
      other: number;
    };
  }

  export function parseTransaction(
    transaction: ttypes.Transaction
  ): Transaction {
    let parsed: Transaction = {
      id: {
        lt: transaction.transaction_id.lt,
        hash: transaction.transaction_id.hash,
      },
      date: new Date(transaction.utime * 1000),
      data: Buffer.from(transaction.data, "base64").toString("hex"),
      fees: {
        common: transaction.fee,
        storage: transaction.storage_fee,
        other: transaction.other_fee,
      },
    };

    if (transaction.in_msg) {
      parsed.incomingMessages = parseMessage(transaction.in_msg);
    }

    if (transaction.out_msgs && transaction.out_msgs.length > 0) {
      parsed.outgoingMessages = transaction.out_msgs.map((message) =>
        parseMessage(message)
      );
    }

    return parsed;
  }

  export function parseMessage(message: ttypes.TransactionMessage): Message {
    let parsed: Message = {
      destination: Address.parse(
        message.destination.account_address
      ).toString(),
      value: message.value,
      createdLT: message.created_lt,
      bodyHash: message.body_hash,
      fees: {
        forward: message.fwd_fee,
        routing: message.ihr_fee,
      },
    };

    if (message.source && message.source.account_address.length > 0) {
      parsed.source = Address.parse(message.source.account_address).toString();
    }

    if (message.msg_data) {
      if (message.msg_data.text) {
        parsed.body = { type: "text", value: message.msg_data.text };
      } else if (message.msg_data.body) {
        parsed.body = { type: "raw", value: message.msg_data.body };
      }
    }

    return parsed;
  }
}
