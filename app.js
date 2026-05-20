const platformMap = {
  xiaohongshu: {
    label: "小红书",
    titleStyle: "体验感 + 反差 + 人群标签",
    tags: ["小红书爆款", "真实体验", "种草清单", "新手友好"],
    cta: "想要同款方案，可以先收藏，评论区告诉我你的情况。",
  },
  douyin: {
    label: "抖音",
    titleStyle: "前三秒钩子 + 结果承诺",
    tags: ["短视频脚本", "高完播", "口播文案", "转化钩子"],
    cta: "先点个收藏，下一条我拆具体执行步骤。",
  },
  wechat: {
    label: "公众号",
    titleStyle: "问题意识 + 观点表达",
    tags: ["深度内容", "公众号选题", "用户洞察", "长期价值"],
    cta: "如果你也遇到类似问题，可以把这篇转给需要的人。",
  },
  moments: {
    label: "朋友圈",
    titleStyle: "生活化开场 + 信任背书",
    tags: ["朋友圈成交", "私域文案", "轻转化", "熟人推荐"],
    cta: "感兴趣可以直接私信我，我发你详细介绍。",
  },
  ecommerce: {
    label: "电商详情页",
    titleStyle: "卖点前置 + 利益表达",
    tags: ["详情页文案", "商品卖点", "转化提升", "购买决策"],
    cta: "现在下单，把核心问题一次解决。",
  },
  bilibili: {
    label: "B站",
    titleStyle: "选题价值 + 可看性",
    tags: ["B站标题", "内容策划", "知识分享", "视频脚本"],
    cta: "觉得有用可以三连，我会继续更新完整流程。",
  },
};

const toneMap = {
  natural: {
    label: "真实种草",
    openings: ["说真的，我一开始也没想到", "用过之后才发现", "这件事最打动我的地方是"],
    verbs: ["解决", "提升", "省下", "降低", "放大"],
  },
  sharp: {
    label: "强钩子",
    openings: ["别再用老方法了", "如果你还在纠结这件事", "很多人踩坑，是因为忽略了"],
    verbs: ["击中", "拆掉", "重塑", "拉满", "抢占"],
  },
  premium: {
    label: "高级感",
    openings: ["真正好的体验，往往藏在细节里", "它不是简单堆功能", "把复杂留给系统，把轻松留给用户"],
    verbs: ["沉淀", "优化", "呈现", "平衡", "延展"],
  },
  friendly: {
    label: "朋友推荐",
    openings: ["给你们分享一个我最近很喜欢的东西", "这条真的想发给所有朋友", "如果你也和我一样"],
    verbs: ["帮你", "省心", "搞定", "少走弯路", "轻松完成"],
  },
  professional: {
    label: "专业可信",
    openings: ["从用户决策角度看", "一个有效方案必须同时满足", "判断它值不值得用，关键看"],
    verbs: ["验证", "支撑", "提升", "匹配", "转化"],
  },
};

const goalMap = {
  conversion: "下单/咨询",
  traffic: "关注/转发",
  trust: "信任/背书",
  launch: "新品认知",
  retention: "复购/召回",
};

const lengthMap = {
  short: { paragraphs: 2, bullets: 3 },
  medium: { paragraphs: 3, bullets: 4 },
  long: { paragraphs: 4, bullets: 5 },
};

const fallbackBenefits = ["省时间", "更省心", "门槛低", "效果直观", "体验稳定"];
const hotWords = ["终于", "闭眼入", "普通人也能用", "少走弯路", "真实测评", "看完再决定", "被问爆了"];
const punctuationRegex = /[，。！？、；：,.!?;:\n\r\t]/g;

const $ = (selector) => document.querySelector(selector);

const state = {
  latestResults: [],
  isGenerating: false,
  modelUnavailable: false,
};

const draftKey = "viral-copy-generator-draft";
const draftFieldIds = [
  "rawContent",
  "platform",
  "tone",
  "goal",
  "length",
  "audience",
  "painPoint",
  "offer",
  "keywords",
];

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function splitWords(text) {
  return normalizeText(text)
    .replace(punctuationRegex, " ")
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function getInput() {
  const platformValue = $("#platform").value;
  const toneValue = $("#tone").value;
  const goalValue = $("#goal").value;
  const lengthValue = $("#length").value;
  const platform = platformMap[platformValue];
  const tone = toneMap[toneValue];
  const goal = goalMap[goalValue];
  const length = lengthMap[lengthValue];

  return {
    rawContent: $("#rawContent").value.trim(),
    platformValue,
    toneValue,
    goalValue,
    lengthValue,
    platform,
    tone,
    goal,
    length,
    audience: $("#audience").value.trim() || "正在寻找更好解决方案的人",
    painPoint: $("#painPoint").value.trim() || "信息太多、选择成本高、怕花钱踩坑",
    offer: $("#offer").value.trim() || platform.cta,
    keywords: $("#keywords").value
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

function analyzeContent(input) {
  const compact = normalizeText(input.rawContent);
  const words = splitWords(compact);
  const longWords = words.filter((word) => word.length >= 2 && word.length <= 12);
  const keywordCandidates = unique([...input.keywords, ...longWords]).slice(0, 8);
  const sentences = input.rawContent
    .split(/[。！？!?;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const productName =
    keywordCandidates.find((word) => !/的|了|和|与|是|在|让|可以|一个/.test(word)) ||
    sentences[0]?.slice(0, 12) ||
    "这个内容";

  const benefits = unique([
    ...input.keywords,
    ...sentences
      .filter((sentence) => /省|快|高|低|轻松|简单|专业|效率|安全|好用|提升|解决|适合/.test(sentence))
      .map((sentence) => sentence.slice(0, 18)),
    ...fallbackBenefits,
  ]).slice(0, input.length.bullets);

  const proofPoints = unique(
    sentences
      .filter((sentence) => /\d|年|天|小时|客户|案例|反馈|认证|团队|经验|用户|好评/.test(sentence))
      .map((sentence) => sentence.slice(0, 36)),
  ).slice(0, 3);

  return {
    compact,
    productName,
    keywords: keywordCandidates.length ? keywordCandidates : fallbackBenefits,
    benefits,
    proofPoints,
    firstSentence: sentences[0] || compact.slice(0, 48) || "把复杂问题变成一个更轻松的选择",
  };
}

function pick(list, index = 0) {
  return list[index % list.length];
}

function makeTitles(input, info) {
  const audience = input.audience;
  const benefit = pick(info.benefits);
  const keyword = pick(info.keywords, 1);
  const titles = [
    `${audience}别错过：${info.productName}真的把“${benefit}”讲明白了`,
    `我为什么建议你先看完${info.productName}再做决定？`,
    `${pick(hotWords, 0)}！${keyword}这件事终于有了更省心的办法`,
    `被问了很多次，${info.productName}到底值不值得试？`,
    `${input.platform.label}可发：${info.productName}的${input.platform.titleStyle}`,
    `如果你也怕${input.painPoint}，这套思路可以直接抄`,
  ];

  return unique(titles).slice(0, 6);
}

function makeHook(input, info, variant = 0) {
  const opening = pick(input.tone.openings, variant);
  const verb = pick(input.tone.verbs, variant);
  const benefit = pick(info.benefits, variant);
  return `${opening}，${info.productName}真正厉害的地方不是“看起来不错”，而是能帮${input.audience}${verb}${benefit}。`;
}

function makeBody(input, info, variant = 0) {
  const bullets = info.benefits
    .map((benefit, index) => `${index + 1}. ${benefit}：对应的是“${pick([input.painPoint, "决策慢", "执行难", "不知道怎么开始"], index)}”这个真实问题。`)
    .join("\n");

  const proof =
    info.proofPoints.length > 0
      ? `\n\n可信点：${info.proofPoints.join("；")}。`
      : `\n\n我的判断标准很简单：是否降低理解成本、是否能立刻使用、是否真的减少试错。`;

  const extra =
    input.length.paragraphs > 2
      ? `\n\n适合人群：${input.audience}。如果你正在纠结${input.painPoint}，它的价值会更明显。`
      : "";

  return `${makeHook(input, info, variant)}\n\n核心卖点：\n${bullets}${proof}${extra}\n\n${input.offer}`;
}

function makeXiaohongshu(input, info) {
  return {
    kicker: "种草笔记",
    title: makeTitles(input, info)[0],
    score: 93,
    content: `${makeTitles(input, info)[0]}\n\n${makeBody(input, info, 0)}\n\n#${input.platform.tags.join(" #")} #${info.keywords.slice(0, 3).join(" #")}`,
  };
}

function makeDouyin(input, info) {
  const lines = [
    `前三秒：${pick(hotWords, 1)}，${input.audience}一定要听完这条。`,
    `问题：你是不是也遇到过${input.painPoint}？`,
    `转折：其实不用硬扛，${info.productName}把关键步骤变简单了。`,
    `卖点：${info.benefits.map((item) => `「${item}」`).join("、")}。`,
    `行动：${input.offer}`,
  ];

  return {
    kicker: "短视频口播",
    title: `${info.productName}短视频爆款脚本`,
    score: 91,
    content: lines.join("\n"),
  };
}

function makeMoments(input, info) {
  return {
    kicker: "私域转化",
    title: "朋友圈成交文案",
    score: 88,
    content: `最近一直在研究${info.productName}，越看越觉得它适合${input.audience}。\n\n最核心的不是噱头，而是它能解决：${input.painPoint}。\n\n我整理了几个最值得关注的点：\n${info.benefits.map((item) => `- ${item}`).join("\n")}\n\n${input.offer}`,
  };
}

function makeWechat(input, info) {
  return {
    kicker: "长文开头",
    title: makeTitles(input, info)[1],
    score: 86,
    content: `${makeTitles(input, info)[1]}\n\n${info.firstSentence}。\n\n很多时候，用户不是不想行动，而是卡在三个地方：不知道该不该选、担心投入没有回报、缺少一个足够清晰的判断标准。\n\n${info.productName}的优势在于，它把“${input.painPoint}”这件事拆成了更容易理解的步骤，也给了${input.audience}一个更稳的选择。`,
  };
}

function makeEcommerce(input, info) {
  return {
    kicker: "商品卖点",
    title: `${info.productName}详情页首屏文案`,
    score: 89,
    content: `主标题：${info.productName}，让${input.audience}${pick(input.tone.verbs, 1)}${pick(info.benefits, 1)}\n\n副标题：针对${input.painPoint}，把复杂选择变成清晰答案。\n\n购买理由：\n${info.benefits.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\n信任补强：${info.proofPoints.join("；") || "真实需求出发，围绕结果设计。"}\n\n按钮文案：${input.goal === "下单/咨询" ? "立即了解" : "查看完整方案"}`,
  };
}

function makeTitleBank(input, info) {
  return {
    kicker: "标题池",
    title: "可直接 A/B 测试的标题",
    score: 94,
    content: makeTitles(input, info)
      .map((title, index) => `${index + 1}. ${title}`)
      .join("\n"),
  };
}

function buildLocalResults(input) {
  const info = analyzeContent(input);
  const baseResults = [
    makeTitleBank(input, info),
    makeXiaohongshu(input, info),
    makeDouyin(input, info),
    makeMoments(input, info),
    makeWechat(input, info),
    makeEcommerce(input, info),
  ];

  const preferred = {
    xiaohongshu: ["标题池", "种草笔记", "短视频口播", "私域转化"],
    douyin: ["标题池", "短视频口播", "种草笔记", "私域转化"],
    wechat: ["标题池", "长文开头", "私域转化", "商品卖点"],
    moments: ["私域转化", "标题池", "种草笔记", "商品卖点"],
    ecommerce: ["商品卖点", "标题池", "种草笔记", "短视频口播"],
    bilibili: ["标题池", "长文开头", "短视频口播", "种草笔记"],
  }[input.platformValue];

  const results = preferred
    .map((kicker) => baseResults.find((item) => item.kicker === kicker))
    .filter(Boolean);

  return { info, results };
}

function buildModelPayload(input) {
  return {
    rawContent: input.rawContent,
    platform: input.platform.label,
    platformValue: input.platformValue,
    tone: input.tone.label,
    goal: input.goal,
    length: input.lengthValue,
    audience: input.audience,
    painPoint: input.painPoint,
    offer: input.offer,
    keywords: input.keywords,
  };
}

function normalizeModelResults(results) {
  if (!Array.isArray(results)) return [];

  return results
    .map((result) => ({
      kicker: String(result?.kicker || "AI 文案").slice(0, 24),
      title: String(result?.title || "生成结果").slice(0, 80),
      score: Math.max(0, Math.min(100, Math.round(Number(result?.score) || 88))),
      content: String(result?.content || "").trim(),
    }))
    .filter((result) => result.content)
    .slice(0, 6);
}

async function requestModelResults(input) {
  if (state.modelUnavailable || window.location.protocol === "file:") {
    return null;
  }

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(buildModelPayload(input)),
  });

  if ([404, 405, 501].includes(response.status)) {
    state.modelUnavailable = true;
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "模型接口请求失败。");
  }

  const results = normalizeModelResults(data.results);
  if (!results.length) {
    throw new Error("模型没有返回可用文案。");
  }

  return { ...data, results };
}

function setGenerating(isGenerating) {
  state.isGenerating = isGenerating;
  const generateButton = $("#generateButton");
  generateButton.disabled = isGenerating;
  generateButton.textContent = isGenerating ? "AI 生成中..." : "生成文案";
}

async function generateResults() {
  if (state.isGenerating) return;

  const input = getInput();

  if (!input.rawContent) {
    showToast("先贴一段内容，再生成文案。");
    $("#rawContent").focus();
    return;
  }

  setGenerating(true);

  try {
    const modelData = await requestModelResults(input);

    if (modelData) {
      state.latestResults = modelData.results;
      renderResults(state.latestResults);
      renderModelInsights(input, modelData);
      showToast("AI 文案已生成");
      return;
    }
  } catch (error) {
    console.warn(error);
    showToast("模型暂时不可用，已用本地引擎生成。");
  } finally {
    setGenerating(false);
  }

  const { info, results } = buildLocalResults(input);
  state.latestResults = results;
  renderResults(state.latestResults);
  renderInsights(input, info, state.latestResults, "本地引擎");
}

function renderResults(results) {
  const grid = $("#resultGrid");
  const template = $("#resultCardTemplate");
  grid.innerHTML = "";

  results.forEach((result) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".card-kicker").textContent = result.kicker;
    node.querySelector("h3").textContent = result.title;
    node.querySelector(".score-badge").textContent = `${result.score} 分`;
    node.querySelector("pre").textContent = result.content;
    node.querySelector(".copy-button").addEventListener("click", () => {
      copyText(result.content);
    });
    grid.appendChild(node);
  });
}

function renderInsights(input, info, results, source = "本地引擎") {
  $("#insightStrip").innerHTML = [
    `来源：${source}`,
    `平台：${input.platform.label}`,
    `标题 ${makeTitles(input, info).length} 条`,
    `标签 ${input.platform.tags.length + Math.min(info.keywords.length, 3)} 个`,
    `目标：${input.goal}`,
    `关键词：${info.keywords.slice(0, 3).join(" / ")}`,
  ]
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
}

function renderModelInsights(input, modelData) {
  const keywords = Array.isArray(modelData.insights?.keywords) ? modelData.insights.keywords : [];
  const titleCount = Math.round(Number(modelData.insights?.titleCount) || 0);
  const tagCount = Math.round(Number(modelData.insights?.tagCount) || keywords.length);

  $("#insightStrip").innerHTML = [
    `来源：${modelData.model || "AI 模型"}`,
    `平台：${input.platform.label}`,
    `标题 ${titleCount || "多"} 条`,
    `标签 ${tagCount} 个`,
    `目标：${input.goal}`,
    keywords.length ? `关键词：${keywords.slice(0, 3).join(" / ")}` : "",
  ]
    .filter(Boolean)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function copyText(text) {
  return copyTextWithMessage(text, "已复制");
}

async function copyTextWithMessage(text, message) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
    }
    showToast(message);
  } catch (error) {
    fallbackCopy(text);
    showToast(message);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function copyAll() {
  if (!state.latestResults.length) {
    showToast("还没有可复制的文案。");
    return;
  }

  const text = state.latestResults
    .map((item) => `【${item.kicker}】\n${item.content}`)
    .join("\n\n---\n\n");
  copyTextWithMessage(text, "已复制全部文案");
}

function downloadTxt() {
  if (!state.latestResults.length) {
    showToast("还没有可导出的文案。");
    return;
  }

  const text = state.latestResults
    .map((item) => `【${item.kicker}】\n${item.content}`)
    .join("\n\n---\n\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `爆款文案-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("TXT 已导出");
}

async function sharePage() {
  const shareData = {
    title: "爆款文案生成器",
    text: "输入内容，一键生成多平台爆款文案。",
    url: window.location.href,
  };

  if (navigator.share && window.location.protocol !== "file:") {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  const message =
    window.location.protocol === "file:"
      ? "已复制本地页面链接，部署上线后就是公开链接"
      : "已复制页面链接";
  copyTextWithMessage(shareData.url, message);
}

function saveDraft() {
  try {
    const draft = draftFieldIds.reduce((data, id) => {
      data[id] = $(`#${id}`).value;
      return data;
    }, {});
    localStorage.setItem(draftKey, JSON.stringify(draft));
  } catch (error) {
    // localStorage may be blocked in private browsing.
  }
}

function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey) || "{}");
    draftFieldIds.forEach((id) => {
      if (typeof draft[id] === "string" && $(`#${id}`)) {
        $(`#${id}`).value = draft[id];
      }
    });
  } catch (error) {
    localStorage.removeItem(draftKey);
  }
}

function showToast(message) {
  const existing = $(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1700);
}

function fillSample() {
  $("#rawContent").value =
    "轻食代餐燕麦杯，主打低糖高纤、3分钟即食、适合办公室早餐和健身后补充。产品有巧克力、莓果、坚果三种口味，单杯约180大卡，已经有不少上班族反馈饱腹感不错，不用排队买早餐。现在新品首发，买6杯送摇摇杯。";
  $("#audience").value = "早上赶时间的上班族和健身人群";
  $("#painPoint").value = "早餐没时间准备，又怕热量太高";
  $("#offer").value = "新品首发，买6杯送摇摇杯，想试可以先收藏。";
  $("#keywords").value = "低糖高纤,3分钟即食,180大卡,饱腹";
  saveDraft();
  generateResults();
}

function clearForm() {
  ["rawContent", "audience", "painPoint", "offer", "keywords"].forEach((id) => {
    $(`#${id}`).value = "";
  });
  localStorage.removeItem(draftKey);
  state.latestResults = [];
  $("#insightStrip").innerHTML = "<span>等待输入内容</span><span>标题 0 条</span><span>标签 0 个</span>";
  $("#resultGrid").innerHTML =
    '<article class="empty-state"><h3>把内容贴进左侧，点一下生成</h3><p>系统会自动拆卖点、找痛点、组合标题、正文、CTA 和平台标签。</p></article>';
}

$("#generateButton").addEventListener("click", generateResults);
$("#sampleButton").addEventListener("click", fillSample);
$("#clearButton").addEventListener("click", clearForm);
$("#shareButton").addEventListener("click", sharePage);
$("#copyAllButton").addEventListener("click", copyAll);
$("#downloadButton").addEventListener("click", downloadTxt);

draftFieldIds.forEach((id) => {
  const element = $(`#${id}`);
  element.addEventListener("input", saveDraft);
  element.addEventListener("change", saveDraft);
});

restoreDraft();

$("#rawContent").addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    generateResults();
  }
});
