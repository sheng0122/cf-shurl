# Dub.co UI/UX 結構分析

基於 2025-11-27 截取的 Dub.co 後台介面截圖分析。

---

## 1. 整體佈局架構

### 1.1 主要佈局結構
```
┌─────────────────────────────────────────────────────────────┐
│  Icon Bar  │     Sidebar      │       Main Content          │
│   (~50px)  │    (~200px)      │        (剩餘寬度)            │
│            │                  │                             │
│  dub logo  │  Short Links     │  ┌─────────────────────┐   │
│  user      │  ├─ Links        │  │ Page Header + CTA   │   │
│  avatar    │  └─ Domains      │  ├─────────────────────┤   │
│            │                  │  │ Filter Bar          │   │
│  quick     │  Insights        │  ├─────────────────────┤   │
│  actions   │  ├─ Analytics    │  │                     │   │
│            │  ├─ Events       │  │ Content Area        │   │
│            │  └─ Customers    │  │                     │   │
│            │                  │  │                     │   │
│            │  Library         │  └─────────────────────┘   │
│            │  ├─ Folders      │                             │
│            │  ├─ Tags         │  ┌─────────────────────┐   │
│            │  └─ UTM Templates│  │ Pagination          │   │
│            │                  │  └─────────────────────┘   │
│  ─────────│  ─────────────── │                             │
│  Usage    │  Events: 1/1K    │                             │
│  section  │  Links: 1/25     │                             │
│            │                  │                             │
│  settings │  Get Dub Pro     │                             │
│  help     │  (CTA Button)    │                             │
│  user     │                  │                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 配色方案
- **背景**: 淺灰白 (#FAFAFA 或類似)
- **Sidebar 背景**: 純白 (#FFFFFF)
- **主要強調色**: 黑色 (#000000) 用於 CTA 按鈕
- **輔助色**: 綠色用於推廣提示 (Claim Domain Banner)
- **文字顏色**:
  - 主要: 黑色
  - 次要: 灰色 (#6B7280)
  - 連結: 藍色

### 1.3 設計特點
- 圓角卡片設計 (border-radius ~8-12px)
- 輕量陰影效果
- 乾淨的留白空間
- 一致的 Icon 風格 (線條風格)

---

## 2. 導航結構

### 2.1 左側 Icon Bar (最左側)
固定寬度的垂直圖標欄：
- **頂部**: Dub Logo + 用戶頭像
- **中間**: 快速操作圖標 (Integrations, Settings 等)
- **底部**: Settings, Help, User Profile

### 2.2 主 Sidebar
分組顯示的導航菜單：

**Short Links 分組**
- Links (連結圖標)
- Domains (地球圖標)

**Insights 分組**
- Analytics (圖表圖標)
- Events (星火圖標)
- Customers (人員圖標)

**Library 分組**
- Folders (資料夾圖標)
- Tags (標籤圖標)
- UTM Templates (UTM 圖標)

**底部區域**
- Usage 顯示: Events 使用量 / Links 使用量
- 重置日期顯示
- "Get Dub Pro" CTA 按鈕 (黑色背景)

### 2.3 Settings 子導航
Settings 頁面使用獨立的側邊欄結構：

**Workspace 分組**
- General
- Billing
- Domains
- Members
- Integrations
- Security

**Developer 分組**
- Analytics
- API Keys
- OAuth Apps
- Webhooks

**Account 分組**
- Notifications

---

## 3. 頁面組件模式

### 3.1 通用頁面結構
```
┌─────────────────────────────────────────────┐
│ Page Title (H1)         [Primary CTA Button]│
├─────────────────────────────────────────────┤
│ Tabs (if applicable)                        │
├─────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐    ┌─────────────┐ │
│ │ Filter  │ │ Display │    │ Search      │ │
│ └─────────┘ └─────────┘    └─────────────┘ │
├─────────────────────────────────────────────┤
│ [Promotion Banner - optional]               │
├─────────────────────────────────────────────┤
│                                             │
│           Content Card / List               │
│                                             │
├─────────────────────────────────────────────┤
│ Viewing X-X of X items    [Previous] [Next] │
└─────────────────────────────────────────────┘
```

### 3.2 頁面標題模式
- 標題 + 幫助圖標 (?)
- 右側放置主要 CTA 按鈕 (Create link, Add Domain 等)
- CTA 按鈕統一使用黑底白字 + 快捷鍵提示

### 3.3 空狀態設計
當沒有資料時顯示：
```
┌─────────────────────────────────────────────┐
│                                             │
│              [Illustration]                 │
│                                             │
│            No items found                   │
│     Helpful description text here           │
│                                             │
│   [Create Button]  [Learn more]             │
│                                             │
└─────────────────────────────────────────────┘
```
- 中央對齊
- 淡化的插圖/圖示
- 清楚的說明文字
- 雙按鈕: 主要操作 + 了解更多

---

## 4. 核心頁面分析

### 4.1 Links Dashboard (01-links-dashboard.png)

**功能區塊**:
- Filter 下拉選單
- Display 選項 (切換顯示方式)
- 搜尋框 (Search by short link or URL)

**連結卡片設計**:
```
┌─────────────────────────────────────────────┐
│ [Favicon] domain/slug [Copy Icon]           │
│ ↳ target-url.com/path   [Tag] [Time]        │
│                              [Clicks] [Menu]│
└─────────────────────────────────────────────┘
```
- 左側: 目標網站 Favicon
- 短連結 + 複製按鈕
- 目標 URL (灰色文字)
- 右側: 點擊數統計 + 更多選項 (三點選單)

### 4.2 Analytics Page (05-analytics-page.png)

**指標卡片區** (頂部):
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ■ Clicks     │ │ ■ Leads      │ │ ■ Sales      │
│   1          │ │   0          │ │   US$0       │
│              │ │              │ │    [$123]    │
└──────────────┘ └──────────────┘ └──────────────┘
```
- 三欄指標: Clicks / Leads / Sales
- 每個卡片有顏色標識方塊
- Sales 額外顯示設定按鈕

**篩選列**:
- Filter 下拉
- 時間範圍選擇器 (Last 24 hours)
- View Events 按鈕

**圖表區域**:
- 空白時顯示灰色背景區域
- 右上角切換圖表類型按鈕

**底部數據表**:
- 左側: Short Links / Destination URLs (tab 切換)
  - Sub-tabs: Links, Folders, Tags
- 右側: Referrers / UTM Parameters
  - Sub-tabs: Domain, URL

### 4.3 Events Page (09-events-page.png)

**指標卡片** (與 Analytics 相同):
- Clicks / Leads / Sales

**事件列表表格**:
| Date | Link | Referer | Country | Device |
|------|------|---------|---------|--------|
| Nov 27, 8:00 PM | dub.co/xxx | (direct) | United States | Desktop |

**Real-time Events Stream** (Pro 功能):
- 顯示升級提示
- "Upgrade to Business" CTA

### 4.4 Domains Page (06-domains-page.png)

**Tabs**:
- Custom domains | Default domains

**篩選與操作**:
- Search 輸入框
- Active / Archived 篩選
- Add custom domain 按鈕 (下拉)

**推廣 Banner**:
```
┌─────────────────────────────────────────────┐
│ 🎉 Claim a free .link domain, free for 1    │
│    year. Learn more     [Claim Domain] [X]  │
└─────────────────────────────────────────────┘
```

### 4.5 Tags Page (07-tags-page.png)

**簡潔結構**:
- 頁面標題 + Create tag 按鈕
- 搜尋框
- Tag 列表 / 空狀態

### 4.6 UTM Templates Page (08-utm-templates-page.png)

**結構**:
- 頁面標題 + Create template 按鈕
- 模板列表顯示

---

## 5. Modal 彈窗設計

### 5.1 Create Link Modal (02-create-link-modal.png)

**雙欄佈局**:
```
┌──────────────────────────────────────────────────────────┐
│ Links > ⊕ New link                    ○ Draft saved  X  │
├──────────────────────────────────────────────────────────┤
│                                    │                     │
│ Destination URL ⓘ                  │ Folder ⓘ           │
│ [https://example.com/...]          │ [Links ▼]          │
│                                    │                     │
│ Short Link ⓘ              [🎲][🔗] │ QR Code ⓘ          │
│ [dub.sh ▼] [custom-slug]           │ [QR Preview]  [✎]  │
│                                    │                     │
│ ┌────────────────────────────────┐ │ Custom Link Preview│
│ │🎉 Claim a free .link domain... │ │ [⊕][X][in][f]      │
│ │        [Claim Domain] [X]      │ │ ┌───────────────┐  │
│ └────────────────────────────────┘ │ │ [Preview]     │  │
│                                    │ │ Enter a link..│  │
│ Tags ⓘ                    Manage   │ └───────────────┘  │
│ [Select tags...]                   │                     │
│                                    │ Add a title...      │
│ Comments ⓘ                         │ Add a description.. │
│ [Add comments]                     │                     │
│                                    │                     │
│ Conversion Tracking ⓘ        [○─]  │                     │
│                                    │                     │
├──────────────────────────────────────────────────────────┤
│ [UTM] [Targeting] [A/B Test] [Password] [Expiration]... │
│                                          [Create link ↵] │
└──────────────────────────────────────────────────────────┘
```

**左側主要表單**:
1. Destination URL - 目標網址輸入
2. Short Link - 網域選擇 + 自訂 slug (支援隨機生成/AI 生成)
3. Tags - 標籤選擇器
4. Comments - 備註欄位
5. Conversion Tracking - Toggle 開關

**右側預覽區**:
1. Folder 選擇器
2. QR Code 即時預覽 (可編輯)
3. Custom Link Preview - 社群平台預覽切換 (Web/X/LinkedIn/Facebook)
4. OG 預覽卡片
5. Title / Description 自訂

**底部功能標籤列**:
- UTM
- Targeting
- A/B Test
- Password
- Expiration
- More (...)

**設計特點**:
- 自動儲存草稿功能
- 麵包屑導航 (Links > New link)
- 即時預覽
- 模組化功能區塊

### 5.2 UTM Builder Modal (03-utm-builder-modal.png)

**表單結構**:
```
┌─────────────────────────────────────────┐
│ UTM Builder ⓘ                      [U] │
├─────────────────────────────────────────┤
│ ⊕ Source     [google                  ] │
│ ⟳ Medium     [cpc                     ] │
│ ⚑ Campaign   [summer sale             ] │
│ 🔍 Term      [running shoes           ] │
│ 📄 Content   [logo link               ] │
│ 🏢 Referral  [yoursite.com            ] │
├─────────────────────────────────────────┤
│ ◇ Templates ▼        [Cancel] [Save]   │
└─────────────────────────────────────────┘
```

**欄位**:
- Source (來源)
- Medium (媒介)
- Campaign (活動)
- Term (關鍵字)
- Content (內容)
- Referral (推薦來源) - 額外欄位

**功能**:
- Templates 下拉選單快速套用
- 每個欄位有對應圖標

### 5.3 Targeting Modal (04-targeting-modal.png)

**結構**:
```
┌─────────────────────────────────────────┐
│ Targeting                          [G]  │
├─────────────────────────────────────────┤
│ Geo Targeting         [PRO]             │
│ [Add location                         ] │
│                                         │
│ iOS Targeting         [PRO]             │
│ [https://apps.apple.com/app/...]        │
│                                         │
│ Android Targeting     [PRO]             │
│ [https://play.google.com/store/...]     │
├─────────────────────────────────────────┤
│                    [Cancel] [Add targeting] │
└─────────────────────────────────────────┘
```

**功能區塊**:
- Geo Targeting - 地理位置定向 (PRO)
- iOS Targeting - iOS 裝置定向 URL (PRO)
- Android Targeting - Android 裝置定向 URL (PRO)

**設計特點**:
- PRO 標籤明確標示付費功能
- 簡潔的單欄表單設計

---

## 6. Settings 頁面結構

### 6.1 Billing 頁面 (10-settings-billing.png)

**頂部區塊**:
```
┌─────────────────────────────────────────────────────────┐
│ Free Plan                      [Upgrade] [View invoices]│
│ Current billing cycle: Nov 27, 2025 - Dec 26, 2025     │
├──────────────────────────┬──────────────────────────────┤
│ ⚡ Events tracked        │ 🔗 Links created            │
│ 1                [Manage]│ 1                   [Manage] │
│ ▰──────────────────────  │ ▰──────────────────────      │
│ 999 remaining of 1,000   │ 24 remaining of 25          │
└──────────────────────────┴──────────────────────────────┘
```

**使用量統計區**:
- Filter + 日期範圍選擇
- Folder / Domain 篩選
- 事件追蹤圖表

**底部功能概覽**:
| Custom Domains | Folders | Tags | Teammates |
|----------------|---------|------|-----------|
| 0/3            | 0/0     | 0/5  | 1/1       |

| Partners | Partner Groups | Partner payouts | Payout fees |

### 6.2 General 設定 (11-settings-general.png)

**卡片式表單**:
```
┌─────────────────────────────────────────┐
│ Workspace Name                          │
│ This is the name of your workspace...   │
│ [Leo's link                           ] │
│ Max 32 characters.        [Save Changes]│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Workspace Slug                          │
│ This is your workspace's unique slug... │
│ [leos-link                            ] │
│ Only lowercase...         [Save Changes]│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Workspace Logo                          │
│ This is your workspace's logo on Dub.   │
│ [Avatar Image]                          │
│ Square image recommended... [Save changes]│
└─────────────────────────────────────────┘
```

**設計模式**:
- 獨立卡片包裹每個設定項
- 說明文字在欄位上方
- 限制條件在欄位下方
- 每個卡片獨立儲存按鈕

### 6.3 API Keys 頁面 (12-settings-api-keys.png)

**結構**:
- 頁面標題: Secret keys + Create API key 按鈕
- 空狀態提示: "No tokens found"
- Create API Key + Learn more 按鈕

### 6.4 Integrations 頁面 (13-settings-integrations.png)

**Carousel 展示**:
- 水平滑動的整合卡片
- 快速導航圖標列

**分類區塊**:
- **Payments**: Stripe, Shopify, Polar (Coming Soon)
- **Automations**: (滾動下方)

**整合卡片設計**:
```
┌─────────────────────────┐
│ [Logo Icon]             │
│                         │
│ Stripe ✓                │
│ Track how your links    │
│ are converting to sales │
│ on Stripe.              │
└─────────────────────────┘
```

---

## 7. Link 編輯頁面 (14-link-edit-page.png)

**頁面結構**:
與 Create Modal 相似，但為全頁面版本

**頂部導航**:
```
Links > [favicon] git.new/fcPWxBP ▼    [Copy link] [✨ 1 clicks] [⋮]
```

**左側表單區**:
- Destination URL
- Short Link (網域 + slug)
- Promotion Banner
- Tags
- Comments
- Conversion Tracking
- 功能標籤列 (UTM, Targeting, A/B Test, Password, Expiration)

**右側預覽區**:
- Folder 選擇
- QR Code 預覽
- Custom Link Preview (多平台切換)
- 預覽卡片
- 目標頁面資訊顯示

**底部資訊**:
- Created by [User Avatar] USERNAME · Time ago

---

## 8. UI 組件庫總結

### 8.1 按鈕樣式
| 類型 | 樣式 | 用途 |
|------|------|------|
| Primary | 黑底白字 + 快捷鍵 | 主要 CTA |
| Secondary | 白底黑框 | 次要操作 |
| Ghost | 純文字 | 輔助連結 |
| Upgrade | 黑底白字 | 升級提示 |

### 8.2 輸入元件
- Text Input: 圓角邊框，focus 時加深邊框
- Select/Dropdown: 帶箭頭指示
- Toggle: 圓形開關
- Multi-select: 標籤式選擇

### 8.3 資訊提示
- Help Icon (?) : 懸停顯示說明
- PRO Badge: 綠色小標籤
- Banner: 背景色區塊 + 關閉按鈕

### 8.4 表格/列表
- 懸停行高亮
- 內嵌操作按鈕
- 可排序欄位 (帶排序指示)

---

## 9. 關鍵 UX 模式

### 9.1 漸進式揭露
- 進階功能收納在展開區塊 (UTM, Targeting 等)
- PRO 功能明確標示但不影響基礎流程

### 9.2 即時反饋
- 草稿自動儲存
- 即時預覽更新
- 操作成功/失敗提示

### 9.3 快捷操作
- 快捷鍵提示 (如 C 創建連結, U 開啟 UTM)
- 複製按鈕隨處可見
- 搜尋框支援多種查詢

### 9.4 空狀態設計
- 友善的說明文字
- 清晰的行動指引
- 相關學習資源連結

---

## 10. 技術實現建議

基於 Dub.co 的 UI/UX 分析，建議我們的專案可以參考以下改進方向：

### 10.1 Navigation 導航
- [ ] 採用雙層側邊欄設計 (Icon Bar + Menu)
- [ ] 導航分組使用明確的 Section 標題
- [ ] 底部顯示 Usage 統計

### 10.2 Dashboard 主頁
- [ ] 連結卡片顯示 Favicon
- [ ] 快速複製短連結功能
- [ ] Filter + Display 選項

### 10.3 Create/Edit Link
- [ ] 雙欄佈局 (表單 + 預覽)
- [ ] 即時 QR Code 預覽
- [ ] 社群平台 OG 預覽切換
- [ ] 進階功能標籤列 (UTM, Targeting 等)
- [ ] 草稿自動儲存

### 10.4 Analytics
- [ ] 三欄指標卡片 (Clicks/Leads/Sales)
- [ ] 時間範圍快速選擇
- [ ] 資料來源分析 (Referrers, UTM)

### 10.5 Settings
- [ ] 卡片式設定區塊
- [ ] 獨立儲存按鈕
- [ ] Usage 進度條顯示

---

*文件生成時間: 2025-11-27*
*資料來源: Dub.co (app.dub.co) 後台截圖*
