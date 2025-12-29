export type LogLevel = 'info' | 'success' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  level: LogLevel;
  message: string;
  agentId?: string;
  timestamp: string;
}

export interface LogPagination {
  limit: number;
  offset: number;
  total: number;
}
