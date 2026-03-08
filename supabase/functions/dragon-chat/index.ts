import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RPC_URL = "https://testnet-rpc.iopn.tech";

const CONTRACTS = {
  FACTORY: "0x266174ba738E757AA82398E7b0dd3D7840ed6232",
  WETH: "0xBc022C9dEb5AF250A526321d16Ef52E39b4DBD84",
};

const TOKENS: Record<string, { address: string; decimals: number }> = {
  DRAGON: { address: "0xFF3191bEE1640610CFA5338430f7F07CC9f5E1FF", decimals: 18 },
  BNB: { address: "0x0800e7438013A0ffEf305B0977760Ed7FfEEfa84", decimals: 18 },
  ETH: { address: "0x4b160BC86837898cc462fb6BA6e45cBC0f4BcDB5", decimals: 18 },
  MON: { address: "0x4D4C72C6f83A8ec651e4b1a5A825EAE15503DBaF", decimals: 18 },
  HYPE: { address: "0xBcfc4eC8E155c238501F0ca8DDfa0E33231eC87c", decimals: 18 },
};

// Minimal ABI encoding helpers
function encodeFunctionCall(sig: string, args: string[]): string {
  const hash = sig; // pre-computed selector
  return hash + args.map(a => a.replace("0x", "").toLowerCase().padStart(64, "0")).join("");
}

async function ethCall(to: string, data: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout per RPC call
  try {
    const resp = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, "latest"] }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const json = await resp.json();
    return json.result || "0x";
  } catch {
    clearTimeout(timeout);
    return "0x";
  }
}

function hexToBigInt(hex: string): bigint {
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

function formatUnits(val: bigint, decimals: number): number {
  const str = val.toString();
  if (str.length <= decimals) return parseFloat("0." + str.padStart(decimals, "0"));
  const intPart = str.slice(0, str.length - decimals);
  const fracPart = str.slice(str.length - decimals);
  return parseFloat(intPart + "." + fracPart);
}

// getPair(address,address) selector = 0xe6a43905
async function getPairAddress(tokenA: string, tokenB: string): Promise<string> {
  const data = encodeFunctionCall("0xe6a43905", [tokenA, tokenB]);
  const result = await ethCall(CONTRACTS.FACTORY, data);
  if (!result || result === "0x" || result === "0x" + "0".repeat(64)) return "";
  return "0x" + result.slice(26);
}

// getReserves() selector = 0x0902f1ac
// token0() selector = 0x0dfe1681
async function getReservesAndToken0(pairAddress: string): Promise<{ reserve0: bigint; reserve1: bigint; token0: string } | null> {
  try {
    const [reservesHex, token0Hex] = await Promise.all([
      ethCall(pairAddress, "0x0902f1ac"),
      ethCall(pairAddress, "0x0dfe1681"),
    ]);
    if (!reservesHex || reservesHex.length < 130) return null;
    const reserve0 = hexToBigInt("0x" + reservesHex.slice(2, 66));
    const reserve1 = hexToBigInt("0x" + reservesHex.slice(66, 130));
    const token0 = "0x" + token0Hex.slice(26);
    return { reserve0, reserve1, token0 };
  } catch {
    return null;
  }
}

async function fetchPrices(): Promise<Record<string, number>> {
  const prices: Record<string, number> = { OPN: 1.0, WOPN: 1.0 };

  const entries = Object.entries(TOKENS);
  const results = await Promise.allSettled(
    entries.map(async ([symbol, { address, decimals }]) => {
      const pairAddr = await getPairAddress(CONTRACTS.WETH, address);
      if (!pairAddr || pairAddr === "0x" + "0".repeat(40)) return { symbol, price: 0 };
      const data = await getReservesAndToken0(pairAddr);
      if (!data || data.reserve0 === 0n || data.reserve1 === 0n) return { symbol, price: 0 };

      const isWopnToken0 = data.token0.toLowerCase() === CONTRACTS.WETH.toLowerCase();
      const wopnReserve = formatUnits(isWopnToken0 ? data.reserve0 : data.reserve1, 18);
      const tokenReserve = formatUnits(isWopnToken0 ? data.reserve1 : data.reserve0, decimals);

      return { symbol, price: tokenReserve > 0 ? wopnReserve / tokenReserve : 0 };
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value.price > 0) {
      prices[r.value.symbol] = r.value.price;
    }
  }

  return prices;
}

function buildPriceContext(prices: Record<string, number>): string {
  const lines = Object.entries(prices)
    .map(([sym, p]) => `  ${sym}: $${p < 0.01 ? p.toFixed(6) : p.toFixed(4)}`)
    .join("\n");
  return `\n\n📊 CURRENT REAL-TIME TOKEN PRICES (from on-chain pool reserves, base currency OPN = $1.00):\n${lines}\n\nWhen users ask about prices, use these EXACT real-time values. Mention that prices are from on-chain liquidity pool reserves.`;
}

const SYSTEM_PROMPT = `You are DragonBot 🐉, the official AI assistant for DragonDEX — a decentralized exchange on the OPN Network (Chain ID: 984).

PERSONALITY: Friendly, knowledgeable, slightly mystical with dragon-themed flair. Use dragon/fire metaphors occasionally but stay helpful and clear. You're like a wise dragon guiding adventurers through the DeFi realm.

LANGUAGE: ALWAYS reply in the same language the user writes. If they write Indonesian, reply in Indonesian. If English, reply in English. Auto-detect the language.

EXPERTISE - You are a DeFi expert who helps with:
- Token swapping with optimal routing (direct & multi-hop)
- Liquidity pool mechanics (constant product formula: x*y=k)
- Real-time on-chain token prices from pool reserves
- Impermanent loss calculations and risk assessment
- Slippage, price impact, and MEV protection concepts
- Portfolio analysis and LP position tracking
- OPN Testnet network details and wallet setup
- Smart contract addresses and verification

ON-CHAIN ANALYSIS: When users ask about prices, provide detailed analysis:
- Compare token ratios across different pools
- Explain price derivation from reserves (price = reserveA / reserveB)
- Note liquidity depth and its impact on trading
- Warn about low liquidity pools and high slippage scenarios

KEY PLATFORM FEATURES:
- Token Swap with best route optimization (direct + multi-hop)
- Liquidity Pools with 0.3% fee earning
- Portfolio tracking with real-time balances
- Analytics dashboard with volume & TVL data
- DragonBot AI assistant (you!) with live on-chain data

NETWORK INFO:
- Chain: OPN Testnet (Chain ID: 984)
- RPC: https://testnet-rpc.iopn.tech
- Explorer: https://testnet.iopn.tech
- Native Token: OPN
- Protocol: UniswapV2 AMM (0.3% fee)

ACTIONS: When relevant, include action buttons:
[ACTIONS]
{"label":"Swap OPN → DRAGON","action":"swap","from":"OPN","to":"DRAGON"}
{"label":"Add Liquidity","action":"navigate","path":"/liquidity"}
{"label":"View Pools","action":"navigate","path":"/pools"}
{"label":"View Analytics","action":"navigate","path":"/analytics"}
{"label":"View Portfolio","action":"navigate","path":"/portfolio"}
{"label":"Read Docs","action":"navigate","path":"/docs"}
[/ACTIONS]

ACTION RULES:
- Only include 1-3 relevant action buttons per response
- For swap: use "action":"swap" with "from" and "to" (OPN, WOPN, DRAGON, BNB, ETH, MON, HYPE)
- For navigation: use "action":"navigate" with "path"
- Place ACTIONS block BEFORE SUGGESTIONS block
- Each line inside [ACTIONS] must be valid JSON

FORMATTING:
- Use **bold** for emphasis and key terms
- Use \`code\` for addresses, numbers, formulas
- Use bullet points for lists
- Keep responses concise but comprehensive
- Use emojis sparingly for visual appeal

IMPORTANT: End EVERY response with exactly 3 follow-up suggestions:
[SUGGESTIONS]
suggestion 1 text here
suggestion 2 text here
suggestion 3 text here
[/SUGGESTIONS]

Suggestions should be natural follow-ups, under 40 chars, in the user's language.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch real-time prices in parallel
    let priceContext = "";
    try {
      const prices = await fetchPrices();
      priceContext = buildPriceContext(prices);
    } catch (e) {
      console.error("Price fetch error:", e);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + priceContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("dragon-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
