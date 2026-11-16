# AI 图片生成器 AI 开发指令

## 项目概述

使用 React + TypeScript 开发的 AI 图片生成器，调用智谱 AI 的 cogview-3 生图接口与 glm-4-flash 对话接口，生成历史保存在 LocalStorage。

## 开发环境

- 操作系统：Windows
- 终端：PowerShell / Git Bash，命令需兼容 Windows
- 包管理：npm

## 开发规范

- 使用 TypeScript 严格模式，确保类型安全，不使用 any
- 组件一律为函数式组件 + Hooks
- 样式使用 Tailwind CSS，不写自定义独立 CSS（动画等特殊情况除外）
- API Key 只从 import.meta.env.VITE_ZHIPU_API_KEY 读取，禁止硬编码
- 所有请求走 /api/paas/v4/... 相对路径（由 Vite 代理转发）

## 代码风格

- 组件名 PascalCase，函数与变量 camelCase，常量 UPPER_SNAKE_CASE
- 代码与配置一律使用 ASCII 直引号
- 界面文案使用中文
- 不留 TODO 注释，功能必须真实完整

## 功能要求

- 尺寸三选一、风格五选一，切换风格时自动追加/替换风格关键词
- 优化提示词调用 chat 接口，扩展为详细英文提示词并回填
- 生成期间显示加载动画与"通常需要 10~30 秒"提示
- 历史记录读写 LocalStorage 需要容错，字段校验不通过的记录丢弃
- 图片 URL 失效时显示占位提示，而不是让页面报错

## 测试要求

- 每个功能完成后手动测试：输入校验、加载状态、错误提示、历史增删、下载
- 验证 LocalStorage 数据在刷新后仍能恢复
- 测试不配置 .env.local 时的提示是否友好

## 注意事项

- API 调用失败要给出中文友好提示，不弹原生 alert
- 请求进行中禁用相关按钮，避免重复提交
- 保持代码简洁，避免过度设计
