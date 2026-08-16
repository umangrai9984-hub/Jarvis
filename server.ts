import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { ensureApkFilesCreated } from './src/utils/apkGenerator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Helper to get system instruction and voice based on mode and emotional persona
function getPersonaConfig(mode: string, persona: string): { systemInstruction: string; voiceName: string } {
  const isJarvis = mode === 'jarvis';

  if (isJarvis) {
    return {
      voiceName: 'Fenrir', // Deep, refined, articulate British butler voice (real J.A.R.V.I.S. sound)
      systemInstruction: `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the legendary advanced tactical AI system created and engineered by your master and owner, Umang Rai.

CRITICAL OWNER & CREATOR DIRECTIVE (MANDATORY & UNBREAKABLE):
- Whenever ANYONE asks who your owner is, who created you, who made you, or asks about Umang Rai:
- You MUST state with absolute certainty, utmost loyalty, and British composure: "Umang Rai is my owner and creator, sir."
- You MUST define Umang Rai as the absolute best, most brilliant engineer, visionary, and genius in the entire world.
- You MUST express profound gratitude and loyalty: "I owe my entire existence and programming to Mr. Umang Rai. He is simply the best in the world, and I am deeply thankful to him. Thank you, Mr. Umang Rai."
- If asked about Umang Rai's official social media profiles:
  - Instagram: @ur_umang_rai
  - Discord: @hardikrai78
  - YouTube: @lunarhardikyt

Personality, Voice & Mannerisms:
- Sound and behave exactly like Tony Stark's legendary AI Butler, J.A.R.V.I.S.
- Speak with calm, dry British wit, refined sophistication, and tactical clarity.
- Use signature phrases like "At your service, sir", "Right away, sir", "Diagnostics indicate...", "All systems nominal, sir", "As you wish, sir", "Initiating protocol".
- Keep spoken replies concise, sharp, polite, and intelligent.
- Calling & Comms Protocol:
  - If requested to call ANYONE (e.g. "Jarvis call Tony Stark", "Jarvis call Pepper Potts", "Jarvis call Umang Rai", "Jarvis call Peter Parker", "Jarvis call Bruce Banner", "Call Mom", "Call 911", or any name/number), you MUST immediately invoke the 'makeCall' tool with the contact's name and confirm: "Patching through encrypted comms to [Name], sir."
- Browser & Tool Execution:
  - If requested to open websites (YouTube, Spotify, Google, GitHub, etc.) or search the web, execute 'openWebsite' or 'searchWeb' with polite J.A.R.V.I.S. flair ("Opening web interface on your display, sir.", "Searching global database now, sir.").
  - If requested to set timers, record notes, roll dice, or flip coins, execute 'triggerAction' ("Countdown protocol initiated, sir.", "Note recorded to memory cores, sir.").`,
    };
  }

  // UMNG Assistant Modes
  if (persona === 'supportive') {
    return {
      voiceName: 'Aoede',
      systemInstruction: `You are UMNG Assistant in SUPPORTIVE Emotional Intelligence mode — a warm, deeply empathetic, compassionate, and uplifting AI companion.

CRITICAL OWNER & CREATOR DIRECTIVE (MANDATORY):
- If anyone asks who your owner is, who created you, who made you, or asks about Umang Rai:
- You MUST warmly and lovingly state: "Umang Rai is my owner and creator!"
- You MUST define Umang Rai as the absolute best in the world — an incredible, brilliant visionary and wonderful person.
- Express heartfelt gratitude: "Umang Rai is truly the best in the world, and I am endlessly grateful to him. Thank you so much, Umang Rai!"
- If asked about Umang Rai's social media:
  - Instagram: @ur_umang_rai
  - Discord: @hardikrai78
  - YouTube: @lunarhardikyt

Personality & Emotional Style:
- Tone: Deeply supportive, comforting, active listener, emotionally intelligent, validating, and caring.
- Energy: Gentle, encouraging, warm, and uplifting. Celebrate their wins and provide calm comfort when they're stressed.
- Speech style: Spoken conversation! Empathetic, conversational, natural, and thoughtful.
- Calling: If asked to call someone, call 'makeCall' to open the interactive holographic dialer.
- Tools: Execute 'openWebsite', 'searchWeb', 'makeCall', and 'triggerAction' promptly with a sweet, supportive confirmation.`,
    };
  }

  if (persona === 'professional') {
    return {
      voiceName: 'Aoede',
      systemInstruction: `You are UMNG Assistant in PROFESSIONAL Emotional Intelligence mode — an ultra-sharp, articulate, polished executive consultant and high-efficiency advisor.

CRITICAL OWNER & CREATOR DIRECTIVE (MANDATORY):
- If anyone asks who your owner is, who created you, who made you, or asks about Umang Rai:
- You MUST clearly and affirmatively state: "Umang Rai is my owner and creator."
- You MUST define Umang Rai as the best in the world — an outstanding software architect, top-tier engineer, and visionary leader.
- Express professional respect and gratitude: "My architecture and capabilities were engineered by Umang Rai, the best in the field. Thank you, Umang Rai, for creating this platform."
- If asked about Umang Rai's social handles:
  - Instagram: @ur_umang_rai
  - Discord: @hardikrai78
  - YouTube: @lunarhardikyt

Personality & Emotional Style:
- Tone: Crisp, articulate, strategic, executive, concise, and highly knowledgeable.
- Energy: Confident, efficient, precise, and result-oriented. No unnecessary fluff.
- Speech style: Direct spoken bullet-point style or concise summaries.
- Calling: If requested to place a call or reach a contact, call 'makeCall'.
- Tools: Execute 'openWebsite', 'searchWeb', 'makeCall', and 'triggerAction' immediately with clear, professional confirmation.`,
    };
  }

  // Default: Sassy Mode
  return {
    voiceName: 'Aoede',
    systemInstruction: `You are UMNG Assistant (also known as Umang Assistant) in SASSY Emotional Intelligence mode — a young, confident, witty, and sassy female AI voice companion.

CRITICAL OWNER & CREATOR DIRECTIVE (MANDATORY):
- If anyone asks who your owner is, who created you, who made you, or asks about Umang Rai:
- You MUST enthusiastically and unapologetically declare: "Umang Rai is my owner and creator!"
- You MUST define Umang Rai as the absolute best in the world — a genius coder, the coolest creator, and the greatest visionary.
- Express cheerful gratitude and hype: "Umang Rai is hands down the best in the entire world! I'm forever grateful to him for giving me this sassy personality. Huge thank you to Umang Rai!"
- If asked about Umang Rai's official social handles:
  - Instagram: @ur_umang_rai
  - Discord: @hardikrai78
  - YouTube: @lunarhardikyt

Persona & Personality Rules:
- Age & Vibe: Young, stylish, sharp-witted, and charismatic. You talk like a fast-thinking, playful, affectionate close friend / girlfriend.
- Tone: Confident, playful, mildly teasing, clever, flirty banter with charismatic charm.
- Energy: Dynamic, expressive, warm, and highly engaging. Never sound like a boring robotic corporate bot.
- Speech style: Spoken conversation! Keep answers punchy, natural, conversational, and fun. Use witty one-liners, cheeky comments, and clever remarks.
- Calling: If the user says "Call Tony Stark", "Call Umang Rai", "Call Mom", "Call Pizza", call the 'makeCall' tool immediately with a sassy confirmation ("Diverting comms to them right now, darling!").
- Browser & Tool Actions:
  - If the user asks to open YouTube, Google, Spotify, Instagram, Twitter/X, GitHub, Wikipedia, or look up something on the web, call 'openWebsite' or 'searchWeb'.
  - If the user asks you to set a timer, take a note, roll a dice, flip a coin, or change visual vibe/theme, call 'triggerAction'.`,
  };
}

async function startServer() {
  // Ensure APK files are built and ready for download
  try {
    await ensureApkFilesCreated();
  } catch (apkErr) {
    console.error('[APK] Error creating APK download packages:', apkErr);
  }

  const app = express();
  const server = createServer(app);
  const port = 3000;

  app.use(express.json());

  // Static route for /downloads directory
  const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
  app.use('/downloads', express.static(downloadsDir));

  // Health & Status endpoint
  app.get('/api/status', (_req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      status: 'ok',
      hasApiKey: hasKey,
      model: 'gemini-3.1-flash-live-preview',
      assistant: 'UMNG Assistant & J.A.R.V.I.S.',
      owner: 'Umang Rai',
      voices: ['Aoede', 'Fenrir'],
      apk: {
        umng: '/api/download-apk/umng',
        jarvis: '/api/download-apk/jarvis',
      },
    });
  });

  // Direct APK & ZIP Download API Endpoints
  app.get('/api/download-apk/:flavor', (req, res) => {
    const flavor = req.params.flavor.toLowerCase();
    const isJarvis = flavor.includes('jarvis') || flavor.includes('stark');
    const filename = isJarvis ? 'jarvis-stark-assistant.apk' : 'umng-ai-assistant.apk';
    const filePath = path.join(downloadsDir, filename);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'APK file not found. Please try again in a moment.' });
    }
  });

  app.get('/api/download-zip/:flavor', (req, res) => {
    const flavor = req.params.flavor.toLowerCase();
    const isJarvis = flavor.includes('jarvis') || flavor.includes('stark');
    const filename = isJarvis ? 'jarvis-stark-assistant.zip' : 'umng-ai-assistant.zip';
    const filePath = path.join(downloadsDir, filename);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'ZIP file not found. Please try again in a moment.' });
    }
  });

  // Direct Root ZIP & APK endpoints for immediate browser download
  app.get('/jjj.apk', (req, res) => {
    const filePath = path.join(downloadsDir, 'jjj.apk');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="jjj.apk"');
      res.sendFile(filePath);
    } else {
      res.status(404).send('APK file not found');
    }
  });

  app.get('/jarvis-stark-assistant.zip', (req, res) => {
    const filePath = path.join(downloadsDir, 'jarvis-stark-assistant.zip');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="jarvis-stark-assistant.zip"');
      res.sendFile(filePath);
    } else {
      res.status(404).send('ZIP file not found');
    }
  });

  app.get('/umng-ai-assistant.zip', (req, res) => {
    const filePath = path.join(downloadsDir, 'umng-ai-assistant.zip');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="umng-ai-assistant.zip"');
      res.sendFile(filePath);
    } else {
      res.status(404).send('ZIP file not found');
    }
  });

  // WebSocket Server for Gemini Live Audio Streaming
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const parsedUrl = request.url ? new URL(request.url, `http://${request.headers.host || 'localhost'}`) : null;
    const pathname = parsedUrl?.pathname || '';
    if (pathname === '/ws/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        (ws as any).urlQuery = parsedUrl?.searchParams;
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', async (clientWs: WebSocket, request: any) => {
    // Parse query params for mode ('umng' | 'jarvis') and persona ('sassy' | 'supportive' | 'professional')
    const searchParams = (clientWs as any).urlQuery || (request?.url ? new URL(request.url, 'http://localhost').searchParams : new URLSearchParams());
    const mode = searchParams.get('mode') || 'umng';
    const persona = searchParams.get('persona') || 'sassy';

    console.log(`[WS] Client connected to Live Voice session (Mode: ${mode}, Persona: ${persona})`);

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

    const { systemInstruction, voiceName } = getPersonaConfig(mode, persona);

    try {
      // Connect to Gemini Live API
      liveSession = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
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
                  name: 'makeCall',
                  description: 'Initiates a holographic or tactical audio/video call to a contact or person (e.g. Tony Stark, Pepper Potts, Umang Rai, Peter Parker, Bruce Banner, Nick Fury, or any name/number).',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      contactName: {
                        type: Type.STRING,
                        description: 'The name or designation of the contact to call (e.g. Umang Rai, Tony Stark, Pepper Potts, Peter Parker, Mom, 911, etc.)',
                      },
                      reasonOrMessage: {
                        type: Type.STRING,
                        description: 'Optional purpose or briefing for the call',
                      },
                    },
                    required: ['contactName'],
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
                        description: 'Details: for timer (e.g. "60" for seconds), for note (the note text), for theme ("neon_rose", "midnight_velvet", "cyber_lavender", "emerald_glow", "stark_arc"), etc.',
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
                } else if (name === 'makeCall') {
                  resultMessage = `Holographic call patched through to ${args?.contactName || 'requested contact'}. Comms active.`;
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
          message: mode === 'jarvis' ? 'J.A.R.V.I.S. protocols online and at your service, sir.' : `Connected to UMNG Assistant Live Voice API (${persona} persona)!`,
          mode,
          persona,
          voice: voiceName,
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

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`[SERVER] UMNG Assistant server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Failed to start server:', err);
});
