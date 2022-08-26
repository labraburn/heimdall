/**
 * Block ID
 */
export type BlockID = {
  workchain: number;
  shard: string;
  seqno: number;
  root_hash: string;
  file_hash: string;
};

/**
 * Transaction ID
 */
export type TransactionID = {
  lt: number;
  hash: string;
};

/**
 * Transaction ID inside block
 */
export type TransactionIDBlock = {
  mode: number;

  /**
   * Base64, without workchain info
   */
  account: string;
  lt: number;
  hash: string;
};

/**
 * Array of shards
 */
export type ShardsArray = {
  shards: BlockID[];
};

/**
 * Address
 */
export type Address = {
  /** Can be an ampty string */
  account_address: string;
};

/**
 * Incoming/outcoming message
 */
export type TransactionMessage = {
  /**
   * account address
   */
  source?: Address;

  /**
   * account address
   */
  destination: Address;

  /**
   * nanotons, int64
   */
  value: number;

  /**
   * forward fees, int64
   */
  fwd_fee: number;

  /**
   * routing fees, int64
   */
  ihr_fee: number;

  /**
   * int64
   */
  created_lt: number;

  /**
   * hex
   */
  body_hash: string;

  /**
   * message data
   *
   * - msg.dataRaw body:bytes init_state:bytes = msg.Data;
   * - msg.dataText text:bytes = msg.Data;
   * - msg.dataDecryptedText text:bytes = msg.Data;
   * - msg.dataEncryptedText text:bytes = msg.Data;
   *
   * - msg.dataEncrypted source:accountAddress data:msg.Data = msg.DataEncrypted;
   * - msg.dataDecrypted proof:bytes data:msg.Data = msg.DataDecrypted;
   *
   * - msg.dataEncryptedArray elements:vector<msg.dataEncrypted> = msg.DataEncryptedArray;
   * - msg.dataDecryptedArray elements:vector<msg.dataDecrypted> = msg.DataDecryptedArray;
   */
  msg_data?: any;
};

/**
 * Full transaction
 */
export type Transaction = {
  transaction_id: TransactionID;
  in_msg?: TransactionMessage;
  out_msgs?: TransactionMessage[];

  /**
   * int53
   */
  utime: number;

  /**
   * hex
   */
  data: string;

  /**
   * int64
   */
  fee: number;

  /**
   * int64
   */
  storage_fee: number;

  /**
   * int64
   */
  other_fee: number;
};

/**
 * List of transactions of account
 */
export type TransactionArray = {
  transactions: Transaction[];
  previous_transaction_id?: TransactionID;
};

/**
 * List of transactions in block
 */
export type TransactionBlockArray = {
  id: BlockID;
  req_count: number;
  incomplete: boolean;
  transactions: TransactionIDBlock[];
};
