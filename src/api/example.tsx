// Example: How to use the API client in your React app

import { useState } from 'react';
import { ClaudeCodeClient } from './api';
import type { Message } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);

  // Initialize client (get these from your settings)
  const client = new ClaudeCodeClient({
    baseUrl: 'https://your-vps.com',
    apiKey: 'your-secret-token',
    onConnectionChange: (connected) => {
      console.log('Connection:', connected ? 'connected' : 'disconnected');
    },
  });

  async function sendMessage() {
    if (!draft.trim()) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: draft,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setThinking(true);

    try {
      // Option 1: Simple request-response
      const response = await client.sendMessage(draft, 'high');
      setMessages((prev) => [...prev, response]);

      // Option 2: Streaming with thinking traces (better UX)
      // await client.sendMessageStream({
      //   text: draft,
      //   effortLevel: 'high',
      //   onThinking: (trace) => {
      //     console.log('Thinking:', trace.label, trace.content);
      //   },
      //   onToolUse: (tool) => {
      //     console.log('Tool:', tool.name, tool.detail);
      //   },
      // });
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <p>{msg.text}</p>
            <span className="time">{msg.time}</span>
          </div>
        ))}
        {thinking && <div className="thinking">Thinking...</div>}
      </div>

      <div className="composer">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Message Claude Code..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
