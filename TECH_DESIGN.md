# AI 图片生成器技术设计

## 技术栈

- 前端：React ^18.3.1 + TypeScript ~5.6（严格模式）+ Vite ^5.4
- 样式：Tailwind CSS ^3.4（经典 v3 配置：tailwind.config.js + postcss.config.js）
- AI 能力：智谱 AI 开放平台（cogview-3 生图、glm-4-flash 对话）
- 数据存储：LocalStorage（历史记录）

## 项目结构

```
src/
  api/
    zhipu.ts          # 智谱 API 封装（chatCompletion / generateImage）
  components/
    ImageDisplay.tsx  # 结果展示区（加载态 / 图片 / 占位 / 下载）
    HistorySidebar.tsx# 历史记录侧栏（缩略图 + 删除 + 失效占位）
    Lightbox.tsx      # 大图查看遮罩层
  types.ts            # 类型定义
  constants.ts        # 尺寸与风格常量
  utils.ts            # 时间格式化、图片下载
  App.tsx             # 页面组装与业务状态
  main.tsx / index.css
```

## 数据模型

### HistoryItem（历史记录）

- id: string（时间戳 + 随机串）
- prompt: string（最终使用的提示词）
- size: ImageSize（"1024x1024" | "768x1344" | "864x1152"）
- style: StyleId（realistic | cartoon | oil | watercolor | cyberpunk）
- imageUrl: string
- createdAt: number（毫秒时间戳）

LocalStorage key：`ai-image-generator:history`，写入时容错，读取时逐条校验字段类型。

## API 调用

### 跨域方案

浏览器直连 https://open.bigmodel.cn 会被 CORS 拦截。vite.config.ts 配置：

```ts
server: {
  proxy: {
    "/api": {
      target: "https://open.bigmodel.cn",
      changeOrigin: true
    }
  }
}
```

前端统一请求 `/api/paas/v4/...` 相对路径。

### 接口一：对话（提示词优化）

- POST /api/paas/v4/chat/completions
- body: { model: "glm-4-flash", messages: [{role, content}] }
- header: Authorization: Bearer <VITE_ZHIPU_API_KEY>
- 取 choices[0].message.content

### 接口二：图片生成

- POST /api/paas/v4/images/generations
- body: { model: "cogview-3", prompt, size }
- 取 data[0].url 作为图片地址（注意 URL 有时效，及时下载）

## 关键技术点

1. 风格关键词追加：切换风格时先从提示词中移除旧关键词，再追加新关键词，避免重复堆叠
2. 生成等待体验：加载动画 + 文案 + 已等待秒数计时器
3. 图片下载：fetch blob 后用 a[download] 触发保存；跨域下载失败时降级为新窗口打开
4. 失效占位：img onError 后切换为"链接已失效/已过期"占位视图
5. API Key 从 import.meta.env.VITE_ZHIPU_API_KEY 读取，.env.example 提供模板，未配置时给出明确中文提示
