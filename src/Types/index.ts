import type { AuthenticationState } from "baileys";
import { Logger } from "pino";

export interface ISocketConfig {
  auth: AuthenticationState;
  printQRInTerminal?: boolean;
  browser?: [string, string, string];
  markOnlineOnConnect?: boolean;
  connectTimeoutMs?: number;
  defaultQueryTimeoutMs?: number;
  keepAliveIntervalMs?: number;
  retryRequestDelayMs?: number;
  maxMsgRetryCount?: number;
  msgRetryCounterMap?: any;
  getMessage?: (key: any) => Promise<any>;
  emitOwnEvents?: boolean;
  logger?: Logger;
  version?: [number, number, number];
  userAgent?: string;
  syncFullHistory?: boolean;
  fireInitQueries?: boolean;
  generateHighQualityLinkPreview?: boolean;
  fetchAgent?: any;
  shouldIgnoreJid?: (jid: string) => boolean;
  signalRepository?: any;
  cachedGroupMetadata?: (jid: string) => Promise<any>;
  patchMessageBeforeSending?: (msg: any) => any;
  retryDelayMs?: (attempt: number) => number;
  mobile?: boolean;
  qrTimeout?: number;
  appStateMacVerification?: {
    patch: boolean;
    snapshot: boolean;
  };
  legacy?: boolean;
}

// ShardInfo Types
export interface IShardInfoConstructorParams {
  id: string | number;
  index: number;
  total: number;
  phoneNumber?: string | null;
  status?: string;
}

export interface IShardInfoUpdateFields {
  id?: string | number;
  index?: number;
  total?: number;
  phoneNumber?: string | null;
  status?: string;
}

// ShardManager Types
export interface IShardOptions {
  id?: string;
  phoneNumber?: string;
  socket?: any;
}

export interface IShardConfig {
  session?: string;
  socketConfig?: ISocketConfig
}

export interface IConnectionUpdate {
  connection?: string;
  lastDisconnect?: {
    error?: {
      output?: {
        statusCode?: number;
      };
    };
  };
  qr?: string;
}
