export enum FhishType {
  Bool = 0,
  Uint8 = 1,
  Uint16 = 2,
  Uint32 = 3,
  Uint64 = 4,
  Uint128 = 5,
  Uint256 = 6,
  Address = 7,
}

export type EncryptableBool = {
  data: boolean;
  type: FhishType.Bool;
};

export type EncryptableUint8 = {
  data: string | bigint | number;
  type: FhishType.Uint8;
};

export type EncryptableUint16 = {
  data: string | bigint | number;
  type: FhishType.Uint16;
};

export type EncryptableUint32 = {
  data: string | bigint | number;
  type: FhishType.Uint32;
};

export type EncryptableUint64 = {
  data: string | bigint | number;
  type: FhishType.Uint64;
};

export type EncryptableUint128 = {
  data: string | bigint | number;
  type: FhishType.Uint128;
};

export type EncryptableUint256 = {
  data: string | bigint | number;
  type: FhishType.Uint256;
};

export type EncryptableAddress = {
  data: string;
  type: FhishType.Address;
};

export type EncryptableItem =
  | EncryptableBool
  | EncryptableUint8
  | EncryptableUint16
  | EncryptableUint32
  | EncryptableUint64
  | EncryptableUint128
  | EncryptableUint256
  | EncryptableAddress;

export interface FhishConfig {
  gatewayAddress: string;
  networkPublicKey: string;
  chainId: number;
  kmsAddress: string;
  aclAddress: string;
}

export interface FhishPermit {
  publicKey: string;
  signature: string;
  privateKey: string;
}

export interface EncryptedInput {
  handle: bigint;
  type: FhishType;
}
