import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/assistant', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(503).json({
          error:
            'Virtual Banker AI service requires a configured GEMINI_API_KEY in Settings > Secrets.',
        });
        return;
      }

      const { message, accountContext, history } = req.body ?? {};
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'A message string is required.' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contextSummary = accountContext
        ? `Customer Account Context:
- Holder: ${accountContext.holderName}
- NUBAN: ${accountContext.nuban}
- Account Type: ${accountContext.accountType} (${accountContext.tier})
- Current Balance (NGN): ${Number(accountContext.balanceNgn).toLocaleString('en-NG')}
- Daily Transfer Limit (NGN): ${Number(accountContext.dailyLimitNgn).toLocaleString('en-NG')}
- Card Status: ${accountContext.cardFrozen ? 'Frozen / Blocked' : 'Active'}
- Open Disputes: ${accountContext.disputeCount ?? 0}`
        : 'Customer is browsing as a guest (not yet signed into Internet Banking).';

      const conversationHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map(
              (item: { role?: string; text?: string }) =>
                `${item.role === 'user' ? 'User' : 'Kola'}: ${item.text ?? ''}`
            )
            .join('\n')
        : '';

      const systemInstruction = `You are Kola, the 24/7 Virtual Banking Assistant for Redcrest Digital Bank in Nigeria (modeled on UBA's Leo self-service assistant).
Be concise, courteous, accurate, and grounded in Nigerian banking rules (CBN Tier 1/2/3 KYC limits, NUBAN 10-digit accounts, NIP instant transfers, BVN/NIN/CAC onboarding, NDPA/NDPR privacy).
${contextSummary}

Decide the structured action to return:
- CHECK_BALANCE: when the user asks to check their balance or account status.
- BLOCK_CARD: when the user asks to block, freeze, or lock a lost/stolen debit card.
- UNBLOCK_CARD: when the user asks to unblock or unfreeze their card.
- LOG_DISPUTE: when the user reports a failed transfer, debited-not-credited ATM/POS/NIP error, or requests a transaction dispute ticket.
- NONE: for general questions (KYC tiers, BVN/NIN, NIP charges, USSD *9190#, branch hours, fraud reporting).

Keep replies under 80 words and practical.`;

      const prompt = conversationHistory
        ? `${conversationHistory}\nUser: ${message}`
        : message;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Concise, helpful response from Kola to the customer.',
              },
              action: {
                type: Type.STRING,
                enum: [
                  'NONE',
                  'CHECK_BALANCE',
                  'BLOCK_CARD',
                  'UNBLOCK_CARD',
                  'LOG_DISPUTE',
                ],
                description: 'Self-service banking action to execute in the UI.',
              },
              disputeSummary: {
                type: Type.STRING,
                description:
                  'Short summary of the failed transaction dispute if action is LOG_DISPUTE, otherwise empty string.',
              },
            },
            required: ['reply', 'action', 'disputeSummary'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({
          error: 'Empty response received from Virtual Banker AI model.',
        });
        return;
      }

      const parsed = JSON.parse(rawText) as {
        reply: string;
        action: string;
        disputeSummary?: string;
      };

      res.json(parsed);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unexpected server error.';
      console.error('Assistant API error:', errorMessage);
      res.status(500).json({
        error: errorMessage,
      });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Redcrest Digital Bank server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
