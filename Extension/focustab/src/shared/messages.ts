export type MessageType =
  | 'ENABLE_FOCUS_MODE'
  | 'DISABLE_FOCUS_MODE'
  | 'UPDATE_BLOCK_LIST'
  | 'GET_FOCUS_MODE_STATE';

export interface FocusMessage {
  type: MessageType;
  blockList?: string[];
}

export interface FocusResponse {
  success: boolean;
  error?: string;
  enabled?: boolean;
}
