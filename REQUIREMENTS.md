# 個人 SNR 操作紀錄與進階績效分析系統

## Advanced Trading Journal & R-Multiple Analyzer

**版本：** 1.2.0
**最後更新：** 2025-11-25  
**專案類型：** Next.js Web Application  
**開發方法：** Specification-Driven Development (SDD)

---

## 目錄

1. [專案總覽](#1-專案總覽)
2. [使用者故事](#2-使用者故事)
3. [核心功能規格](#3-核心功能規格)
4. [資料模型定義](#4-資料模型定義)
5. [深度分析與報表規格](#5-深度分析與報表規格)
6. [技術規格與限制](#6-技術規格與限制)
7. [非功能性需求](#7-非功能性需求)
8. [開發優先順序](#8-開發優先順序)

---

## 1. 專案總覽

### 1.1 專案目標

建立一個供個人使用的 Web 應用程式，用於**系統化記錄**、**高效管理**並**深入分析**個人交易操作，特別專注於基於 **R-Multiple (盈虧比)** 的績效評估與多維度分類條件的統計分析。

### 1.2 核心價值

- **完整記錄**：詳細記錄每筆交易的所有關鍵資訊，包含技術面、心理面與執行面
- **動態管理**：靈活配置交易分類選項，適應不斷演進的交易策略
- **深度分析**：提供多維度的績效統計與可視化圖表，幫助識別優勢與劣勢
- **快速迭代**：透過數據驅動的方式持續優化交易決策

### 1.3 目標使用者

單一使用者（專案擁有者本人），具備交易經驗，需要專業級別的交易日誌與分析工具。

### 1.4 使用情境

- 交易執行後立即記錄詳細資訊
- 定期回顧交易績效與統計數據
- 根據不同分類條件（設置、進場模式等）評估策略有效性
- 管理與更新交易分類選項以反映策略變化

---

## 2. 使用者故事

### 2.1 身份驗證

**US-001：使用者登入**

- **作為** 使用者
- **我想要** 使用 Email 與密碼或第三方 OAuth (GitHub) 快速登入系統
- **以便** 安全地存取我的交易紀錄

**驗收標準：**

- 系統提供 Email/密碼登入表單
- 系統提供 GitHub OAuth 登入按鈕（選配）
- 登入成功後自動跳轉至主要功能頁面
- 登入失敗時顯示明確的錯誤訊息
- 登入狀態持久化（使用 Supabase Session）
- 支援「記住我」功能（Session 有效期延長）

### 2.2 交易紀錄管理

**US-002：新增交易紀錄**

- **作為** 使用者
- **我想要** 快速且完整地記錄一筆交易的所有細節
- **以便** 建立完整的交易歷史資料庫

**驗收標準：**

- 提供直覺且易於操作的輸入表單
- 所有必填欄位都有明確標示
- 當「進場模式」包含趨勢線相關選項時，「趨勢線類型」欄位自動顯示並設為必填
- 「盤勢判斷」根據「圖表時間點」自動計算並填入
- 「目標 Ticks」根據「止損 Ticks」和「目標 RR 比例」自動計算
- 「實際 RR 結果」根據「實際出場 Ticks」和「止損 Ticks」自動計算
- 「是否獲勝」根據「實際 RR 結果」自動判斷（> 0 為勝）
- 支援上傳多張截圖（Cloudinary）並可個別刪除
- 表單驗證失敗時提供清晰的錯誤提示
- 成功新增後顯示確認訊息並清空表單或跳轉至紀錄列表

**US-003：瀏覽交易紀錄列表**

- **作為** 使用者
- **我想要** 以表格形式查看所有交易紀錄
- **以便** 快速瀏覽和管理歷史紀錄

**驗收標準：**

- 以清晰的表格呈現所有紀錄
- 顯示關鍵欄位：做單日、商品、設置、進場模式、目標 RR 比例、實際 RR 結果、是否獲勝
- 支援分頁功能（建議每頁 20-50 筆）
- 每筆紀錄提供「查看詳情」、「編輯」、「刪除」操作按鈕

**US-004：篩選與搜尋交易紀錄**

- **作為** 使用者
- **我想要** 根據多個條件篩選和搜尋紀錄
- **以便** 快速找到特定類型的交易

**驗收標準：**

- 支援以下篩選條件：
  - 日期區間（做單日）
  - 交易商品（多選）
  - 盤勢判斷（多選）
  - 時間框架（多選）
  - 設置 (Rating)（多選）
  - 進場模式（多選）
  - 趨勢線類型（多選）
  - 是否獲勝（單選）
- 支援組合多個篩選條件
- 提供關鍵字搜尋功能（搜尋商品名稱、心得備註）
- 支援按任何欄位排序（升序/降序）
- 篩選結果即時更新

**US-005：編輯交易紀錄**

- **作為** 使用者
- **我想要** 修改已存在的交易紀錄
- **以便** 更正錯誤或補充遺漏的資訊

**驗收標準：**

- 點擊編輯按鈕後顯示預填充的表單
- 表單驗證規則與新增時相同
- 成功更新後顯示確認訊息並更新列表

**US-006：刪除交易紀錄**

- **作為** 使用者
- **我想要** 刪除錯誤或無效的交易紀錄
- **以便** 保持資料的準確性

**驗收標準：**

- 刪除前顯示確認對話框
- 確認後永久刪除紀錄
- 刪除後更新列表並顯示成功訊息

### 2.3 動態選項管理

**US-007：管理分類選項**

- **作為** 使用者
- **我想要** 新增、編輯、刪除以下分類的選項：交易商品、設置、進場模式、趨勢線類型、時間框架
- **以便** 隨著交易策略演進而調整分類系統

**驗收標準：**

- 提供後台管理介面，清楚列出所有分類及其選項
- 每個分類支援以下操作：
  - **新增選項**：輸入選項名稱與描述（可選）
  - **編輯選項**：修改選項名稱與描述
  - **刪除選項**：刪除前檢查是否有交易紀錄使用該選項
- 刪除已被使用的選項時：
  - 顯示警告訊息，列出受影響的紀錄數量
  - 提供選項：「取消刪除」或「強制刪除（將相關紀錄的該欄位設為空）」
- 所有變更即時反映在紀錄輸入表單中

### 2.4 績效分析與可視化

**US-008：查看總體績效指標**

- **作為** 使用者
- **我想要** 快速查看整體交易績效的關鍵指標
- **以便** 了解當前交易表現

**驗收標準：**

- 在儀表板顯示以下指標：
  - 總交易筆數
  - 勝率 (%)
  - 累積 R 值
  - 平均 R 值
- 支援選擇日期區間進行篩選
- 數據以清晰的卡片或指標板呈現

**US-009：查看分類績效統計**

- **作為** 使用者
- **我想要** 查看不同分類條件下的詳細績效統計
- **以便** 識別哪些策略或設置表現最佳

**驗收標準：**

- 提供以下分類的統計表格：
  - 交易商品 (Commodity)
  - 設置 (Rating)
  - 進場模式 (Entry Type)
  - 趨勢線類型 (Trendline Type)
  - 時間框架 (Timeframe)
  - 盤勢判斷 (Session Type)
- 每個統計表格包含：
  - 分類項名稱
  - 總交易筆數
  - 平均 RR 結果
  - 勝率 (%)
  - 累積 R 值總和
  - 平均目標 R
- 支援按日期區間篩選
- 支援點擊查看該分類下的詳細紀錄列表

**US-010：查看資金曲線圖**

- **作為** 使用者
- **我想要** 查看累積 R 值隨時間變化的圖表
- **以便** 視覺化資金成長軌跡

**驗收標準：**

- 以折線圖呈現累積 R 值的時間序列
- X 軸為時間（做單日），Y 軸為累積 R 值
- 支援日期區間篩選
- 滑鼠懸停時顯示具體數值與日期

**US-011：查看 R 值分佈圖**

- **作為** 使用者
- **我想要** 查看 R 值的分佈情況
- **以便** 了解盈虧的集中區間

**驗收標準：**

- 以長條圖（Histogram）呈現 R 值分佈
- X 軸為 R 值區間（例如：-2~-1, -1~0, 0~1, 1~2, 2~3, >3）
- Y 軸為交易筆數
- 支援日期區間篩選

**US-012：查看盤勢績效分析**

- **作為** 使用者
- **我想要** 比較不同交易時段（亞洲盤、倫敦盤、美洲盤）的績效
- **以便** 識別最適合自己的交易時段

**驗收標準：**

- 提供盤勢績效比較表格或圖表
- 每個盤勢顯示：總筆數、勝率、平均 R 值、累積 R 值
- 支援日期區間篩選

---

## 3. 核心功能規格

### 3.1 身份驗證系統

#### 3.1.1 Supabase Auth 驗證

**功能描述：**
系統使用 Supabase Authentication 處理身份驗證，支援多種登入方式。

**支援的登入方式：**

1. **Email + Password（主要方式）**
   - 本地帳號註冊與登入
   - Email 驗證（可選）
   - 密碼重設功能

2. **OAuth Providers（選配）**
   - GitHub OAuth
   - Google OAuth（未來擴展）

**技術需求：**

- 使用 `@supabase/supabase-js` 處理認證
- 使用 `@supabase/auth-helpers-nextjs` 整合 Next.js
- Session 管理由 Supabase 自動處理
- 使用 Supabase Auth UI（可選，快速建立登入介面）

**Email/密碼登入流程：**

1. 使用者填寫 Email 與密碼
2. 呼叫 `supabase.auth.signInWithPassword({ email, password })`
3. 驗證成功後，Supabase 自動建立 Session
4. 前端接收 Session 並跳轉至主頁面
5. 後續請求自動帶入 Session Token

**GitHub OAuth 登入流程：**

1. 使用者點擊「使用 GitHub 登入」按鈕
2. 呼叫 `supabase.auth.signInWithOAuth({ provider: 'github' })`
3. 跳轉至 GitHub 授權頁面
4. 使用者授權後回調至系統
5. Supabase 自動建立或更新使用者資料
6. 建立 Session 並跳轉至主頁面

**註冊流程：**

1. 使用者填寫 Email、密碼
2. 呼叫 `supabase.auth.signUp({ email, password })`
3. （可選）發送 Email 驗證信
4. 註冊成功後自動登入

**登出流程：**

1. 呼叫 `supabase.auth.signOut()`
2. 清除本地 Session
3. 跳轉至登入頁面

**Session 管理：**

- Session 預設有效期：7 天
- 支援 Refresh Token 自動更新
- 使用 `supabase.auth.getSession()` 取得當前 Session
- 使用 `supabase.auth.onAuthStateChange()` 監聽登入狀態變化

**權限控制：**

- （可選）透過 Supabase Database Trigger 限制特定 Email 註冊
- 使用 Row Level Security (RLS) 確保使用者只能存取自己的資料
- 在 `auth.users` 表中儲存使用者基本資訊

### 3.2 交易紀錄管理

#### 3.2.1 資料欄位定義

| 欄位名稱 (中文) | 欄位名稱 (英文)   | 資料類型      | 必填        | 說明                                              | 驗證規則                  |
| :-------------- | :---------------- | :------------ | :---------- | :------------------------------------------------ | :------------------------ |
| 交易商品        | `commodityId`     | Reference     | 是          | 交易標的                                          | 引用 Commodity 選項       |
| 做單日          | `tradeDate`       | Date          | 是          | 交易執行日期                                      | 有效日期格式              |
| 圖表時間點      | `chartTime`       | DateTime      | 是          | 下單時圖表上的具體時間點                          | ISO 8601 格式             |
| 盤勢判斷        | `sessionType`     | Enum          | 自動        | 根據 `chartTime` 自動判斷（亞洲盤/倫敦盤/美洲盤） | 系統自動計算              |
| 時間框架        | `timeframeId`     | Reference     | 是          | 交易使用的時間週期（單選）                        | 引用 Timeframe 選項       |
| 設置 (Rating)   | `setupRatingIds`  | Array[String] | 是          | 交易設置類型（多選）                              | 引用 SetupRating 選項陣列 |
| 進場模式        | `entryTypeIds`    | Array[String] | 是          | 進場策略類型（多選）                              | 引用 EntryType 選項陣列   |
| 趨勢線類型      | `trendlineTypeId` | Reference     | 條件必填    | 當 `entryType` 包含趨勢線相關時必填               | 引用 TrendlineType 選項   |
| 止損 Ticks      | `stopLossTicks`   | Integer       | 是          | 止損點數（用於計算風險）                          | 正整數                    |
| 目標 RR 比例    | `targetRRatio`    | String        | 是          | 預期風報比（如"1:1", "1:3"）                      | 格式："數字:數字"         |
| 目標 Ticks      | `targetTicks`     | Integer       | 自動/可修改 | 目標點數（自動計算或手動覆寫）                    | 正整數                    |
| 實際出場 Ticks  | `actualExitTicks` | Integer       | 是          | 實際出場點數（可為負值表示虧損）                  | 整數（可為負）            |
| 實際 RR 結果    | `actualRMultiple` | Decimal       | 自動        | 實際盈虧比（自動計算）                            | 自動計算（可為負）        |
| 是否獲勝        | `isWin`           | Boolean       | 自動        | 根據 `actualRMultiple > 0` 自動判斷               | 系統自動計算              |
| 交易心得與備註  | `note`            | Text          | 否          | 交易過程心得與反思                                | 最大長度 5000 字元        |
| 截圖連結        | `screenshotUrls`  | Array[String] | 否          | 圖表截圖的 URL 陣列（Cloudinary）                 | Cloudinary URL 格式       |

#### 3.2.2 盤勢判斷邏輯

**判斷規則（基於 UTC+8 時區）：**

```
chartTime (UTC+8) 的小時部分：
- 00:00 ~ 07:59 → 亞洲盤 (Asian Session)
- 08:00 ~ 15:59 → 倫敦盤 (London Session)
- 16:00 ~ 23:59 → 美洲盤 (American Session)
```

**實作方式：**

- 前端：表單輸入時即時計算並顯示
- 後端：儲存前再次驗證並強制覆寫

**注意事項：**

- 時區需要可配置（透過環境變數或系統設定）
- 未來可擴展為更細緻的時段劃分

#### 3.2.3 RR 與 Ticks 計算邏輯

**欄位關係與自動計算規則：**

系統需要支援靈活的輸入方式，並自動計算相關數值。以下是詳細的欄位定義與計算邏輯：

**輸入欄位：**

1. **止損 Ticks** (`stopLossTicks`): 使用者輸入，表示止損點數（必填）
2. **目標 RR 比例** (`targetRRatio`): 使用者輸入，格式如 "1:1", "1:3"（必填）
3. **實際出場 Ticks** (`actualExitTicks`): 使用者輸入，表示實際出場點數（必填，可為負值）

**自動計算欄位：**

1. **目標 Ticks** (`targetTicks`): 根據止損 Ticks 和目標 RR 比例自動計算
2. **實際 RR 結果** (`actualRMultiple`): 根據實際出場 Ticks 和止損 Ticks 自動計算
3. **是否獲勝** (`isWin`): 根據實際 RR 結果是否大於 0 自動判斷

**計算公式：**

```typescript
// 1. 目標 Ticks 計算
// 例如：stopLossTicks = 200, targetRRatio = "1:3"
const [risk, reward] = targetRRatio.split(':').map(Number)
targetTicks = stopLossTicks * (reward / risk)
// 結果: 200 * (3/1) = 600

// 2. 實際 RR 結果計算
// 例如：actualExitTicks = 450, stopLossTicks = 200
actualRMultiple = actualExitTicks / stopLossTicks
// 結果: 450 / 200 = 2.25

// 3. 是否獲勝判斷
isWin = actualRMultiple > 0
```

**實際使用案例：**

**案例 1：贏錢的交易**

- 使用者輸入：止損 350 ticks，目標 RR "1:1"，實際出場 380 ticks
- 系統計算：
  - 目標 Ticks = 350 \* 1 = 350
  - 實際 RR = 380 / 350 ≈ 1.09
  - 是否獲勝 = true（因為 1.09 > 0）

**案例 2：達到目標的交易**

- 使用者輸入：止損 200 ticks，目標 RR "1:3"，實際出場 600 ticks
- 系統計算：
  - 目標 Ticks = 200 \* 3 = 600
  - 實際 RR = 600 / 200 = 3.0
  - 是否獲勝 = true

**案例 3：虧損的交易**

- 使用者輸入：止損 250 ticks，目標 RR "1:2"，實際出場 -250 ticks
- 系統計算：
  - 目標 Ticks = 250 \* 2 = 500
  - 實際 RR = -250 / 250 = -1.0
  - 是否獲勝 = false

**前端表單設計建議：**

1. **即時計算顯示**：當使用者輸入止損 Ticks 和目標 RR 比例後，立即顯示計算出的目標 Ticks
2. **目標 Ticks 可編輯**：允許使用者手動覆寫自動計算的目標 Ticks（用於特殊情況）
3. **視覺化提示**：使用進度條或指標顯示實際出場相對於目標的位置
4. **顏色編碼**：獲勝顯示綠色，虧損顯示紅色

**驗證規則：**

- `stopLossTicks` > 0（必須為正整數）
- `targetRRatio` 符合格式 "數字:數字"，且兩數字均 > 0
- `actualExitTicks` 可為任意整數（負值表示虧損）
- `targetTicks` 如果手動覆寫，必須 > 0

#### 3.2.4 多選欄位邏輯

**設置 (Setup Rating) 多選：**

- 一筆交易可以同時符合多個設置類型（例如：同時是 BO 和 CLASSIC）
- 前端使用 Multi-Select 或 Checkbox Group 元件
- 資料庫儲存為 ID 陣列：`["uuid1", "uuid2"]`
- 統計分析時，一筆交易會被計入所有選中的設置分類

**進場模式 (Entry Type) 多選：**

- 一筆交易可以使用多種進場策略組合（例如：同時使用雙重確認和趨勢線）
- 前端使用 Multi-Select 或 Checkbox Group 元件
- 資料庫儲存為 ID 陣列：`["uuid1", "uuid2"]`
- **特別注意**：只要任一選中的進場模式 `requiresTrendline = true`，則趨勢線類型欄位為必填

**時間框架 (Timeframe) 單選：**

- 一筆交易只能對應一個時間框架
- 前端使用 Select 或 Radio Group 元件
- 資料庫儲存為單一 ID 字串

#### 3.2.5 條件必填欄位邏輯

**趨勢線類型條件必填規則：**

```
當 entryType 的「任一」選項的 requiresTrendline = true 時：
- trendlineType 欄位在前端表單中顯示
- 設為必填（Required）
- 未填寫時阻止提交並顯示錯誤訊息
```

**實作建議：**

- 在 EntryType 選項模型中增加 `requiresTrendline` 布林欄位
- 管理員新增/編輯 EntryType 時可勾選此欄位
- 前端監聽 `entryTypeIds` 變化，檢查任一選中項是否 `requiresTrendline = true`
- 動態顯示/隱藏並設置 trendlineType 輸入的必填狀態

#### 3.2.6 交易紀錄 CRUD 操作

**Create（新增）**

- **端點：** `POST /api/trades`
- **請求體：** 完整的交易紀錄 JSON
- **回應：** 新建的紀錄（包含自動生成的 ID）

**Read（讀取）**

- **端點：** `GET /api/trades`
- **查詢參數：** 分頁、排序、篩選條件
- **回應：** 紀錄陣列 + 分頁資訊

- **端點：** `GET /api/trades/:id`
- **回應：** 單筆完整紀錄

**Update（更新）**

- **端點：** `PUT /api/trades/:id`
- **請求體：** 更新的欄位
- **回應：** 更新後的完整紀錄

**Delete（刪除）**

- **端點：** `DELETE /api/trades/:id`
- **回應：** 刪除確認訊息

#### 3.2.7 篩選與排序規格

**支援的篩選參數：**

```typescript
interface TradeFilters {
  dateFrom?: string // ISO 8601 日期
  dateTo?: string // ISO 8601 日期
  commodityIds?: string[] // 多選（ID 陣列）
  sessionType?: string[] // 多選
  timeframeIds?: string[] // 多選（ID 陣列）
  setupRatingIds?: string[] // 多選（ID 陣列）
  entryTypeIds?: string[] // 多選（ID 陣列）
  trendlineTypeIds?: string[] // 多選（ID 陣列）
  isWin?: boolean // 單選（true/false/all）
  actualRMultipleMin?: number // 最小實際 R 值
  actualRMultipleMax?: number // 最大實際 R 值
  keyword?: string // 搜尋 note 欄位
}
```

**支援的排序欄位：**

- `tradeDate`（預設：降序）
- `chartTime`
- `actualRMultiple`
- `stopLossTicks`
- `actualExitTicks`

**排序格式：**

```
sortBy=tradeDate&sortOrder=desc
```

### 3.3 動態選項管理系統

#### 3.3.1 選項分類定義

系統需管理以下五種選項分類：

1. **交易商品 (Commodity)** - `commodities`
2. **設置 (Setup Rating)** - `setupRatings`
3. **進場模式 (Entry Type)** - `entryTypes`
4. **趨勢線類型 (Trendline Type)** - `trendlineTypes`
5. **時間框架 (Timeframe)** - `timeframes`

#### 3.3.2 選項資料結構

每個選項包含以下欄位：

```typescript
interface OptionItem {
  id: string // 唯一識別碼（UUID 或自增 ID）
  name: string // 選項名稱（顯示用）
  description?: string // 選項描述（可選）
  requiresTrendline?: boolean // 僅 EntryType 使用
  order: number // 排序順序
  createdAt: Date // 建立時間
  updatedAt: Date // 更新時間
}
```

#### 3.3.3 選項管理 API

**獲取所有選項（依分類）**

- **端點：** `GET /api/options/:category`
- **參數：** `category` ∈ {commodities, setupRatings, entryTypes, trendlineTypes, timeframes}
- **回應：** 選項陣列

**新增選項**

- **端點：** `POST /api/options/:category`
- **請求體：** `{ name, description?, requiresTrendline? }`
- **回應：** 新建的選項

**更新選項**

- **端點：** `PUT /api/options/:category/:id`
- **請求體：** `{ name?, description?, requiresTrendline? }`
- **回應：** 更新後的選項

**刪除選項**

- **端點：** `DELETE /api/options/:category/:id`
- **邏輯：**
  1. 檢查是否有交易紀錄引用此選項
  2. 若有，回傳警告訊息與受影響筆數：
     ```json
     {
       "canDelete": false,
       "affectedCount": 15,
       "message": "此選項被 15 筆交易紀錄使用"
     }
     ```
  3. 若強制刪除（`force=true` 參數），將相關紀錄的該欄位設為 `null`

#### 3.3.4 選項管理前端介面

**頁面結構：**

```
/admin/options
├── 交易商品 (Commodity) 管理
├── 設置 (Setup Rating) 管理
├── 進場模式 (Entry Type) 管理
├── 趨勢線類型 (Trendline Type) 管理
└── 時間框架 (Timeframe) 管理
```

**每個分類的操作：**

- 列表顯示所有選項（含名稱、描述、使用次數）
- 拖曳排序功能（更新 `order` 欄位）
- 新增按鈕 → 開啟新增表單
- 編輯按鈕 → 開啟編輯表單
- 刪除按鈕 → 確認對話框（若有關聯則顯示警告）

---

## 4. 資料模型定義

### 4.1 User（使用者）

**說明：**
使用者資料由 Supabase Auth 自動管理，儲存在 `auth.users` 表中。應用程式可透過 `auth.uid()` 取得當前使用者 ID。

**Supabase Auth Users 表結構：**

```typescript
// 此為 Supabase 內建表，系統自動管理
// 位於 auth.users schema
interface AuthUser {
  id: string // Primary Key (UUID) - 由 Supabase 生成
  email: string // 使用者 Email
  encrypted_password: string // 加密密碼（Supabase 管理）
  email_confirmed_at?: Date // Email 驗證時間
  last_sign_in_at?: Date // 最後登入時間
  created_at: Date // 建立時間
  updated_at: Date // 更新時間

  // OAuth 相關欄位
  raw_user_meta_data?: {
    avatar_url?: string // 頭像 URL（來自 OAuth）
    full_name?: string // 全名（來自 OAuth）
    provider_id?: string // OAuth Provider 的 User ID
  }
}
```

**應用層 User Profile（可選擴展）：**

如需儲存額外的使用者資訊，可建立 `public.profiles` 表：

```typescript
interface UserProfile {
  id: string // Primary Key (UUID) - 引用 auth.users.id
  displayName?: string // 顯示名稱
  avatarUrl?: string // 頭像 URL
  timezone?: string // 時區設定
  createdAt: Date // 建立時間
  updatedAt: Date // 更新時間
}
```

**資料庫索引：**

- `auth.users` 由 Supabase 自動管理索引
- 若建立 `profiles` 表：
  - Primary Key: `id`
  - Foreign Key: `id` REFERENCES `auth.users(id)` ON DELETE CASCADE

### 4.2 Trade（交易紀錄）

```typescript
interface Trade {
  id: string // Primary Key (UUID)
  userId: string // Foreign Key → User.id

  // 基本資訊
  commodityId: string // Foreign Key → Commodity.id
  tradeDate: Date // 做單日（僅日期）
  chartTime: Date // 圖表時間點（完整時間）
  sessionType: SessionType // 盤勢判斷（自動計算）

  // 分類引用（注意：設置與進場模式為多對多關係）
  timeframeId: string // Foreign Key → Timeframe.id
  setupRatingIds: string[] // 多選：Foreign Keys → SetupRating.id[]
  entryTypeIds: string[] // 多選：Foreign Keys → EntryType.id[]
  trendlineTypeId?: string // Foreign Key → TrendlineType.id (可選)

  // 風險與報酬數據
  stopLossTicks: number // 止損點數（正整數）
  targetRRatio: string // 目標RR比例（如"1:1", "1:3"）
  targetTicks: number // 目標點數（自動計算或手動覆寫）
  actualExitTicks: number // 實際出場點數（可為負）
  actualRMultiple: number // 實際RR結果（自動計算 = actualExitTicks / stopLossTicks）
  isWin: boolean // 是否獲勝（根據 actualRMultiple > 0）

  // 備註與附件
  note?: string // 交易心得與備註（Text）
  screenshotUrls: string[] // Cloudinary 圖片 URL 陣列

  // 時間戳記
  createdAt: Date // 建立時間
  updatedAt: Date // 更新時間
}

enum SessionType {
  ASIAN = 'ASIAN',
  LONDON = 'LONDON',
  AMERICAN = 'AMERICAN'
}
```

**資料庫索引：**

- Primary Key: `id`
- Index: `userId`
- Index: `tradeDate` (DESC)
- Index: `sessionType`
- Index: `commodityId`
- Index: `timeframeId`
- GIN Index: `setupRatingIds` (for array queries)
- GIN Index: `entryTypeIds` (for array queries)
- Index: `trendlineTypeId`

**外鍵約束：**

- `userId` REFERENCES `auth.users(id)` ON DELETE CASCADE
- `commodityId` REFERENCES `Commodity(id)` ON DELETE SET NULL
- `timeframeId` REFERENCES `Timeframe(id)` ON DELETE SET NULL
- `trendlineTypeId` REFERENCES `TrendlineType(id)` ON DELETE SET NULL
- Array 欄位的引用檢查需在應用層或透過觸發器實現

**Row Level Security (RLS) 政策：**

```sql
-- 使用者只能查看自己的交易紀錄
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = userId);

-- 使用者只能新增自己的交易紀錄
CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = userId);

-- 使用者只能更新自己的交易紀錄
CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE USING (auth.uid() = userId);

-- 使用者只能刪除自己的交易紀錄
CREATE POLICY "Users can delete own trades" ON trades
  FOR DELETE USING (auth.uid() = userId);
```

**RR 計算邏輯說明：**

```typescript
// 自動計算目標 Ticks（當用戶輸入止損Ticks和目標RR比例時）
// 例如：stopLossTicks = 200, targetRRatio = "1:3"
// 則 targetTicks = 200 * 3 = 600

const [risk, reward] = targetRRatio.split(':').map(Number)
targetTicks = stopLossTicks * (reward / risk)

// 自動計算實際RR結果（當用戶輸入實際出場Ticks時）
// 例如：stopLossTicks = 200, actualExitTicks = 450
// 則 actualRMultiple = 450 / 200 = 2.25

actualRMultiple = actualExitTicks / stopLossTicks

// 判斷是否獲勝
isWin = actualRMultiple > 0
```

### 4.3 選項分類模型

#### 4.3.1 Commodity（交易商品）

```typescript
interface Commodity {
  id: string // Primary Key (UUID)
  name: string // 商品名稱（唯一，例如：XAUUSD, EURUSD）
  description?: string // 描述
  order: number // 排序順序
  createdAt: Date
  updatedAt: Date
}
```

**資料庫索引：**

- Primary Key: `id`
- Unique Index: `name`
- Index: `order`

#### 4.3.2 SetupRating（設置）

```typescript
interface SetupRating {
  id: string // Primary Key (UUID)
  name: string // 設置名稱（唯一）
  description?: string // 描述
  order: number // 排序順序
  createdAt: Date
  updatedAt: Date
}
```

**資料庫索引：**

- Primary Key: `id`
- Unique Index: `name`
- Index: `order`

#### 4.3.3 EntryType（進場模式）

```typescript
interface EntryType {
  id: string // Primary Key (UUID)
  name: string // 進場模式名稱（唯一）
  description?: string // 描述
  requiresTrendline: boolean // 是否需要填寫趨勢線類型（預設 false）
  order: number // 排序順序
  createdAt: Date
  updatedAt: Date
}
```

**資料庫索引：**

- Primary Key: `id`
- Unique Index: `name`
- Index: `order`

#### 4.3.4 TrendlineType（趨勢線類型）

```typescript
interface TrendlineType {
  id: string // Primary Key (UUID)
  name: string // 趨勢線類型名稱（唯一）
  description?: string // 描述
  order: number // 排序順序
  createdAt: Date
  updatedAt: Date
}
```

**資料庫索引：**

- Primary Key: `id`
- Unique Index: `name`
- Index: `order`

#### 4.3.5 Timeframe（時間框架）

```typescript
interface Timeframe {
  id: string // Primary Key (UUID)
  name: string // 時間框架名稱（唯一，例如 M5, H1）
  description?: string // 描述
  order: number // 排序順序
  createdAt: Date
  updatedAt: Date
}
```

**資料庫索引：**

- Primary Key: `id`
- Unique Index: `name`
- Index: `order`

### 4.4 資料庫選擇

**採用方案：Supabase (PostgreSQL) + Prisma ORM**

**理由：**

- Supabase 提供完整的 PostgreSQL 資料庫服務與即時功能
- 內建 Authentication 系統，無需額外配置認證服務
- 支援複雜查詢、聚合運算與全文搜尋
- Prisma 提供型別安全的 ORM，與 TypeScript 整合良好
- 支援 Date、Decimal、JSON Array 等資料類型
- 內建 Row Level Security (RLS) 提供資料安全，自動限制使用者資料存取
- 提供免費額度，適合個人專案
- Supabase Auth 與 Database 無縫整合

---

## 5. 深度分析與報表規格

### 5.1 總體績效指標

**顯示位置：** 儀表板（Dashboard）首頁

**指標定義：**

| 指標名稱   | 英文名稱      | 計算公式                                                                  | 顯示格式           |
| :--------- | :------------ | :------------------------------------------------------------------------ | :----------------- |
| 總交易筆數 | Total Trades  | `COUNT(*)`                                                                | 整數               |
| 勝率       | Win Rate      | `COUNT(isWin=true) / COUNT(*) × 100%`                                     | 百分比（1 位小數） |
| 累積 R 值  | Cumulative R  | `SUM(rMultiple)`                                                          | 小數（2 位小數）   |
| 平均 R 值  | Average R     | `AVG(rMultiple)`                                                          | 小數（2 位小數）   |
| 最大獲利 R | Max Win R     | `MAX(rMultiple WHERE rMultiple > 0)`                                      | 小數（2 位小數）   |
| 最大虧損 R | Max Loss R    | `MIN(rMultiple WHERE rMultiple < 0)`                                      | 小數（2 位小數）   |
| 平均獲利 R | Avg Win R     | `AVG(rMultiple WHERE isWin=true)`                                         | 小數（2 位小數）   |
| 平均虧損 R | Avg Loss R    | `AVG(rMultiple WHERE isWin=false)`                                        | 小數（2 位小數）   |
| 盈虧比     | Profit Factor | `ABS(SUM(rMultiple WHERE isWin=true) / SUM(rMultiple WHERE isWin=false))` | 小數（2 位小數）   |

**日期篩選：**

- 提供日期區間選擇器（From Date ~ To Date）
- 預設選項：全部、本月、近 3 個月、近 6 個月、本年度

**API 端點：**

- `GET /api/analytics/overview?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD`

### 5.2 分類績效統計

**分析維度：**

1. 交易商品 (Commodity)
2. 設置 (Setup Rating)
3. 進場模式 (Entry Type)
4. 趨勢線類型 (Trendline Type)
5. 時間框架 (Timeframe)
6. 盤勢判斷 (Session Type)

**每個維度的統計表格包含：**

| 欄位         | 計算方式                              | 說明                        |
| :----------- | :------------------------------------ | :-------------------------- |
| 分類項名稱   | -                                     | 例如："BO", "BOCC", "M5" 等 |
| 總交易筆數   | `COUNT(*)`                            | 該分類下的總筆數            |
| 勝率 (%)     | `COUNT(isWin=true) / COUNT(*) × 100%` | 獲勝交易佔比                |
| 平均 RR 結果 | `AVG(rMultiple)`                      | 該分類的平均 R 值           |
| 累積 R 值    | `SUM(rMultiple)`                      | 總盈虧 R 值                 |
| 平均目標 R   | `AVG(targetR)`                        | 平均預期目標                |
| 最大獲利 R   | `MAX(rMultiple WHERE rMultiple > 0)`  | 單筆最大盈利                |
| 最大虧損 R   | `MIN(rMultiple WHERE rMultiple < 0)`  | 單筆最大虧損                |

**功能需求：**

- 每個統計表格可按任意欄位排序
- 支援日期區間篩選
- 點擊任一分類項，跳轉至該分類的詳細紀錄列表
- 匯出功能（CSV 或 Excel）

**API 端點：**

- `GET /api/analytics/by-commodity?dateFrom=...&dateTo=...`
- `GET /api/analytics/by-setup-rating?dateFrom=...&dateTo=...`
- `GET /api/analytics/by-entry-type?dateFrom=...&dateTo=...`
- `GET /api/analytics/by-trendline-type?dateFrom=...&dateTo=...`
- `GET /api/analytics/by-timeframe?dateFrom=...&dateTo=...`
- `GET /api/analytics/by-session-type?dateFrom=...&dateTo=...`

### 5.3 資金曲線圖 (Equity Curve)

**圖表類型：** 折線圖 (Line Chart)

**資料結構：**

```typescript
interface EquityCurveDataPoint {
  date: string // ISO 8601 日期
  cumulativeR: number // 累積 R 值
  tradeCount: number // 累計交易筆數（用於顯示）
}
```

**計算邏輯：**

1. 取得指定日期區間內的所有交易，按 `tradeDate` 升序排序
2. 計算累積 R 值：`cumulativeR[i] = cumulativeR[i-1] + rMultiple[i]`
3. 生成 (date, cumulativeR) 數據點陣列

**圖表功能：**

- X 軸：時間（日期）
- Y 軸：累積 R 值
- 滑鼠懸停顯示：日期、累積 R 值、當日交易數
- 支援縮放與拖曳
- 顯示基準線（Y=0）
- 不同區段使用不同顏色（正值綠色，負值紅色）

**技術實作：**

- 推薦使用 Recharts 或 Chart.js
- 支援響應式設計

**API 端點：**

- `GET /api/analytics/equity-curve?dateFrom=...&dateTo=...`

### 5.4 R 值分佈圖 (R-Multiple Distribution)

**圖表類型：** 直方圖 (Histogram / Bar Chart)

**區間劃分（建議）：**

```
< -3, [-3, -2), [-2, -1), [-1, 0), [0, 1), [1, 2), [2, 3), [3, 4), [4, 5), >= 5
```

**資料結構：**

```typescript
interface RDistributionBucket {
  range: string // 例如："[1, 2)"
  count: number // 該區間的交易筆數
  percentage: number // 佔總筆數的百分比
}
```

**圖表功能：**

- X 軸：R 值區間
- Y 軸：交易筆數
- 每個柱狀條顯示數量與百分比
- 負值區間使用紅色，正值區間使用綠色
- 滑鼠懸停顯示詳細資訊

**API 端點：**

- `GET /api/analytics/r-distribution?dateFrom=...&dateTo=...`

### 5.5 盤勢績效分析

**圖表類型：** 比較表格 + 長條圖

**資料結構：**

```typescript
interface SessionPerformance {
  sessionType: SessionType // ASIAN, LONDON, AMERICAN
  totalTrades: number // 總筆數
  winRate: number // 勝率 (%)
  avgR: number // 平均 R 值
  cumulativeR: number // 累積 R 值
  maxWin: number // 最大獲利 R
  maxLoss: number // 最大虧損 R
}
```

**顯示方式：**

1. **表格：** 列出三個盤勢的詳細指標
2. **長條圖：** 比較各盤勢的勝率與平均 R 值

**API 端點：**

- `GET /api/analytics/by-session?dateFrom=...&dateTo=...`

### 5.6 交易心得與結果關聯分析（進階功能）

**目標：** 若使用者在「交易心得與備註」中使用標籤（例如：#完美執行、#過早出場），系統可分析不同標籤下的績效。

**實作方式：**

1. 使用正則表達式提取 `note` 欄位中的標籤（`#關鍵字`）
2. 根據標籤分組計算績效指標
3. 生成標籤績效比較表格

**備註：** 此功能為選配，第一版 MVP 可不實作。

---

## 6. 技術規格與限制

### 6.1 技術堆疊

**前端框架：**

- Next.js 14+ (App Router)
- React 18+
- TypeScript 5+

**UI 框架與樣式：**

- **UI 元件庫**：shadcn/ui
- **樣式框架**：Tailwind CSS v4
- **主題系統**：next-themes（支援亮暗模式切換）

**表單處理：**

- React Hook Form + Zod (表單驗證)

**狀態管理：**

- React Context API（輕量需求）
- 可選：Zustand（若需複雜狀態管理）

**資料視覺化：**

- 優先：shadcn Charts (基於 Recharts)
- 備選：Chart.js（若 shadcn Charts 功能不足）

**後端與 API：**

- Next.js API Routes (App Router)
- Next.js Server Actions (App Router，建議用於 Mutations)
- Next.js Middleware（用於路由保護）

**資料庫與身份驗證：**

- Supabase (PostgreSQL + Authentication)
- ORM: Prisma（資料存取）
- Supabase Client SDK（身份驗證與 RLS）
  - `@supabase/supabase-js` - 核心 SDK
  - `@supabase/auth-helpers-nextjs` - Next.js 整合
  - `@supabase/auth-ui-react`（可選）- 預建登入 UI 元件

**圖片儲存：**

- Cloudinary（圖片上傳、管理與刪除）

**部署平台：**

- Vercel（推薦，無縫整合 Next.js）

**版本控制：**

- Git + GitHub

### 6.2 環境變數配置

```env
# Supabase 設定（必填）
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase 資料庫連線（用於 Prisma）
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Supabase Service Role Key（後端專用，用於繞過 RLS）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 時區設定（盤勢判斷使用）
TIMEZONE=Asia/Taipei

# Cloudinary 圖片上傳
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# GitHub OAuth（選配，若啟用 GitHub 登入）
# 在 Supabase Dashboard > Authentication > Providers 中配置
# SUPABASE_AUTH_GITHUB_CLIENT_ID=your_github_client_id
# SUPABASE_AUTH_GITHUB_SECRET=your_github_client_secret
```

**重要說明：**

- `NEXT_PUBLIC_*` 前綴的變數會暴露至瀏覽器端
- `SUPABASE_SERVICE_ROLE_KEY` 僅在伺服器端使用，切勿暴露至前端
- `ANON_KEY` 是公開金鑰，用於前端與 Supabase 通訊
- Supabase Auth Providers（如 GitHub）在 Supabase Dashboard 中配置

### 6.3 資料庫遷移策略

**使用 Prisma Migrate（搭配 Supabase）：**

```bash
# 生成遷移檔
npx prisma migrate dev --name init

# 套用遷移（生產環境）
npx prisma migrate deploy

# 重置資料庫（開發環境）
npx prisma migrate reset

# 生成 Prisma Client
npx prisma generate
```

**初始資料 Seeding：**

- 建立 `prisma/seed.ts` 腳本
- 預先建立常用的選項資料：
  - **交易商品**：XAUUSD（黃金）, EURUSD, GBPUSD 等
  - **時間框架**：M5, M15, H1, H4, D1 等
  - **設置**：BO, BOCC, CLASSIC 等
  - **進場模式**：雙重確認(DC), 趨勢線(Trendline) Entry 等
  - **趨勢線類型**：Channel, Normal TL 等

### 6.4 API 設計規範

**RESTful API 原則：**

- 使用 HTTP 動詞：GET, POST, PUT, DELETE
- 統一回應格式：
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "操作成功"
  }
  ```
- 錯誤回應格式：
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "欄位驗證失敗",
      "details": [ ... ]
    }
  }
  ```

**HTTP 狀態碼：**

- 200: 成功
- 201: 新增成功
- 400: 請求錯誤（驗證失敗）
- 401: 未授權
- 403: 禁止存取
- 404: 資源不存在
- 500: 伺服器錯誤

**API 端點命名：**

```
/api/trades                      (GET, POST)
/api/trades/:id                  (GET, PUT, DELETE)
/api/options/:category           (GET, POST)
/api/options/:category/:id       (PUT, DELETE)
/api/analytics/overview
/api/analytics/equity-curve
/api/analytics/r-distribution
/api/analytics/by-commodity
/api/analytics/by-setup-rating
/api/analytics/by-entry-type
/api/analytics/by-trendline-type
/api/analytics/by-timeframe
/api/analytics/by-session
/api/cloudinary/upload           (POST)
/api/cloudinary/delete           (DELETE)
```

### 6.5 安全性要求

**身份驗證：**

- 所有 API 端點（除了公開端點）都需驗證使用者身份
- 使用 Supabase Auth 的 `getUser()` 或 `getSession()` 檢查 Session
- Next.js Middleware 實作路由保護：
  ```typescript
  // middleware.ts
  import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
  import { NextResponse } from 'next/server'

  export async function middleware(req) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return res
  }

  export const config = {
    matcher: ['/dashboard/:path*', '/trades/:path*', '/analytics/:path*']
  }
  ```

**授權檢查與資料安全：**

- 使用 Supabase Row Level Security (RLS) 自動限制資料存取
- 使用者只能存取自己的 `trades` 資料
- RLS 政策在資料庫層級強制執行，無法繞過
- （可選）使用 Service Role Key 在後端繞過 RLS（僅限管理功能）

**API 路由安全：**

```typescript
// app/api/trades/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // 驗證使用者身份
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 由於啟用 RLS，查詢會自動過濾為當前使用者的資料
  const { data: trades } = await supabase
    .from('trades')
    .select('*')

  return Response.json(trades)
}
```

**資料驗證：**

- 所有輸入資料需在後端進行二次驗證（使用 Zod）
- 防止 SQL Injection（使用 Prisma ORM + Supabase RLS）
- 防止 XSS（React 預設防護 + 適當的 sanitization）

**密碼安全：**

- 密碼由 Supabase Auth 自動處理加密（bcrypt）
- 支援密碼強度要求（在 Supabase Dashboard 配置）
- 支援密碼重設功能（Email Magic Link）

**HTTPS：**

- 生產環境必須使用 HTTPS
- Supabase 預設強制 HTTPS 連線

**環境變數保護：**

- `SUPABASE_SERVICE_ROLE_KEY` 僅在伺服器端使用
- 使用 `.env.local` 檔案，不提交至版本控制
- Vercel 部署時透過環境變數面板配置

### 6.6 效能要求

**回應時間：**

- API 回應時間 < 500ms（P95）
- 頁面首次載入時間 < 3 秒

**資料分頁：**

- 交易紀錄列表預設分頁大小：20-50 筆
- 支援客戶端調整分頁大小

**快取策略：**

- 分析數據可快取 5-10 分鐘（使用 SWR 或 React Query）
- 選項資料可快取更長時間

**資料庫查詢優化：**

- 對常用篩選欄位建立索引
- 使用 Prisma 的 `select` 與 `include` 避免過度查詢

### 6.7 圖片管理規格

**Cloudinary 整合：**

**上傳流程：**

1. 前端使用 Cloudinary Upload Widget 或 `next-cloudinary`
2. 上傳前向後端請求簽名：`POST /api/cloudinary/signature`
3. 使用簽名進行 signed upload（更安全）
4. 上傳成功後取得回應：
   ```json
   {
     "public_id": "snr-trades/abc123",
     "secure_url": "https://res.cloudinary.com/.../image.jpg",
     "format": "jpg",
     "width": 1920,
     "height": 1080
   }
   ```
5. 將完整的 Cloudinary 資料（包含 `public_id`）儲存至資料庫

**資料庫儲存格式：**

```typescript
interface CloudinaryImage {
  publicId: string      // 用於刪除
  url: string          // 完整 URL
  format?: string      // 圖片格式
  width?: number       // 寬度
  height?: number      // 高度
}

// Trade.screenshotUrls 改為儲存完整物件陣列
screenshotUrls: CloudinaryImage[]
```

**刪除流程：**

1. 使用者點擊特定截圖的刪除按鈕
2. 前端發送請求：`DELETE /api/cloudinary/delete`
   ```json
   {
     "publicId": "snr-trades/abc123",
     "tradeId": "trade-uuid"
   }
   ```
3. 後端驗證使用者權限
4. 使用 Cloudinary Admin API 刪除圖片：
   ```typescript
   import { v2 as cloudinary } from 'cloudinary'
   await cloudinary.uploader.destroy(publicId)
   ```
5. 從資料庫 `screenshotUrls` 陣列中移除該項目
6. 回傳成功訊息

**批次刪除（刪除整筆交易時）：**

- 刪除交易紀錄前，先批次刪除所有關聯的 Cloudinary 圖片
- 避免留下孤兒檔案佔用儲存空間

**API 端點規格：**

```typescript
// 取得上傳簽名
POST /api/cloudinary/signature
Response: {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
}

// 刪除單張圖片
DELETE /api/cloudinary/delete
Body: {
  publicId: string
  tradeId: string
}
Response: {
  success: true
  message: "圖片已刪除"
}
```

**安全性設定：**

- ✅ 使用 signed upload（需要後端簽名）
- ✅ 設定 upload preset（限制資料夾、格式、大小）
- ✅ 限制檔案大小：最大 5MB
- ✅ 限制檔案類型：jpg, png, webp
- ✅ 設定專用資料夾：`snr-trades/`
- ✅ 刪除前驗證使用者擁有該交易紀錄

**前端 UI 設計：**

- 使用縮圖展示已上傳圖片
- 每張圖片右上角顯示刪除按鈕（X）
- 支援拖曳上傳（Drag & Drop）
- 顯示上傳進度條
- 限制單筆交易最多上傳數量（建議 5-10 張）

### 6.8 UI 技術實作細節

#### 6.8.1 shadcn/ui 整合

**安裝與設定：**

```bash
npx shadcn-ui@latest init
```

**常用元件列表：**

- **表單元件**：Input, Select, Checkbox, RadioGroup, DatePicker, Combobox
- **資料展示**：Table, Card, Badge, Avatar, Separator
- **互動元件**：Button, Dialog, DropdownMenu, Popover, Tooltip, Toast
- **導航元件**：NavigationMenu, Tabs, Breadcrumb
- **圖表元件**：Chart (基於 Recharts)

**客製化策略：**

- 所有元件都可透過 Tailwind 類別調整樣式
- 修改 `components/ui/` 目錄下的元件原始碼
- 在 `tailwind.config.ts` 中定義專案色系

#### 6.8.2 Tailwind CSS v4 配置

**安裝：**

```bash
npm install tailwindcss@next @tailwindcss/postcss@next
```

**設定檔結構（`tailwind.config.ts`）：**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui 預設色系
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // 自訂專案色系
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // 交易相關色系
        profit: 'hsl(142, 76%, 36%)', // 綠色
        loss: 'hsl(0, 84%, 60%)' // 紅色
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}

export default config
```

**CSS 變數定義（`app/globals.css`）：**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    /* ...更多變數 */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    /* ...更多變數 */
  }
}
```

#### 6.8.3 主題切換系統

**安裝 next-themes：**

```bash
npm install next-themes
```

**根佈局設定（`app/layout.tsx`）：**

```typescript
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang='zh-TW' suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**主題切換元件範例：**

```typescript
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className='h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
      <Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
      <span className='sr-only'>切換主題</span>
    </Button>
  )
}
```

**支援的主題模式：**

- **Light**（亮色）：白色背景，深色文字
- **Dark**（暗色）：深色背景，淺色文字
- **System**（系統）：自動跟隨作業系統設定

**最佳實踐：**

- 所有自訂色彩都定義 dark mode 變體
- 使用 `dark:` prefix 定義暗色樣式
- 圖表顏色也需要響應主題變化
- 確保色彩對比度符合無障礙標準（WCAG AA）

### 6.9 瀏覽器相容性

**支援瀏覽器：**

- Chrome / Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)

**響應式設計：**

- 支援桌面（1920x1080 以上）
- 支援平板（iPad）
- 支援手機（基本瀏覽，主要操作建議在桌面完成）

---

## 7. 非功能性需求

### 7.1 可用性 (Usability)

- **直覺介面：** 使用者無需閱讀說明即可完成基本操作
- **錯誤提示：** 所有錯誤訊息需清晰明確，並提供解決建議
- **回饋機制：** 所有操作（新增、編輯、刪除）都需提供即時回饋

### 7.2 可維護性 (Maintainability)

- **程式碼規範：** 使用 ESLint + Prettier 統一程式碼風格
- **型別安全：** 全面使用 TypeScript，避免 `any` 類型
- **元件化：** 重複使用的 UI 元件需抽離為獨立元件
- **文件：** 關鍵邏輯需加註註解

### 7.3 可擴展性 (Scalability)

- **模組化設計：** 各功能模組解耦，易於新增功能
- **選項系統：** 動態選項管理使系統能適應策略變化
- **API 設計：** 預留擴展空間（例如：未來支援多使用者）

### 7.4 資料備份與恢復

- **定期備份：** 資料庫需定期備份（建議每日）
- **匯出功能：** 使用者可匯出所有紀錄為 JSON 或 CSV
- **匯入功能（選配）：** 支援從備份檔匯入資料

---

## 8. 開發優先順序

### 8.1 第一階段：MVP（最小可行產品）

**優先順序：P0（必須完成）**

1. ⏳ 專案初始化（Next.js + TypeScript + Prisma + Supabase）
2. ⏳ Supabase Auth 設定與 Email/密碼登入
3. ⏳ 資料庫 Schema 定義與 Migration（含 RLS 政策）
4. ⏳ 交易紀錄 CRUD 功能
   - 新增紀錄（含自動計算欄位）
   - 列表顯示（含分頁）
   - 編輯紀錄
   - 刪除紀錄
5. ⏳ 基本篩選與排序
6. ⏳ 動態選項管理（五種分類）
7. ⏳ 總體績效指標
8. ⏳ 基本部署至 Vercel

**預計時程：** 2-3 週

### 8.2 第二階段：深度分析

**優先順序：P1（高優先）**

1. ✅ 分類績效統計（五個維度）
2. ✅ 資金曲線圖
3. ✅ R 值分佈圖
4. ✅ 盤勢績效分析
5. ✅ 日期區間篩選（全功能整合）

**預計時程：** 1-2 週

### 8.3 第三階段：優化與進階功能

**優先順序：P2（中優先）**

1. ✅ UI/UX 優化（美化介面）
2. ✅ 響應式設計（支援行動裝置）
3. ✅ 資料匯出功能（CSV/Excel）
4. ✅ 圖片上傳整合（若不使用外部連結）
5. ✅ 效能優化（查詢快取、索引優化）
6. ⏸️ 交易心得標籤分析（選配）

**預計時程：** 1-2 週

### 8.4 第四階段：長期維護

**優先順序：P3（低優先）**

1. 資料備份自動化
2. 系統監控與錯誤追蹤（例如：Sentry）
3. 多語言支援（選配）
4. 進階篩選器（組合條件）
5. 自訂報表生成器

---

## 附錄

### A. 技術堆疊總覽

以下是本專案採用的完整技術堆疊：

| 類別             | 技術/套件         | 版本要求 | 用途說明                     |
| :--------------- | :---------------- | :------- | :--------------------------- |
| **前端框架**     | Next.js           | 14+      | React 全端框架               |
|                  | React             | 18+      | UI 函式庫                    |
|                  | TypeScript        | 5+       | 型別安全                     |
| **UI 與樣式**    | shadcn/ui         | latest   | 可組合的 UI 元件庫           |
|                  | Tailwind CSS      | v4       | Utility-first CSS 框架       |
|                  | next-themes       | latest   | 主題切換系統                 |
|                  | Radix UI          | latest   | shadcn/ui 底層無樣式元件     |
|                  | lucide-react      | latest   | 圖標庫                       |
| **表單與驗證**   | React Hook Form   | latest   | 表單狀態管理                 |
|                  | Zod               | latest   | Schema 驗證                  |
| **資料視覺化**   | Recharts          | latest   | 圖表庫（shadcn charts 基礎） |
|                  | Chart.js          | latest   | 備選圖表庫                   |
| **後端與資料庫** | Supabase                       | latest | PostgreSQL 託管服務 + Authentication                |
|                  | Prisma                         | latest | ORM（型別安全的資料庫存取）                         |
| **身份驗證**     | @supabase/supabase-js          | latest | Supabase Client SDK                                 |
|                  | @supabase/auth-helpers-nextjs  | latest | Supabase Auth Next.js 整合                          |
|                  | @supabase/auth-ui-react        | latest | （可選）Supabase Auth UI 元件                       |
| **圖片處理**     | Cloudinary        | latest   | 圖片上傳、儲存與管理         |
|                  | next-cloudinary   | latest   | Cloudinary Next.js 整合      |
| **日期處理**     | date-fns          | latest   | 日期格式化與計算             |
| **狀態管理**     | React Context     | built-in | 輕量狀態管理                 |
|                  | Zustand           | latest   | 備選：全域狀態管理（若需要） |
| **開發工具**     | ESLint            | latest   | 程式碼檢查                   |
|                  | Prettier          | latest   | 程式碼格式化                 |
|                  | TypeScript ESLint | latest   | TypeScript 程式碼檢查        |
| **部署**         | Vercel            | -        | 主機託管平台                 |
| **版本控制**     | Git + GitHub      | -        | 版本控制與 OAuth 提供者      |

**安裝指令參考：**

```bash
# 建立 Next.js 專案
npx create-next-app@latest snr-web --typescript --tailwind --app

# 安裝 shadcn/ui
npx shadcn-ui@latest init

# 安裝 Supabase 相關
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @supabase/auth-ui-react @supabase/auth-ui-shared  # 可選，若使用預建 UI

# 安裝核心依賴
npm install @prisma/client zod react-hook-form @hookform/resolvers
npm install date-fns recharts next-cloudinary next-themes

# 安裝開發依賴
npm install -D prisma @types/node
npm install -D eslint prettier eslint-config-prettier

# 初始化 Prisma
npx prisma init

# Supabase 本地開發（可選）
npm install -D supabase
npx supabase init
```

### B. 術語表

| 術語           | 英文                 | 定義                                                  |
| :------------- | :------------------- | :---------------------------------------------------- |
| R-Multiple     | R-Multiple           | 盈虧比，表示實際盈虧相對於風險的倍數（實際出場/止損） |
| 止損 Ticks     | Stop Loss Ticks      | 設定的止損點數，用於計算風險                          |
| 目標 RR 比例   | Target RR Ratio      | 預期的風險報酬比，格式如 "1:1", "1:3"                 |
| 目標 Ticks     | Target Ticks         | 根據止損和目標 RR 比例計算的目標點數                  |
| 實際出場 Ticks | Actual Exit Ticks    | 實際出場時的點數（可為負值表示虧損）                  |
| 實際 RR 結果   | Actual R-Multiple    | 實際達成的盈虧比（實際出場 Ticks / 止損 Ticks）       |
| 交易商品       | Commodity            | 交易標的（如 XAUUSD、EURUSD 等）                      |
| 設置           | Setup / Rating       | 交易設置的類型或評級（可多選）                        |
| 進場模式       | Entry Type           | 進場交易的策略或觸發條件（可多選）                    |
| 趨勢線類型     | Trendline Type       | 使用的趨勢線種類（僅趨勢線進場時使用）                |
| 盤勢判斷       | Session Type         | 交易發生的時段（亞洲盤/倫敦盤/美洲盤）                |
| 時間框架       | Timeframe            | 圖表的時間週期（例如：M5, M15, H1, H4）               |
| 勝率           | Win Rate             | 獲勝交易佔總交易的百分比                              |
| 資金曲線       | Equity Curve         | 累積盈虧隨時間變化的圖表                              |
| SDD            | Specification-Driven | 規格驅動開發方法論                                    |
| ORM            | Object-Relational    | 物件關聯映射工具（本專案使用 Prisma）                 |

### C. 參考資料

**官方文件：**

- [Next.js Documentation](https://nextjs.org/docs) - Next.js 官方文件
- [React Documentation](https://react.dev/) - React 官方文件
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript 官方文件
- [Supabase Documentation](https://supabase.com/docs) - Supabase 完整文件
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth) - Supabase 認證指南
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs) - Next.js 整合指南
- [Prisma Documentation](https://www.prisma.io/docs) - Prisma ORM 文件
- [shadcn/ui Documentation](https://ui.shadcn.com/) - shadcn/ui 元件庫
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Tailwind CSS 文件
- [Cloudinary Documentation](https://cloudinary.com/documentation) - Cloudinary 圖片處理
- [Recharts Documentation](https://recharts.org/) - Recharts 圖表庫

**社群資源：**

- [Next.js GitHub Repository](https://github.com/vercel/next.js)
- [shadcn/ui GitHub Repository](https://github.com/shadcn-ui/ui)
- [Prisma Examples](https://github.com/prisma/prisma-examples)

**學習資源：**

- [Next.js Learn](https://nextjs.org/learn) - Next.js 官方教學
- [Tailwind CSS Play](https://play.tailwindcss.com/) - Tailwind CSS 線上遊樂場
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### D. 欄位變更映射表（v1.0 → v1.1）

以下是主要的欄位變更對照表：

| 原欄位名稱 (v1.0) | 新欄位名稱 (v1.1) | 變更說明                              |
| :---------------- | :---------------- | :------------------------------------ |
| `commodity`       | `commodityId`     | 改為引用 Commodity 選項表             |
| `setupRatingId`   | `setupRatingIds`  | 改為多選（陣列）                      |
| `entryTypeId`     | `entryTypeIds`    | 改為多選（陣列）                      |
| `targetR`         | `targetRRatio`    | 改為字串格式（如 "1:3"）              |
| -                 | `stopLossTicks`   | 新增：止損點數                        |
| `ticks`           | `targetTicks`     | 改為自動計算的目標點數                |
| -                 | `actualExitTicks` | 新增：實際出場點數                    |
| `rMultiple`       | `actualRMultiple` | 重新命名以更清楚表達意義              |
| `screenshotUrls`  | `screenshotUrls`  | 資料結構改為 CloudinaryImage 物件陣列 |

### D. 修訂歷史

| 版本  | 日期       | 修訂內容                                                                                       | 作者         |
| :---- | :--------- | :--------------------------------------------------------------------------------------------- | :----------- |
| 1.2.0 | 2025-11-25 | 重大更新：身份驗證從 NextAuth.js 改為 Supabase Auth，新增 RLS 安全政策，更新環境變數與技術堆疊 | AI Assistant |
| 1.1.0 | 2025-11-24 | 重大更新：新增交易商品選項、多選支援、RR 計算重構、Cloudinary 整合、Supabase 採用              | AI Assistant |
| 1.0.0 | 2025-11-24 | 初版需求文件                                                                                   | AI Assistant |

---

**文件結束**

如有任何疑問或需要修改，請聯繫專案負責人。
