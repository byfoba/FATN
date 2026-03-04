export type Tick = {
  ts: string;
  price: number;
  size: number;
};

export type BridgeConfig = {
  mode: 'live' | 'playback';
  csvPath?: string;
  apiBaseUrl: string;
  ticker: string;
  exchange: string;
  bridgeSecret: string;
  analysisCadenceSec: number;
};
