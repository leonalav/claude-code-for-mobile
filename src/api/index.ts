/**
 * TypeScript client for Claude Code Mobile Server
 * Use this in your React app to connect to the Go backend
 */

import type { Message, GitFile, Session, Attachment } from '../types';

export interface ClientConfig {
  baseUrl: string;
  apiKey: string;
  onConnectionChange?: (connected: boolean) => void;
}

export interface SendMessageOptions {
  text: string;
  attachments?: Attachment[];
  skill?: string;
  effortLevel?: string;
  onThinking?: (trace: { label: string; content: string }) => void;
  onToolUse?: (tool: { name: string; detail: string; status: string }) => void;
}

export class ClaudeCodeClient {
  private config: ClientConfig;
  private ws: WebSocket | null = null;
  private connected = false;

  constructor(config: ClientConfig) {
    this.config = config;
  }

  /**
   * Send a message and get a complete response (non-streaming)
   */
  async sendMessage(text: string, effortLevel?: string): Promise<Message> {
    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({ text, effortLevel }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      text: data.response,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
  }

  /**
   * Send a message with streaming (WebSocket)
   */
  async sendMessageStream(options: SendMessageOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.baseUrl.replace(/^http/, 'ws') + '/api/chat/stream';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connected = true;
        this.config.onConnectionChange?.(true);
        
        // Send initial message
        this.ws?.send(JSON.stringify({
          text: options.text,
          attachments: options.attachments,
          skill: options.skill,
          effortLevel: options.effortLevel,
        }));
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'thinking' && options.onThinking) {
          options.onThinking({
            label: data.label || 'Thinking',
            content: data.data,
          });
        } else if (data.type === 'tool' && options.onToolUse) {
          options.onToolUse({
            name: data.name,
            detail: data.detail,
            status: data.status,
          });
        } else if (data.type === 'response') {
          resolve();
        }
      };

      this.ws.onerror = (error) => {
        this.connected = false;
        this.config.onConnectionChange?.(false);
        reject(error);
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.config.onConnectionChange?.(false);
      };
    });
  }

  /**
   * Get git status (uncommitted changes)
   */
  async getGitStatus(): Promise<GitFile[]> {
    const response = await fetch(`${this.config.baseUrl}/api/git/status`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Git status error: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  }

  /**
   * Commit changes
   */
  async gitCommit(message: string): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/api/git/commit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Commit error: ${response.status}`);
    }

    const data = await response.json();
    return data.output;
  }

  /**
   * Get available sessions
   */
  async getSessions(): Promise<Session[]> {
    const response = await fetch(`${this.config.baseUrl}/api/sessions`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Sessions error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Check if server is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Close WebSocket connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }
}

/**
 * React hook for using the Claude Code client
 */
export function useClaudeCodeClient(config: ClientConfig) {
  const [client] = React.useState(() => new ClaudeCodeClient(config));
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    const checkConnection = async () => {
      const healthy = await client.healthCheck();
      setConnected(healthy);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s

    return () => {
      clearInterval(interval);
      client.disconnect();
    };
  }, [client]);

  return { client, connected };
}

// Re-export for convenience
export type { Message, GitFile, Session, Attachment };
