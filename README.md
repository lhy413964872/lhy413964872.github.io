# 爆款文案生成器

一个可直接部署的静态网页项目。用户打开网址后，输入产品、活动、课程、服务或门店内容，就能生成适配不同平台的标题、正文、口播脚本、朋友圈文案、详情页卖点和标签。

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

## 分享上线

这个项目不需要后端和数据库，适合部署到任意静态网站平台。

### Vercel

1. 把整个 `viral-copy-generator` 文件夹上传到 GitHub
2. 在 Vercel 导入这个仓库
3. Framework Preset 选择 `Other`
4. Build Command 留空，Output Directory 留空或填 `.`
5. 部署完成后复制 Vercel 给出的公开网址

### Netlify

1. 登录 Netlify
2. 选择 Add new site
3. 上传这个文件夹，或连接 GitHub 仓库
4. Publish directory 填 `.`
5. 部署完成后分享公开网址

### GitHub Pages

1. 新建 GitHub 仓库并上传这些文件
2. 进入 Settings -> Pages
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`，目录选择 `/root`
5. 保存后等待生成公开网址

## 项目结构

```text
viral-copy-generator/
  index.html        页面结构和分享 meta
  styles.css        界面样式
  app.js            文案生成逻辑
  server.mjs        本地预览服务器
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
