# Plan: DragonDEX Premium Enhancement

## Status Awal (Sudah Implementasi)

| Area | Status | Keterangan |
|------|--------|------------|
| Home + 3D Token Globe | Selesai | Seamless background, crossing orbit rings dengan token logos |
| Swap (Multi-hop routing, OPN/WOPN wrap) | Selesai | Slippage auto, price impact, gas safety |
| Liquidity (Add/Remove) | Selesai | Auto-calculation, allowance flow |
| Pools (Grid/List view, search, sort) | Selesai | TVL, APR, pair explorer links |
| Farming (MasterChef) | Selesai | Token logos, APR, stake/unstake/harvest, admin panel |
| Portfolio (Overview/Assets/LP/History) | Selesai | Allocation chart, LP positions, transaction history, Send modal |
| Analytics (Overview/Pools/Tokens) | Selesai | TVL distribution chart, top pools, token prices |
| Docs / FAQ | Selesai | FAQPage JSON-LD structured data |
| DragonBot AI Chat | Selesai | Streaming chat, voice input, Agent Action Cards, tool execution |
| Wallet Connect Modal | Selesai | Multi-wallet detection (Rabby, MetaMask, OKX, Bitget, etc.) |
| SEO (Helmet, Sitemap, Robots) | Selesai | Per-route meta tags, canonical, OG/Twitter cards |
| Security Audit | Selesai | Tidak ada findings |
| Performance Audit | Selesai | Route lazy-loading, 3D globe lazy-loaded off critical path |

---

## Step 1: Branding Visual Polish

Tujuan: Seragamkan dan tingkatkan kualitas visual di semua halaman agar terasa "premium" dan konsisten.

### 1a. Design Token Audit & Consistency
- Audit semua file di `src/pages/` dan `src/components/` untuk memastikan tidak ada hardcoded colors (text-white, bg-black, dll).
- Semua warna harus pakai semantic tokens: `--primary`, `--accent`, `--muted`, `--dragon-gold`, `--gradient-aurora`.
- Ganti sisa inline styles atau arbitrary Tailwind values yang melanggar design system.

### 1b. Page Header Unification
Setiap page hero sekarang punya style berbeda-beda. Seragamkan menjadi:
- `ember-pill` badge dengan icon tematik
- `font-display gradient-text` h1
- Subtitle dengan `text-muted-foreground`
- Semua page pakai pattern yang identik (Swap, Liquidity, Pools, Farming, Portfolio, Analytics, Docs).

### 1c. Card & Surface Polish
- Pastikan semua card utama pakai `glass-card` atau `bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl`.
- Border beam / glow effects konsisten pada stat cards dan summary cards.
- Hover states seragam: `whileHover={{ y: -4 }}` pada card interactable.

### 1d. Loading States & Empty States
- Swap page: skeleton loader saat route data loading.
- Liquidity page: skeleton untuk pair info dan allowance states.
- Farming: skeleton farm cards saat pools loading.
- Portfolio: sudah ada skeleton, perlu ditambah untuk LP positions dan history tabs.
- Analytics: skeleton untuk chart area dan table rows.

### 1e. Custom Scrollbar & Micro-interactions
- Scrollbar custom themed (thin, primary color thumb).
- Toast notifications pakai style dragon theme.
- Button hover glow effects konsisten.

---

## Step 2: Feature Completeness Audit & Fill Gaps

### 2a. Swap Page
- **Price chart mini**: Tambahkan sparkline chart 24h per token (dummy data atau on-chain candle simulasi).
- **Recent swaps sidebar**: Tampilkan recent swaps dari localStorage transaction history.
- **Token info panel**: Show market cap, circulating supply (dummy data untuk testnet).
- **Slippage warning modal**: Jika price impact > 5%, konfirmasi ekstra sebelum sign.

### 2b. Liquidity Page
- **Pool share preview**: Sebelum add liquidity, tampilkan preview "You will own ~X% of pool".
- **Price ratio display**: Tampilkan current price A/B dan B/A di atas input.
- **Remove liquidity preview**: Tampilkan estimasi token A dan B yang akan diterima saat remove.
- **Zap feature (simplified)**: One-click add liquidity dengan single token (optional jika wagmi hooks mendukung).

### 2c. Pools Page
- **Volume 24h**: Tampilkan estimasi volume (bisa dari localStorage swap history per pool).
- **APR calculation**: Hitung APR dari fee 0.3% * volume / TVL.
- **Add liquidity CTA per pool**: Tombol "Add Liquidity" langsung redirect ke /liquidity dengan token pre-selected.

### 2d. Farming Page
- **Historical APR chart**: Sparkline APR per farm (simulasi/testnet data).
- **Compounding calculator**: Input untuk simulasi compound reward over time.
- **Farm search & filter**: Search bar dan filter (Active/Paused/My Farms).

### 2e. Portfolio Page
- **PNL tracking**: Track profit/loss per token berdasarkan average buy price (dari swap history).
- **Export CSV**: Export transaction history ke CSV.
- **NFT display**: Placeholder untuk NFT holdings (jika ada).

### 2f. Analytics Page
- **Volume chart**: Weekly/monthly volume bar chart (aggregate dari swap history).
- **Price change %**: Token price movement indicator (up/down %).
- **Top movers**: Tokens dengan perubahan harga terbesar.

### 2g. Docs Page
- **Interactive guides**: Step-by-step visual guide untuk Swap, Add Liquidity, Stake.
- **Video embed placeholder**: Slot untuk tutorial video.
- **Search FAQ**: Client-side search filter untuk FAQ.

---

## Step 3: Performance Optimization (Round 2)

Tujuan: Turunkan FCP dan TTI lebih jauh.

### 3a. Bundle Analysis
- Jalankan `bunx vite-bundle-visualizer` untuk identifikasi largest chunks.
- Split vendor chunks: `react`, `wagmi/viem`, `framer-motion`, `three` masing-masing chunk terpisah.

### 3b. Image Optimization
- Semua token logos: preload critical logos (OPN, WOPN, DRAGON).
- Lazy-load token logos di Farming dan Pools dengan `loading="lazy"`.
- Consider WebP/AVIF untuk background images jika ada.

### 3c. Code Splitting Components
- `recharts` hanya di-import di Analytics dan Portfolio (sudah lazy route, cek apakah chart lib tree-shakeable).
- `react-markdown` hanya di DragonBot (sudah lazy? Cek chunk).

### 3d. Caching Strategy
- Service worker placeholder untuk asset caching (opsional, bisa pakai Vite PWA plugin).

---

## Step 4: Security Hardening (Round 2)

Meskipun scan bersih, ada defense-in-depth yang bisa ditingkatkan:

### 4a. Input Sanitization Audit
- Audit semua `<Input>` yang menerima amount/address: pastikan pakai `sanitizeAmountInput` dan `isAddress` validation.
- Swap slippage input: batasi max 50%.
- Deadline/approval amount: pastikan pakai `getSafeDeadline` dan `getSafeApprovalAmount`.

### 4b. Transaction Safety
- Swap dengan amount besar (> $10k equivalent): tambah double-confirm modal.
- Emergency withdraw: konfirmasi explicit dengan checkbox "I understand I will forfeit all pending rewards".
- Native token MAX button: pastikan selalu reserve gas (sudah ada, audit kembali).

### 4c. Client-Side Rate Limiting
- Rate limit pada tombol swap/stake: disabled selama 3 detik setelah tx submitted.
- Prevent double-click pada semua tx button.

### 4d. URL Security
- Semua `window.open` ke explorer harus pakai `noopener noreferrer`.
- Tidak ada `eval()` atau `dangerouslySetInnerHTML` (kecuali react-markdown, sudah aman).

---

## Step 5: Final Integration Testing

### 5a. Cross-Page Flow Test
1. User swap OPN -> DRAGON
2. Add liquidity OPN/DRAGON
3. Stake LP di Farming
4. Check Portfolio (LP + Farming posisi muncul)
5. Check Analytics (TVL naik)
6. Check History (4 tx muncul)

### 5b. Responsive Audit
- Test setiap page di mobile viewport (375px, 768px, 1440px).
- Pastikan 3D globe tidak menyebabkan horizontal scroll atau performance jank di mobile.
- Tab navigasi di Portfolio dan Analytics tidak overflow di mobile.

### 5c. Accessibility Audit
- Semua `<img>` harus punya `alt` text (cek token logos).
- Focus states pada semua interactive elements.
- Color contrast ratio minimal 4.5:1 pada body text.

---

## Eksekusi
Urutan rekomendasi:
1. Step 1 (Branding polish) → Impact visual paling terasa
2. Step 2 (Feature gaps) → Fungsionalitas lengkap
3. Step 3 (Performance) → Speed final polish
4. Step 4 (Security) → Defense hardening
5. Step 5 (Testing) → QA sebelum publish

Setiap step akan diverifikasi dengan build check dan preview test sebelum lanjut.