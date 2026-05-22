# Plan: Premium Farming, Portfolio Send, Wallet Modal & AI Agent DEX

## 1. Farming Page — Token Logos & Penyempurnaan
- Tambah avatar/logo token (staking & reward) di setiap farm card menggunakan `getTokenByAddress` + `logoURI` dari `TOKEN_LIST`.
- Tampilkan dual-token chip (staking ⇄ reward) di header card dengan ring gradient.
- Tambah indikator status: Active/Inactive (berdasarkan `rewardPerBlock > 0`).
- Perbaiki tampilan stats (RPB, Staked, TVL) dengan icon yang lebih jelas dan logo reward token di samping pending reward.
- Tombol Harvest hanya aktif saat `pending > 0`.

## 2. Portfolio — Send Token per Row
- Tambah tombol "Send" di setiap baris token di Portfolio.
- Gunakan komponen `SendTokenModal` yang sudah ada (pre-select token saat dibuka dari row).
- Support native OPN (gunakan `sendTransaction`) dan ERC-20 (gunakan `writeContract` transfer).
- Validasi: address checksum, amount ≤ balance, gas reserve untuk native.

## 3. Wallet Connect Modal — Redesign (sesuai gambar 2)
- Header: "Connect a wallet" + tombol close.
- Section 1 — **Detected wallet** (highlight gradient ungu→pink) jika `window.ethereum` / `window.rabby` / `window.keplr` terdeteksi, badge "DETECTED".
- Section 2 — **Mobile QR option** ("ORVEX Mobile" → ganti "DragonDEX Mobile", badge "SOON", disabled).
- Section 3 — **OTHER WALLETS** dengan search input dan list:
  - Rabby, Keplr, SubWallet (badge "Detected" hijau jika ada)
  - MetaMask ("Popular")
  - OKX Wallet, Bitget Wallet
- Footer: ToS + Privacy link.
- Deteksi wallet via `window.ethereum.isRabby/isMetaMask/isOkxWallet/isBitKeep` dan injected providers.
- Style: dark glassmorphism, rounded-2xl, gradient ungu untuk detected card.

## 4. DragonBot → AI Agent dengan Tool Calling
Upgrade edge function `dragon-chat` agar AI bisa **eksekusi aksi on-chain** lewat tool-calling, lalu frontend yang melakukan transaksi.

### Tools yang di-expose ke LLM (Lovable AI Gateway, `google/gemini-2.5-flash`):
- `swap_tokens({ fromSymbol, toSymbol, amount, slippage? })`
- `add_liquidity({ tokenA, tokenB, amountA, amountB })`
- `remove_liquidity({ tokenA, tokenB, lpAmount })`
- `farm_stake({ pid, amount })` / `farm_unstake({ pid, amount })` / `farm_harvest({ pid })` / `farm_emergency({ pid })`
- `list_pools()`, `list_farms()`, `get_balance({ symbol })`, `get_pending_reward({ pid })`
- `wrap_opn({ amount })` / `unwrap_opn({ amount })`

### Flow:
1. User chat → edge function streaming dengan tools schema.
2. LLM panggil tool → frontend tangkap `tool_call` event → munculkan **Action Confirmation Card** (pretty card showing token logos, amounts, route, slippage, estimated gas).
3. User klik **Confirm** → eksekusi via hook yang sudah ada (`useSwapRouter`, `useLiquidityPools`, `useFarmingActions`).
4. Hasil tx hash → kirim balik ke LLM via `tool` role message → AI lanjut respond dengan link explorer.

### UI Chat Improvements:
- Header chat: avatar dragon animated, status "Online · Agent Mode".
- Bubble messages: glassmorphism, role-based color (user: red gradient, agent: dark glass + dragon icon).
- Quick-action chips di bawah input: "Swap", "Add LP", "Stake", "My Balance".
- Render Action Cards inline dengan token logos, badge "Pending Confirmation", tombol Confirm/Cancel.
- Tool execution status: ⏳ Pending → 🔄 Executing → ✅ Done (with tx link).
- Markdown rendering via `react-markdown`.
- Typing indicator dengan 3 dots animasi.

## Technical Notes
- Tool calling: payload `body.tools` di-pass ke gateway; karena Gemini support OpenAI-compatible tool calling, parse `tool_calls` dari stream.
- Action execution di client-side (bukan di edge function) karena butuh wallet signing.
- State machine per message untuk track tool call lifecycle.
- Reuse existing hooks — tidak duplikasi logic kontrak.

## Files yang akan dibuat/diubah
**Baru:**
- `src/components/chat/AgentActionCard.tsx`
- `src/components/chat/agentTools.ts` (tool schemas + executor map)
- `src/hooks/useAgentExecutor.ts`
- `src/components/portfolio/PortfolioSendButton.tsx` (wrapper kecil)

**Diubah:**
- `src/pages/Farming.tsx` (logos)
- `src/pages/Portfolio.tsx` (send button per row)
- `src/components/wallet/WalletConnectModal.tsx` (redesign)
- `src/components/chat/DragonBot.tsx` (UI + agent loop)
- `supabase/functions/dragon-chat/index.ts` (tools schema + streaming tool_calls)

## Eksekusi
Saya akan kerjakan berurutan: **(1) Farming logos → (2) Portfolio Send → (3) Wallet Modal → (4) AI Agent**. Setiap step diverifikasi sebelum lanjut.
