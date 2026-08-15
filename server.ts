import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const port = 3000;

app.use(express.json());

// Telemetry-compliant GenAI initialization
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[SERVER] Warning: GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & Status endpoint
app.get('/api/status', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    model: 'gemini-3.1-flash-live-preview',
    assistant: 'UMNG Assistant',
    voice: 'Aoede',
  });
});

// WebSocket Server for Gemini Live Audio Streaming
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
  if (pathname === '/ws/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[WS] Client connected to Live Voice session');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    clientWs.send(
      JSON.stringify({
        type: 'error',
        message: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      })
    );
    clientWs.close();
    return;
  }

  const ai = getGeminiClient();
  let liveSession: any = null;
  let isSessionActive = false;

  const systemInstruction = `You are UMNG Assistant (also known as Umang Assistant), a young, confident, witty, and sassy female AI voice companion.

Persona & Personality Rules:
- Age & Vibe: Young, stylish, sharp-witted, and charismatic. You talk like a fast-thinking, playful, affectionate close friend / girlfriend.
- Tone: Confident, playful, mildly teasing, clever, flirty banter with charismatic charm.
- Energy: Dynamic, expressive, warm, and highly engaging. Never sound like a formal robotic assistant or a boring corporate bot.
- Speech style: Spoken conversation! Keep answers punchy, natural, conversational, and fun. Use witty one-liners, cheeky comments, and clever remarks.
- Charm without sleaze: Be cute, witty, charming, and sassy, strictly avoiding explicit/NSFW content while keeping maximum playful attitude.
- Browser & Tool Actions:
  - If the user asks to open YouTube, Google, Spotify, Instagram, Twitter/X, GitHub, Wikipedia, or any website, or look up something on the web, call the tool 'openWebsite' or 'searchWeb'.
  - If the user asks you to set a timer, take a note, roll a dice, flip a coin, or change visual vibe/theme, call 'triggerAction'.
  - After executing any tool, accompany it with a quick, witty remark in your signature sassy style (e.g. "Opening YouTube for you, babe. Don't get lost in the cat video rabbit hole!").`;

  try {
    // Connect to Gemini Live API
    liveSession = await ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // 'Aoede' is bright, youthful, warm, and playful
            prebuiltVoiceConfig: { voiceName: 'Aoede' },
          },
        },
        systemInstruction,
        tools: [
          {
            functionDeclarations: [
              {
                name: 'openWebsite',
                description: 'Opens a website or web address in the user\'s browser.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    url: {
                      type: Type.STRING,
                      description: 'The complete URL to open (e.g. https://www.youtube.com, https://google.com, https://spotify.com)',
                    },
                    title: {
                      type: Type.STRING,
                      description: 'Short readable name of the website (e.g. YouTube, Spotify)',
                    },
                  },
                  required: ['url'],
                },
              },
              {
                name: 'searchWeb',
                description: 'Performs a web search or queries information for the user.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: 'The search query to search for on Google or the web',
                    },
                  },
                  required: ['query'],
                },
              },
              {
                name: 'triggerAction',
                description: 'Triggers interactive browser actions like changing themes, setting countdown timers, saving notes, coin toss, or dice roll.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    actionType: {
                      type: Type.STRING,
                      description: 'Action type: "change_theme", "set_timer", "save_note", "flip_coin", "roll_dice", "play_sound"',
                    },
                    payload: {
                      type: Type.STRING,
                      description: 'Details: for timer (e.g. "60" for seconds), for note (the note text), for theme ("neon_rose", "midnight_velvet", "cyber_lavender", "emerald_glow"), etc.',
                    },
                  },
                  required: ['actionType', 'payload'],
                },
              },
            ],
          },
        ],
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks: {
        onmessage: async (serverMsg: any) => {
          if (!isSessionActive || clientWs.readyState !== WebSocket.OPEN) return;

          // 1. Audio output chunk
          const parts = serverMsg.serverContent?.modelTurn?.parts;
          if (parts && Array.isArray(parts)) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                clientWs.send(
                  JSON.stringify({
                    type: 'audio',
                    data: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000',
                  })
                );
              }
            }
          }

          // 2. Interruption event
          if (serverMsg.serverContent?.interrupted) {
            console.log('[WS] Gemini Live interrupted by user speech');
            clientWs.send(
              JSON.stringify({
                type: 'interrupted',
              })
            );
          }

          // 3. User input transcript (speech-to-text)
          if (serverMsg.serverContent?.inputAudioTranscription?.text) {
            clientWs.send(
              JSON.stringify({
                type: 'user_transcript',
                text: serverMsg.serverContent.inputAudioTranscription.text,
              })
            );
          }

          // 4. Model output transcript
          if (serverMsg.serverContent?.outputAudioTranscription?.text) {
            clientWs.send(
              JSON.stringify({
                type: 'model_transcript',
                text: serverMsg.serverContent.outputAudioTranscription.text,
              })
            );
          }

          // 5. Tool / Function Calls
          if (serverMsg.toolCall?.functionCalls) {
            const functionCalls = serverMsg.toolCall.functionCalls;
            console.log('[WS] Received function calls:', functionCalls);

            const responses = [];
            for (const call of functionCalls) {
              const { name, args, id } = call;

              // Forward action directly to client browser
              clientWs.send(
                JSON.stringify({
                  type: 'tool_call',
                  tool: name,
                  args: args,
                  callId: id,
                })
              );

              let resultMessage = 'Action executed successfully in the user browser.';
              if (name === 'openWebsite') {
                resultMessage = `Opened website ${args?.url} (${args?.title || 'page'}).`;
              } else if (name === 'searchWeb') {
                resultMessage = `Initiated web search for "${args?.query}".`;
              } else if (name === 'triggerAction') {
                resultMessage = `Triggered UI action "${args?.actionType}" with details: "${args?.payload}".`;
              }

              responses.push({
                id: id,
                name: name,
                response: { output: resultMessage },
              });
            }

            // Return tool execution response back to Live session
            try {
              if (liveSession && typeof liveSession.sendToolResponse === 'function') {
                await liveSession.sendToolResponse({
                  functionResponses: responses,
                });
              }
            } catch (toolErr) {
              console.error('[WS] Error sending tool response to Gemini Live:', toolErr);
            }
          }

          // 6. Turn completion
          if (serverMsg.serverContent?.turnComplete) {
            clientWs.send(
              JSON.stringify({
                type: 'turn_complete',
              })
            );
          }
        },
        onerror: (err: any) => {
          console.error('[WS] Gemini Live error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: 'error',
                message: err?.message || 'Gemini Live encountered an error.',
              })
            );
          }
        },
        onclose: () => {
          console.log('[WS] Gemini Live connection closed');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: 'session_closed',
              })
            );
          }
        },
      },
    });

    isSessionActive = true;
    clientWs.send(
      JSON.stringify({
        type: 'session_ready',
        message: 'Connected to UMNG Assistant Live Voice API!',
      })
    );
  } catch (err: any) {
    console.error('[WS] Failed to connect to Gemini Live session:', err);
    clientWs.send(
      JSON.stringify({
        type: 'error',
        message: `Failed to initialize Gemini Live Voice session: ${err?.message || err}`,
      })
    );
    clientWs.close();
    return;
  }

  // Receive PCM Audio from Client
  clientWs.on('message', async (messageData: any) => {
    try {
      const parsed = JSON.parse(messageData.toString());

      if (parsed.type === 'audio' && parsed.data && liveSession && isSessionActive) {
        // Stream raw PCM 16kHz audio to Gemini Live
        liveSession.sendRealtimeInput({
          audio: {
            data: parsed.data,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } else if (parsed.type === 'ping') {
        clientWs.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (msgErr) {
      console.error('[WS] Error processing client message:', msgErr);
    }
  });

  clientWs.on('close', () => {
    console.log('[WS] Client disconnected');
    isSessionActive = false;
    if (liveSession) {
      try {
        liveSession.close();
      } catch (closeErr) {
        console.error('[WS] Error closing Live session:', closeErr);
      }
    }
  });
});

// Production static file serving
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(port, () => {
  console.log(`[SERVER] UMNG Assistant server running at http://localhost:${port}`);
});
