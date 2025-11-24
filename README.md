# 個人 SNR 操作紀錄與進階績效分析系統

**Advanced Trading Journal & R-Multiple Analyzer**

一個專為個人交易者設計的全端 Web 應用程式，用於系統化記錄、管理並深入分析交易操作，特別專注於基於 R-Multiple（盈虧比）的績效評估與多維度統計分析。

---

## 📋 專案特色

### 核心功能

- **📊 完整交易紀錄**：詳細記錄每筆交易的所有關鍵資訊（商品、時間框架、設置、進場模式、RR 比例等）
- **🔄 智能自動計算**：自動計算盤勢判斷、目標 Ticks、實際 RR 結果與勝負判定
- **⚙️ 動態選項管理**：後台可自由新增、編輯交易商品、設置、進場模式等分類選項
- **📈 深度績效分析**：
  - 總體績效指標（勝率、累積 R 值、平均 R 值等 9 項指標）
  - 6 個維度的分類績效統計（商品、設置、進場模式、趨勢線類型、時間框架、盤勢）
  - 資金曲線圖（Equity Curve）
  - R 值分佈圖（Histogram）
  - 盤勢績效比較
- **🖼️ 圖片管理**：支援多張截圖上傳至 Cloudinary，並可個別刪除
- **🌓 主題切換**：支援亮色/暗色模式，提供舒適的使用體驗
- **🔐 安全登入**：僅支援 GitHub OAuth 登入，可設定白名單限制使用者

### 獨特設計

- **多選支援**：設置與進場模式可多選，靈活組合交易策略
- **RR 計算邏輯**：輸入止損 Ticks 和目標 RR 比例（如 "1:3"），自動計算目標 Ticks
- **條件必填**：當進場模式包含趨勢線相關選項時，自動顯示並要求填寫趨勢線類型
- **盤勢自動判斷**：根據圖表時間點自動判斷亞洲盤/倫敦盤/美洲盤

---

## 🛠️ 技術堆疊

| 類別       | 技術                                            |
| :--------- | :---------------------------------------------- |
| **前端**   | Next.js 14+ (App Router), React 18+, TypeScript |
| **UI**     | shadcn/ui, Tailwind CSS v4, Radix UI            |
| **表單**   | React Hook Form, Zod                            |
| **圖表**   | Recharts (shadcn Charts)                        |
| **資料庫** | Supabase (PostgreSQL), Prisma ORM               |
| **認證**   | NextAuth.js v5 (GitHub OAuth)                   |
| **圖片**   | Cloudinary                                      |
| **部署**   | Vercel                                          |

---

## 🚀 快速開始

### 環境需求

- Node.js 18+
- npm / yarn / pnpm

### 安裝

```bash
# 安裝依賴
npm install

# 設定環境變數（複製 .env.example 並填入實際值）
cp .env.example .env.local

# 初始化資料庫
npx prisma generate
npx prisma migrate dev

# 執行種子資料（選填）
npx prisma db seed
```

### 開發

```bash
# 啟動開發伺服器
npm run dev

# 開啟瀏覽器訪問
# http://localhost:3000
```

### 建置

```bash
# 生產環境建置
npm run build

# 啟動生產伺服器
npm start
```

---

## 📁 專案結構

```
snr-web/
├── app/                    # Next.js App Router 頁面
├── components/             # React 元件
│   ├── ui/                # shadcn/ui 基礎元件
│   └── ...                # 自訂業務元件
├── lib/                   # 工具函式與配置
├── prisma/                # Prisma Schema 與遷移檔
├── public/                # 靜態資源
├── REQUIREMENTS.md        # 完整需求規格文件
└── README.md              # 本文件
```

---

## 📖 文件

- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - 完整的需求規格文件（SDD 規範）
  - 使用者故事
  - 核心功能規格
  - 資料模型定義
  - 深度分析與報表規格
  - 技術規格與限制
  - API 設計規範

---

## 🔧 環境變數

請在 `.env.local` 中設定以下環境變數：

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
AUTHORIZED_GITHUB_IDS=12345678,87654321

# Supabase 資料庫
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Cloudinary 圖片上傳
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# 時區設定
TIMEZONE=Asia/Taipei
```

---

## 📊 資料模型

核心資料表：

- **User** - 使用者（GitHub 帳號）
- **Trade** - 交易紀錄（含自動計算欄位）
- **Commodity** - 交易商品選項
- **SetupRating** - 設置分類選項
- **EntryType** - 進場模式選項
- **TrendlineType** - 趨勢線類型選項
- **Timeframe** - 時間框架選項

詳見 [REQUIREMENTS.md - 資料模型定義](./REQUIREMENTS.md#4-資料模型定義)

---

## 🎯 開發狀態

目前處於 **規劃與設計階段**，已完成：

- ✅ 完整需求規格文件（REQUIREMENTS.md）
- ✅ 資料模型設計
- ✅ API 端點規劃
- ✅ UI/UX 架構設計

待辦事項：

- ⏳ 專案初始化與環境設定
- ⏳ Prisma Schema 實作
- ⏳ 身份驗證系統
- ⏳ 交易紀錄 CRUD 功能
- ⏳ 後台選項管理
- ⏳ 績效分析與圖表
- ⏳ 圖片上傳與管理

詳見 [REQUIREMENTS.md - 開發優先順序](./REQUIREMENTS.md#8-開發優先順序)

---

## 📝 授權

本專案為個人使用專案，未開放商業使用。

---

## 👤 作者

**Henry** - 個人交易者

---

## 🙏 致謝

- [Next.js](https://nextjs.org/) - React 全端框架
- [shadcn/ui](https://ui.shadcn.com/) - 優美的 UI 元件庫
- [Supabase](https://supabase.com/) - 開源的 Firebase 替代方案
- [Prisma](https://www.prisma.io/) - 現代化的 ORM 工具
- [Cloudinary](https://cloudinary.com/) - 強大的圖片管理服務

---

**專案版本：** 1.1.0  
**最後更新：** 2025-11-24
