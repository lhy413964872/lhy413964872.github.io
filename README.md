# 爆款文案生成器

一个可直接部署的网页项目。用户打开网址后，输入产品、活动、课程、服务或门店内容，就能生成适配不同平台的标题、正文、口播脚本、朋友圈文案、详情页卖点和标签。

现在已支持 OpenAI 模型接口：部署到 Vercel 或 Netlify 并配置 `OPENAI_API_KEY` 后，会优先调用 AI 模型生成；没有配置模型接口时，会自动使用浏览器本地备用引擎。

## 本地预览

```bash
node server.mjs
```

然后打开：

```text
http://localhost:4173
```

也可以直接双击 `index.html` 使用。

如果你更习惯 npm，也可以运行 `npm start`。在部分 Windows PowerShell 环境里，系统执行策略可能会拦截 `npm.ps1`，这时直接用 `node server.mjs` 最稳。

### 本地接入模型

先在当前目录设置环境变量：

```bash
OPENAI_API_KEY=你的_API_Key
OPENAI_MODEL=gpt5.5
```

然后运行：

```bash
node server.mjs
```

打开 `http://localhost:4173` 后，点击生成会走 `/api/generate` 调用 OpenAI Responses API。`OPENAI_MODEL` 可选，不填时默认使用 `gpt5.5`，后端会自动转换为接口需要的模型名。

## 分享上线

这个项目不需要数据库。若只用本地备用引擎，可部署到任意静态网站平台；若要让所有访问者都能使用 AI 模型，需要部署到支持 Serverless Function 的平台，例如 Vercel 或 Netlify。

### Vercel

1. 把整个 `viral-copy-generator` 文件夹上传到 GitHub
2. 在 Vercel 导入这个仓库
3. Framework Preset 选择 `Other`
4. Build Command 留空，Output Directory 留空或填 `.`
5. 在 Project Settings -> Environment Variables 添加 `OPENAI_API_KEY`
6. 可选添加 `OPENAI_MODEL=gpt5.5`
7. 部署完成后复制 Vercel 给出的公开网址

### Netlify

1. 登录 Netlify
2. 选择 Add new site
3. 上传这个文件夹，或连接 GitHub 仓库
4. Publish directory 填 `.`
5. 在 Site configuration -> Environment variables 添加 `OPENAI_API_KEY`
6. 可选添加 `OPENAI_MODEL=gpt5.5`
7. 部署完成后分享公开网址

### GitHub Pages

1. 新建 GitHub 仓库并上传这些文件
2. 进入 Settings -> Pages
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`，目录选择 `/root`
5. 保存后等待生成公开网址

注意：GitHub Pages 只能托管静态文件，不能安全保存 API Key，也不能运行 `/api/generate` 后端接口。因此 GitHub Pages 版本会自动使用本地备用引擎；如果要接入真正的模型，请使用 Vercel 或 Netlify。

## 项目结构

```text
viral-copy-generator/
  index.html        页面结构和分享 meta
  styles.css        界面样式
  app.js            文案生成逻辑
  api/generate.js   Vercel 模型接口
  api/shared/       OpenAI 调用和结果清洗
  netlify/functions Netlify 模型接口
  server.mjs        本地预览服务器和模型接口
  package.json      本地脚本
  vercel.json       Vercel 静态部署配置
  netlify.toml      Netlify 静态部署配置
  site.webmanifest  PWA 基础信息
  icon.svg          网站图标
  preview.svg       社交分享预览图
```

## 已支持

- 小红书种草笔记
- 抖音短视频口播
- 公众号长文开头
- 朋友圈私域转化
- 电商详情页首屏
- B站内容标题方向
- 草稿自动保存
- 一键复制全部
- 单条复制
- TXT 导出
- 页面链接分享
- OpenAI 模型生成
- 无模型时本地备用生成
