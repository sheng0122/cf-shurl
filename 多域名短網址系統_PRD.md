# 多域名短網址系統 - 產品需求文件 (PRD)

> 文件版本：1.1  
> 建立日期：2025-05  
> 專案類型：內部工具  
> 技術架構：Cloudflare Serverless

---

## 1. 專案概述

### 1.1 專案目標

建立一套自有品牌的短網址服務系統，支援多個自訂域名，透過 Cloudflare 無伺服器架構實現低成本、高可用性的解決方案。除了基本的短網址功能外，還包含 QR Code 生成、自訂 Open Graph 社群預覽等進階功能。

### 1.2 使用場景

- **品牌行銷**：使用自有品牌域名建立專屬短網址，提升品牌識別度
- **多品牌管理**：同時管理多個品牌的短網址域名
- **社群分享優化**：自訂 OG 標籤，控制在 Facebook、LINE、Twitter 等平台的預覽呈現
- **線下導流**：生成 QR Code 用於印刷品、海報、產品包裝
- **連結追蹤**：基本的點擊統計功能
- **內部使用**：非公開註冊服務，僅供內部建立短網址

### 1.3 預估流量

| 指標 | 數值 |
|------|------|
| 每日請求數 | 數千至十萬次 |
| 尖峰 QPS | 約 1-2 次/秒 (平均) |
| 短網址數量 | 初期數百至數千筆 |

---

## 2. 功能規格

### 2.1 核心功能

#### 短網址建立與管理

- 輸入長網址，自動或手動產生短碼
- 支援自訂短碼（需檢查重複）
- 選擇要使用的短網址域名
- 編輯、刪除已建立的短網址
- 搜尋與篩選功能

#### 短網址跳轉

- 302 或 301 redirect（可設定）
- 支援多域名
- 短碼不存在時顯示 404 頁面

### 2.2 QR Code 功能

#### 基本生成

- 每個短網址自動生成對應的 QR Code
- 支援下載 PNG / SVG 格式
- 可調整尺寸（小 / 中 / 大 / 自訂像素）

#### 樣式自訂（進階）

| 選項 | 說明 |
|------|------|
| 前景色 | QR Code 點陣顏色 |
| 背景色 | QR Code 背景顏色 |
| Logo 嵌入 | 在 QR Code 中央放置品牌 Logo |
| 圓角樣式 | 方形或圓角點陣 |
| 邊框留白 | 調整 QR Code 周圍的空白區域 |

#### 技術實作

```
前端生成方案（建議）：
- 使用 qrcode.js 或 QRCode.react
- 即時預覽，不需後端運算
- 下載時在瀏覽器端產生圖檔

後端生成方案（備選）：
- 使用 Worker 搭配 qr-image 或類似套件
- 適合需要大量批次生成的場景
```

### 2.3 Open Graph 自訂功能

#### 為什麼需要這個功能

當短網址被分享到社群平台時，平台會抓取目標網頁的 OG 標籤來顯示預覽。但有時候：

- 目標網頁沒有設定 OG 標籤
- 想要顯示不同於原網頁的預覽內容
- 想要針對不同活動客製化預覽

#### 自訂 OG 欄位

| 欄位 | 說明 | 範例 |
|------|------|------|
| og:title | 預覽標題 | 「限時優惠 - 全館 5 折」 |
| og:description | 預覽描述 | 「活動只到本週日，立即搶購！」 |
| og:image | 預覽圖片 | 上傳或輸入圖片網址 |
| og:site_name | 網站名稱 | 「品牌名稱」 |
| twitter:card | Twitter 卡片類型 | summary / summary_large_image |

#### 運作流程

```
一般瀏覽器訪問：
用戶 → 短網址 → 直接 302 redirect → 目標網址

社群爬蟲訪問：
爬蟲 → 短網址 → 回傳自訂 OG 的 HTML 頁面
                 （含 meta refresh 或 canonical）
```

#### 爬蟲偵測

需要辨識的社群爬蟲 User-Agent：

```javascript
const SOCIAL_BOTS = [
  'facebookexternalhit',    // Facebook
  'Facebot',                // Facebook
  'LinkedInBot',            // LinkedIn
  'Twitterbot',             // Twitter/X
  'Slackbot',               // Slack
  'TelegramBot',            // Telegram
  'Discordbot',             // Discord
  'LINE',                   // LINE
  'WhatsApp',               // WhatsApp
  'Googlebot',              // Google（搜尋預覽）
];
```

#### OG 預覽頁面範本

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{og:title}</title>
  
  <!-- Open Graph -->
  <meta property="og:title" content="{og:title}">
  <meta property="og:description" content="{og:description}">
  <meta property="og:image" content="{og:image}">
  <meta property="og:url" content="{短網址}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="{og:site_name}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="{twitter:card}">
  <meta name="twitter:title" content="{og:title}">
  <meta name="twitter:description" content="{og:description}">
  <meta name="twitter:image" content="{og:image}">
  
  <!-- Redirect for browsers -->
  <meta http-equiv="refresh" content="0;url={目標網址}">
  <link rel="canonical" href="{目標網址}">
</head>
<body>
  <p>正在跳轉至 <a href="{目標網址}">{目標網址}</a></p>
</body>
</html>
```

### 2.4 OG 圖片處理

#### 圖片來源選項

1. **輸入圖片網址** - 直接使用外部圖片
2. **上傳圖片** - 儲存到 Cloudflare R2 或 Images
3. **自動抓取** - 從目標網頁抓取現有 OG 圖片

#### 圖片規格建議

| 平台 | 建議尺寸 | 比例 |
|------|----------|------|
| Facebook | 1200 x 630 px | 1.91:1 |
| Twitter | 1200 x 628 px | 1.91:1 |
| LINE | 1200 x 630 px | 1.91:1 |
| LinkedIn | 1200 x 627 px | 1.91:1 |

#### 進階功能（可選）

- **OG 圖片產生器**：用範本 + 文字動態生成圖片
- **圖片尺寸自動調整**：上傳後自動裁切/縮放

---

## 3. 技術架構

### 3.1 架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                        使用者/爬蟲請求                           │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌─────────────────────┐             ┌─────────────────────┐
│   短網址域名         │             │   管理後台域名       │
│   link.brand.com    │             │   admin.brand.com   │
└─────────────────────┘             └─────────────────────┘
            │                                   │
            ▼                                   ▼
┌─────────────────────┐             ┌─────────────────────┐
│  Cloudflare Worker  │             │  Cloudflare Access  │
│  - 偵測 User-Agent  │             │    (身份驗證)        │
│  - 一般: redirect   │             └─────────────────────┘
│  - 爬蟲: 回傳 OG    │                         │
└─────────────────────┘                         ▼
            │                       ┌─────────────────────┐
            │                       │  Cloudflare Pages   │
            │                       │  (前端 + Functions) │
            │                       └─────────────────────┘
            │                                   │
            └───────────────┬───────────────────┘
                            ▼
                ┌─────────────────────┐
                │   Cloudflare KV     │
                │   (資料儲存)         │
                └─────────────────────┘
                            │
                            ▼
                ┌─────────────────────┐
                │   Cloudflare R2     │
                │  (OG 圖片儲存,可選) │
                └─────────────────────┘
```

### 3.2 核心組件

| 組件 | 用途 |
|------|------|
| Cloudflare Workers | 處理短網址 redirect、偵測爬蟲、回傳 OG 頁面 |
| Cloudflare KV | 儲存短網址資料（含 OG 設定） |
| Cloudflare Pages | 託管管理後台前端介面 |
| Pages Functions | 管理後台的 API 端點 |
| Cloudflare Access | 後台身份驗證與存取控制 |
| Cloudflare R2（可選） | 儲存上傳的 OG 圖片 |

### 3.3 Redirect Worker 邏輯

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const code = url.pathname.slice(1);
    
    if (!code) {
      return new Response('Not found', { status: 404 });
    }
    
    // 從 KV 取得短網址資料
    const data = await env.LINKS.get(code, 'json');
    
    if (!data) {
      return new Response('Not found', { status: 404 });
    }
    
    // 檢查是否為社群爬蟲
    const userAgent = request.headers.get('User-Agent') || '';
    const isBot = isSocialBot(userAgent);
    
    // 如果是爬蟲且有自訂 OG，回傳 OG 頁面
    if (isBot && data.og && data.og.enabled) {
      return new Response(generateOGPage(data), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // 一般訪問，直接 redirect
    return Response.redirect(data.url, 302);
  }
};

function isSocialBot(userAgent) {
  const bots = [
    'facebookexternalhit', 'Facebot', 'LinkedInBot', 
    'Twitterbot', 'Slackbot', 'TelegramBot', 
    'Discordbot', 'LINE', 'WhatsApp'
  ];
  return bots.some(bot => userAgent.includes(bot));
}

function generateOGPage(data) {
  const { url, og } = data;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${og.title || ''}</title>
  <meta property="og:title" content="${og.title || ''}">
  <meta property="og:description" content="${og.description || ''}">
  <meta property="og:image" content="${og.image || ''}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="${og.twitterCard || 'summary_large_image'}">
  <meta http-equiv="refresh" content="0;url=${url}">
  <link rel="canonical" href="${url}">
</head>
<body>
  <p>Redirecting to <a href="${url}">${url}</a></p>
</body>
</html>`;
}
```

---

## 4. 資料結構

### 4.1 KV 儲存格式

```javascript
// Key: 短碼 (例如 "abc123")
// Value: JSON 字串

{
  // 基本資訊
  "url": "https://example.com/original-url",
  "domain": "link.brand.com",
  "createdAt": "2025-05-20T10:30:00Z",
  "updatedAt": "2025-05-20T10:30:00Z",
  
  // 統計（可選）
  "clicks": 0,
  
  // Open Graph 設定
  "og": {
    "enabled": true,
    "title": "自訂標題",
    "description": "自訂描述文字",
    "image": "https://r2.example.com/og-images/abc123.jpg",
    "siteName": "品牌名稱",
    "twitterCard": "summary_large_image"
  },
  
  // QR Code 設定（儲存自訂樣式）
  "qr": {
    "foreground": "#000000",
    "background": "#FFFFFF",
    "logo": "https://r2.example.com/logos/brand.png",
    "style": "rounded"
  }
}
```

### 4.2 索引結構

```javascript
// Key: "_index"
// Value: 所有短碼的陣列（用於列表功能）

["abc123", "xyz789", "hello", ...]

// 或使用 KV list() API 搭配 prefix
// 但 list() 有效能限制，大量資料建議維護索引
```

---

## 5. API 規格

### 5.1 端點總覽

| 方法 | 端點 | 功能 |
|------|------|------|
| POST | /api/links | 建立新短網址 |
| GET | /api/links | 列出所有短網址 |
| GET | /api/links/:code | 取得單一短網址資訊 |
| PUT | /api/links/:code | 更新短網址（含 OG 設定） |
| DELETE | /api/links/:code | 刪除短網址 |
| POST | /api/links/:code/qr | 生成 QR Code |
| POST | /api/og/preview | 預覽 OG 設定效果 |
| POST | /api/upload/image | 上傳 OG 圖片 |

### 5.2 建立短網址

**Request**

```http
POST /api/links
Content-Type: application/json

{
  "url": "https://example.com/very-long-url",
  "domain": "link.brand.com",
  "customCode": "my-link",
  "og": {
    "enabled": true,
    "title": "限時優惠",
    "description": "全館商品 5 折起",
    "image": "https://example.com/promo.jpg"
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "code": "my-link",
    "shortUrl": "https://link.brand.com/my-link",
    "originalUrl": "https://example.com/very-long-url",
    "domain": "link.brand.com",
    "og": {
      "enabled": true,
      "title": "限時優惠",
      "description": "全館商品 5 折起",
      "image": "https://example.com/promo.jpg"
    },
    "createdAt": "2025-05-20T10:30:00Z"
  }
}
```

### 5.3 更新 OG 設定

**Request**

```http
PUT /api/links/my-link
Content-Type: application/json

{
  "og": {
    "enabled": true,
    "title": "新標題",
    "description": "新描述",
    "image": "https://example.com/new-image.jpg"
  }
}
```

---

## 6. 安全性設計

### 6.1 身份驗證

使用 Cloudflare Access 保護管理後台：

- 建立 Access Application 保護後台域名
- 設定存取政策：僅允許特定 email
- 驗證方式：Email OTP、Google 登入、GitHub 等
- 自動產生 audit log

### 6.2 輸入驗證

| 驗證項目 | 規則 |
|----------|------|
| URL 格式 | 必須是有效的 URL |
| 協議限制 | 僅允許 http:// 和 https:// |
| URL 長度 | 不超過 2048 字元 |
| 短碼格式 | 僅允許英數字和 - _ |
| 短碼長度 | 3-32 字元 |
| OG 標題 | 不超過 100 字元 |
| OG 描述 | 不超過 300 字元 |
| 圖片格式 | jpg, png, gif, webp |
| 圖片大小 | 不超過 5MB |

### 6.3 Rate Limiting

- 建立短網址：每 IP 每分鐘 10 次
- 圖片上傳：每 IP 每分鐘 5 次
- QR Code 生成：無限制（前端生成）

---

## 7. 成本估算

### 7.1 Cloudflare 免費額度

| 項目 | 免費額度 | 預估使用 |
|------|----------|----------|
| Workers 請求 | 100,000 次/天 | < 100,000 |
| KV 讀取 | 100,000 次/天 | < 100,000 |
| KV 寫入 | 1,000 次/天 | < 100 |
| KV 儲存 | 1 GB | < 100 MB |
| R2 儲存 | 10 GB/月 | < 1 GB |
| R2 操作 | Class A: 1M, Class B: 10M | 極少 |

### 7.2 預估月費

| 項目 | 費用 |
|------|------|
| Cloudflare 服務 | 免費 |
| 域名 | $10-15 USD/年/個 |
| 總計 | 約 $0-5 USD/月 |

---

## 8. 開發階段

### Phase 1：核心功能

1. 設定 Cloudflare 帳號與 KV
2. 開發 Redirect Worker（基本版）
3. 開發管理 API (CRUD)
4. 開發基本前端介面
5. 部署並測試

### Phase 2：QR Code

1. 整合 QR Code 生成套件
2. 前端 QR Code 預覽與下載
3. 自訂樣式功能（顏色、Logo）

### Phase 3：Open Graph

1. Worker 加入爬蟲偵測
2. OG 頁面生成邏輯
3. 後台 OG 編輯介面
4. OG 預覽功能
5. 圖片上傳功能（R2）

### Phase 4：優化

1. 統計功能
2. 批次建立短網址
3. API 匯出
4. 效能監控

---

## 9. 常見問題

### Q: 為什麼要自己偵測爬蟲而不是用現成服務？

A: 現成服務（如 Bitly）無法自訂 OG 內容。自建系統可以完全控制爬蟲看到的預覽內容，這對行銷活動非常重要。

### Q: OG 圖片應該存在哪裡？

A: 建議使用 Cloudflare R2，與其他 Cloudflare 服務整合度高，且有免費額度。也可以使用現有的 CDN 或圖床。

### Q: QR Code 要前端還是後端生成？

A: 建議前端生成。這樣不消耗 Worker 運算資源，使用者可以即時調整樣式並預覽，體驗更好。

### Q: 社群平台會快取 OG 預覽嗎？

A: 會。Facebook、LINE 等平台會快取抓取結果。更新 OG 後需要手動清除快取：
- Facebook: https://developers.facebook.com/tools/debug/
- LINE: 無官方工具，約 1-7 天自動更新
- Twitter: https://cards-dev.twitter.com/validator

---

## 10. 參考資源

### 技術文件

- [Cloudflare Workers 文件](https://developers.cloudflare.com/workers/)
- [Cloudflare KV 文件](https://developers.cloudflare.com/kv/)
- [Cloudflare Pages 文件](https://developers.cloudflare.com/pages/)
- [Cloudflare R2 文件](https://developers.cloudflare.com/r2/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards 文件](https://developer.twitter.com/en/docs/twitter-for-websites/cards)

### 測試工具

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Open Graph 檢查工具](https://www.opengraph.xyz/)

---

*文件結束*
