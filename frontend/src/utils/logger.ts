// ============================================================
// MediChain Production Logger & Observability Abstraction
// ============================================================
// Provides structured client-side logging for Soroban transactions,
// contract events, RPC responses, and wallet security events.
// ============================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogPayload {
  message: string;
  category: 'soroban' | 'wallet' | 'contract' | 'event_stream' | 'auth';
  data?: Record<string, unknown> | unknown;
  timestamp?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, payload: LogPayload): string {
    const time = payload.timestamp || new Date().toISOString();
    return `[MediChain Log][${level.toUpperCase()}][${payload.category}][${time}]: ${payload.message}`;
  }

  public debug(payload: LogPayload): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', payload), payload.data ?? '');
    }
  }

  public info(payload: LogPayload): void {
    console.info(this.formatMessage('info', payload), payload.data ?? '');
  }

  public warn(payload: LogPayload): void {
    console.warn(this.formatMessage('warn', payload), payload.data ?? '');
  }

  public error(payload: LogPayload): void {
    console.error(this.formatMessage('error', payload), payload.data ?? '');
  }

  public trackTransaction(txHash: string, action: string, status: 'pending' | 'success' | 'failed', details?: unknown) {
    this.info({
      category: 'soroban',
      message: `Transaction ${action} -> Status: ${status}`,
      data: {
        txHash,
        action,
        status,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
        details,
      },
    });
  }
}

export const logger = new Logger();
