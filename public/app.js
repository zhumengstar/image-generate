if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const state = {
  lang: localStorage.getItem("lang") || "zh",
  user: null,
  settings: null,
  firstRun: false,
  view: "home",
  forceHero: false,
  showGenerationView: false,
  history: [],
  generating: false,
  polishing: false,
  funIndex: 0,
  funTimer: null,
  draftPrompt: "",
  promptBoxHeight: null,
  generationOptions: {
    size: "auto",
    quality: "auto",
    background: "auto",
    outputFormat: "png"
  },
  references: [],
  publishToSquare: false,
  publicGallery: [],
  checkin: {
    checkedInToday: false,
    credit: 1
  },
  authMode: "login",
  libraryTag: "all",
  librarySearch: "",
  promptItems: [],
  promptVisible: 20,
  promptLoading: true,
  historyLoaded: false,
  historyFullyLoaded: false,
  historyNextOffset: 0,
  historyLoading: false,
  historyLoadPromise: null,
  restoreWorksOnViewerClose: false,
  restorePreviewOnViewerClose: null,
  editor: {
    imageUrl: "",
    imageData: "",
    images: [],
    activeImageIndex: 0,
    prompt: "",
    tool: "brush",
    color: "#7c3aed",
    consistency: "high",
    zoom: 1,
    history: [],
    pointerDown: false,
    startPoint: null,
    snapshot: null,
    beforeGenerationSnapshot: null
  },
  stats: {
    todayGenerated: 4200
  }
};

const MAX_EDITOR_IMAGES = 4;
const MAX_HOME_REFERENCES = 1;
const WORKS_BATCH_ROWS = 3;
const HISTORY_PRELOAD_LIMIT = 12;

const i18n = {
  zh: {
    brand: "Image Studio",
    promptLibrary: "提示词库",
    imageCreate: "图片生成",
    imageEditor: "图片编辑",
    contact: "联系管理员",
    admin: "后台",
    myWorks: "我的作品",
    login: "登录",
    logout: "退出",
    headPre: "用想象力",
    headItalic: "创造",
    headPost: "世界",
    desc: "用 GPT Image 将你的创意变为精美图片，只需描述你脑海中的画面。",
    reviews: "生成后会自动保存到你的图库",
    todayGeneratedPrefix: "今日已生成",
    todayGeneratedSuffix: "张图片",
    recentTitle: "最近创作",
    recentSubtitle: "来自你的灵感",
    examplesLabel: "灵感示例",
    viewMore: "查看更多",
    placeholder: "描述你想创作的图片...",
    create: "生成",
    polish: "润色",
    polishing: "润色中",
    generating: "生成中...",
    editing: "编辑中...",
    reference: "参考图",
    options: "参数",
    size: "尺寸",
    quality: "质量",
    background: "背景",
    format: "格式",
    retry: "再次生成",
    download: "保存",
    edit: "重新编辑",
    editImage: "编辑",
    openEditor: "图片编辑",
    emptyWorks: "还没有生成记录",
    uploadEditImage: "上传或从作品中选择图片",
    uploadEditHint: "支持画笔、矩形选区和局部编辑描述",
    primaryImage: "主图",
    referenceImage: "参考图",
    primaryImageHint: "编辑目标，最终只生成这张图",
    referenceNotePlaceholder: "说明这张参考图需要参考的区域或特征",
    makePrimary: "设为主图",
    editConsistency: "一致性",
    consistencyLow: "低",
    consistencyMedium: "中",
    consistencyHigh: "高",
    copy: "复制提示词",
    use: "去生成",
    libraryBadge: "精选提示词库",
    libraryTitle: "发现无尽创意",
    librarySubtitle: "搜索风格、场景或用途，一键带入生成台。",
    librarySearchLabel: "检索",
    search: "搜索",
    all: "全部",
    noResults: "没有找到匹配的提示词",
    preview: "预览",
    totalPrompts: "精选提示词",
    totalSources: "数据源",
    loadMore: "加载更多灵感",
    loadingPrompts: "正在加载提示词库...",
    loadingWorks: "正在加载作品...",
    loginTitle: "登录以继续创作",
    registerTitle: "注册账号",
    authGift: "注册登录以继续创作",
    authContinue: "注册登录以继续创作",
    authBonus: "注册赠送 10 积分，每日签到 +1 积分",
    email: "邮箱",
    password: "密码",
    name: "昵称",
    submitLogin: "登录",
    submitRegister: "注册",
    switchToRegister: "还没有账号？注册",
    switchToLogin: "已有账号？登录",
    skip: "暂不登录",
    creditsTitle: "每日签到",
    creditsBalance: "当前积分",
    oneCredit: "每次生成消耗积分",
    contactTitle: "联系管理员",
    contactDesc: "扫码添加管理员微信",
    contactInput: "微信号 / QQ / 邮箱 / 手机号",
    messageInput: "留言内容（选填）",
    submit: "提交",
    received: "已收到",
    receivedDesc: "管理员会尽快联系你",
    close: "关闭",
    adminTitle: "后台管理",
    settings: "接口配置",
    users: "用户",
    apiKey: "OpenAI API Key",
    apiBaseUrl: "API 地址",
    model: "模型",
    defaultCredits: "默认额度",
    generationCost: "每张图消耗积分",
    maxImages: "单次张数",
    allowRegistration: "开放注册",
    requireApproval: "注册后需启用",
    save: "保存",
    clearKey: "清除 Key",
    currentKey: "当前 Key",
    noKey: "当前未配置 Key",
    publishToSquare: "公开到广场",
    role: "角色",
    status: "状态",
    credits: "积分",
    checkinToday: "签到领取积分",
    checkedIn: "今日已签到",
    checkinReward: "每天签到可获得 1 积分",
    noticeTitle: "内容合规管理公告",
    noticeSubtitle: "为营造健康、积极、向上的平台环境，我们现已全面升级内容安全审核机制",
    noticeCore: "核心管控规范",
    noticePrivacy: "隐私承诺",
    noticeTogether: "共同守护：感谢您的理解与配合。清朗的网络空间需要我们每一个人共同维护。",
    noticeAck: "我已了解",
    active: "启用",
    disabled: "停用",
    user: "用户",
    adminRole: "管理员",
    funMsgs: [
      "正在调配完美的色彩...",
      "撒上一些像素灵感...",
      "AI 画笔正在起步...",
      "将光影和构图融合在一起...",
      "正在召唤你的想象...",
      "杰作正在生长...",
      "创意正在酝酿中...",
      "添加最后的点睛之笔..."
    ]
  },
  en: {
    brand: "Image Studio",
    promptLibrary: "Prompts",
    imageCreate: "Image Create",
    imageEditor: "Image Editor",
    contact: "Contact",
    admin: "Admin",
    myWorks: "My Works",
    login: "Login",
    logout: "Logout",
    headPre: "Create with",
    headItalic: "imagination",
    headPost: "world",
    desc: "Transform your ideas into polished visuals with GPT Image. Just describe what you see in your mind.",
    reviews: "Generated images are saved to your gallery",
    todayGeneratedPrefix: "Today generated",
    todayGeneratedSuffix: "images",
    recentTitle: "Recent Creations",
    recentSubtitle: "Your creative history",
    examplesLabel: "Inspiration",
    viewMore: "View more",
    placeholder: "Describe the image you want to create...",
    create: "Create",
    polish: "Polish",
    polishing: "Polishing",
    generating: "Creating...",
    editing: "Editing...",
    reference: "Reference",
    options: "Options",
    size: "Size",
    quality: "Quality",
    background: "Background",
    format: "Format",
    retry: "Regenerate",
    download: "Save",
    edit: "Edit prompt",
    editImage: "Edit",
    openEditor: "Edit image",
    emptyWorks: "No generated images yet",
    uploadEditImage: "Upload or choose an image",
    uploadEditHint: "Brush, rectangle selection, and local edit prompts",
    primaryImage: "Primary",
    referenceImage: "Reference",
    primaryImageHint: "Editing target. Only this image will be generated",
    referenceNotePlaceholder: "Describe the area or feature to reference",
    makePrimary: "Make primary",
    editConsistency: "Consistency",
    consistencyLow: "Low",
    consistencyMedium: "Medium",
    consistencyHigh: "High",
    copy: "Copy prompt",
    use: "Generate",
    libraryBadge: "Curated Prompt Library",
    libraryTitle: "Discover Endless Creativity",
    librarySubtitle: "Search styles, scenes, and use cases, then send one straight to the composer.",
    librarySearchLabel: "Library",
    search: "Search",
    all: "All",
    noResults: "No matching prompts found",
    preview: "Preview",
    totalPrompts: "Curated Prompts",
    totalSources: "Data Sources",
    loadMore: "Load More Inspiration",
    loadingPrompts: "Loading prompt library...",
    loadingWorks: "Loading works...",
    loginTitle: "Login to continue",
    registerTitle: "Create account",
    authGift: "Sign in to continue creating",
    authContinue: "Sign in to continue creating",
    authBonus: "10 bonus credits on signup + 1 daily check-in credit",
    email: "Email",
    password: "Password",
    name: "Name",
    submitLogin: "Login",
    submitRegister: "Register",
    switchToRegister: "Need an account? Register",
    switchToLogin: "Already have an account? Login",
    skip: "Skip",
    creditsTitle: "Daily Check-in",
    creditsBalance: "Balance",
    oneCredit: "Credits per image",
    contactTitle: "Contact Admin",
    contactDesc: "Scan the QR code to contact the admin",
    contactInput: "WeChat / Email / Phone",
    messageInput: "Message (optional)",
    submit: "Submit",
    received: "Received",
    receivedDesc: "Admin will contact you soon",
    close: "Close",
    adminTitle: "Admin",
    settings: "Settings",
    users: "Users",
    apiKey: "OpenAI API Key",
    apiBaseUrl: "API Base URL",
    model: "Model",
    defaultCredits: "Default credits",
    generationCost: "Credits per image",
    maxImages: "Images per request",
    allowRegistration: "Allow registration",
    requireApproval: "Require approval",
    save: "Save",
    clearKey: "Clear key",
    currentKey: "Current key",
    noKey: "No key configured",
    publishToSquare: "Publish to square",
    role: "Role",
    status: "Status",
    credits: "Credits",
    checkinToday: "Check in",
    checkedIn: "Checked in today",
    checkinReward: "Daily check-in gives 1 credit",
    noticeTitle: "Content Safety Notice",
    noticeSubtitle: "To keep this platform healthy, positive, and safe, content safety review has been upgraded.",
    noticeCore: "Core Rules",
    noticePrivacy: "Privacy Promise",
    noticeTogether: "Together: Thank you for your understanding. A safer creative space depends on all of us.",
    noticeAck: "I understand",
    active: "Active",
    disabled: "Disabled",
    user: "User",
    adminRole: "Admin",
    funMsgs: [
      "Mixing the perfect palette...",
      "Sprinkling pixel inspiration...",
      "The AI brush is warming up...",
      "Blending light and composition...",
      "Conjuring your vision...",
      "Growing your masterpiece...",
      "Brewing creativity...",
      "Adding finishing touches..."
    ]
  }
};

const fallbackPrompts = [
  {
    id: 1,
    tag: "product",
    icon: "ri-shopping-bag-3-line",
    title: { zh: "高端产品图", en: "Premium Product Shot" },
    prompt: {
      zh: "一张高端无线充电器产品摄影，哑光黑色机身，柔和棚拍灯光，浅灰背景，精致阴影，商业广告质感，超清细节",
      en: "A premium product photo of a matte black wireless charger, soft studio lighting, light gray background, refined shadows, commercial advertising style, ultra-detailed"
    },
    colors: "linear-gradient(135deg, #0f172a, #64748b)"
  },
  {
    id: 2,
    tag: "poster",
    icon: "ri-layout-4-line",
    title: { zh: "活动海报", en: "Event Poster" },
    prompt: {
      zh: "未来感 AI 创作活动海报，干净排版，强烈视觉焦点，黑白主调点缀电光蓝，高级平面设计，适合社交媒体",
      en: "A futuristic AI creativity event poster, clean typography, strong focal point, black and white palette with electric blue accents, premium graphic design"
    },
    colors: "linear-gradient(135deg, #111827, #2563eb)"
  },
  {
    id: 3,
    tag: "photo",
    icon: "ri-camera-lens-line",
    title: { zh: "生活方式摄影", en: "Lifestyle Photo" },
    prompt: {
      zh: "清晨咖啡桌上的极简工作场景，笔记本电脑、手机和一束花，自然窗光，温暖但不过度复古，真实摄影质感",
      en: "A minimal morning workspace on a coffee table with laptop, phone, and flowers, natural window light, warm but modern, realistic photography"
    },
    colors: "linear-gradient(135deg, #0f766e, #f59e0b)"
  },
  {
    id: 4,
    tag: "character",
    icon: "ri-user-smile-line",
    title: { zh: "角色设定", en: "Character Design" },
    prompt: {
      zh: "一位未来城市中的年轻发明家角色设定，全身像，功能性服装，背包设备，清晰轮廓，电影概念艺术风格",
      en: "A young inventor in a future city, full-body character design, functional clothing, backpack device, clean silhouette, cinematic concept art"
    },
    colors: "linear-gradient(135deg, #7c3aed, #ec4899)"
  },
  {
    id: 5,
    tag: "ui",
    icon: "ri-window-line",
    title: { zh: "应用界面概念", en: "App Interface Concept" },
    prompt: {
      zh: "一款 AI 图片生成应用的移动端界面概念，白色玻璃拟态卡片，底部输入框，图片瀑布流，现代 iOS 风格，高级 UI 截图",
      en: "A mobile interface concept for an AI image generation app, white glass cards, bottom composer, image feed, modern iOS style, polished UI screenshot"
    },
    colors: "linear-gradient(135deg, #38bdf8, #6366f1)"
  },
  {
    id: 6,
    tag: "illustration",
    icon: "ri-brush-line",
    title: { zh: "童书插画", en: "Storybook Illustration" },
    prompt: {
      zh: "温柔的童书插画，一只纸船漂在星光河流上，柔软笔触，梦幻但清晰，留白充足，适合封面",
      en: "A gentle storybook illustration of a paper boat floating on a starlit river, soft brushwork, dreamy but clear, generous negative space, cover art"
    },
    colors: "linear-gradient(135deg, #8b5cf6, #fbbf24)"
  }
];

const tags = ["all", "ui", "photo", "poster", "portrait", "illustration", "anime", "product", "3d", "landscape", "character", "other", "logo", "fashion", "cyberpunk", "infographic", "food"];
const tagLabels = {
  zh: {
    all: "全部",
    ui: "UI/界面",
    photo: "摄影",
    poster: "海报插画",
    portrait: "人像摄影",
    illustration: "插画艺术",
    anime: "二次元",
    product: "产品电商",
    "3d": "3D 渲染",
    landscape: "风景城市",
    character: "角色设计",
    other: "其他",
    logo: "Logo 设计",
    fashion: "时尚",
    cyberpunk: "赛博朋克",
    infographic: "信息图",
    food: "美食"
  },
  en: {
    all: "All",
    ui: "UI",
    photo: "Photo",
    poster: "Poster",
    portrait: "Portrait",
    illustration: "Illustration",
    anime: "Anime",
    product: "E-commerce",
    "3d": "3D Render",
    landscape: "Landscape",
    character: "Character",
    other: "Other",
    logo: "Logo",
    fashion: "Fashion",
    cyberpunk: "Cyberpunk",
    infographic: "Infographic",
    food: "Food"
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const elements = {
  app: $("#app"),
  homeView: $("#homeView"),
  chatView: $("#chatView"),
  libraryView: $("#libraryView"),
  editorView: $("#editorView"),
  modalLayer: $("#modalLayer"),
  toastLayer: $("#toastLayer"),
  brandBtn: $("#brandBtn"),
  promptLibraryBtn: $("#promptLibraryBtn"),
  imageCreateBtn: $("#imageCreateBtn"),
  imageEditorBtn: $("#imageEditorBtn"),
  contactBtn: $("#contactBtn"),
  langBtn: $("#langBtn"),
  creditsBtn: $("#creditsBtn"),
  creditsText: $("#creditsText"),
  myWorksBtn: $("#myWorksBtn"),
  adminBtn: $("#adminBtn"),
  loginBtn: $("#loginBtn"),
  logoutBtn: $("#logoutBtn"),
  apiStatus: $("#apiStatus"),
  todayGeneratedText: $("#todayGeneratedText"),
  heroComposerMount: $("#heroComposerMount"),
  stickyComposerMount: $("#stickyComposerMount"),
  generationStatus: $("#generationStatus"),
  funMessage: $("#funMessage"),
  historyList: $("#historyList"),
  recentSection: $("#recentSection"),
  recentMasonry: $("#recentMasonry"),
  exampleGrid: $("#exampleGrid"),
  openLibraryInlineBtn: $("#openLibraryInlineBtn"),
  librarySearchForm: $("#librarySearchForm"),
  librarySearchInput: $("#librarySearchInput"),
  tagFilters: $("#tagFilters"),
  promptGrid: $("#promptGrid"),
  composerTemplate: $("#composerTemplate"),
  editorCanvasArea: $("#editorCanvasArea"),
  editorUploadCard: $("#editorUploadCard"),
  editorUploadInput: $("#editorUploadInput"),
  editorBottomUploadInput: $("#editorBottomUploadInput"),
  editorImageFrame: $("#editorImageFrame"),
  editorImageStrip: $("#editorImageStrip"),
  editorImageScaler: $("#editorImageScaler"),
  editorSourceImage: $("#editorSourceImage"),
  editorMaskCanvas: $("#editorMaskCanvas"),
  editorReferenceNoteWrap: $("#editorReferenceNoteWrap"),
  editorReferenceNoteInput: $("#editorReferenceNoteInput"),
  editorImageRoleText: $("#editorImageRoleText"),
  editorPromptForm: $("#editorPromptForm"),
  editorPromptInput: $("#editorPromptInput"),
  editorConsistencyInput: $("#editorConsistencyInput"),
  editorPublicInput: $("#editorPublicInput"),
  editorZoomText: $("#editorZoomText"),
  editorColorInput: $("#editorColorInput")
};

let heroVideoWatchdog = null;
let promptLibraryLoadPromise = null;

function runWhenIdle(callback, timeout = 1200) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }
  window.setTimeout(callback, Math.min(timeout, 300));
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.details?.error?.message || data.error || "Request failed");
  return data;
}

function text(key) {
  if (Object.hasOwn(i18n[state.lang], key)) return i18n[state.lang][key];
  if (Object.hasOwn(i18n.zh, key)) return i18n.zh[key];
  return key;
}

function local(value) {
  if (value && typeof value === "object") return value[state.lang] || value.zh || value.en || "";
  return value || "";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(state.lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function truncate(value, length = 120) {
  const textValue = String(value || "");
  return textValue.length > length ? `${textValue.slice(0, length)}...` : textValue;
}

function showToast(message, icon = "ri-information-line") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="${icon}"></i><span>${escapeHtml(message)}</span>`;
  elements.toastLayer.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

async function saveImageToDevice(imageUrl, fileName, title = "") {
  const fallbackOpen = () => {
    const opened = window.open(imageUrl, "_blank", "noopener");
    if (!opened) window.location.href = imageUrl;
  };

  try {
    const response = await fetch(imageUrl, { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error("Image fetch failed");
    const blob = await response.blob();
    const mimeType = blob.type || "image/png";
    const file = new File([blob], fileName, { type: mimeType });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: title || fileName,
        text: title || fileName
      });
      return;
    }

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
  } catch (error) {
    fallbackOpen();
  }
}

function applyI18n(root = document) {
  $$("[data-i18n]", root).forEach((node) => {
    node.textContent = text(node.dataset.i18n);
  });
  $$(".prompt-box").forEach((node) => {
    node.placeholder = text("placeholder");
  });
  elements.langBtn.textContent = state.lang === "zh" ? "中/EN" : "EN/中";
  updateDailyMetric();
}

function formatDailyCount(value) {
  const count = Math.max(0, Number(value) || 0);
  return `${count.toLocaleString(state.lang === "zh" ? "zh-CN" : "en-US")}${count >= 1000 ? "+" : ""}`;
}

function updateDailyMetric() {
  if (!elements.todayGeneratedText) return;
  const count = Math.max(0, Number(state.stats.todayGenerated) || 0);
  const suffix = state.lang === "en" && count === 1 ? "image" : text("todayGeneratedSuffix");
  elements.todayGeneratedText.textContent = `${text("todayGeneratedPrefix")} ${formatDailyCount(count)} ${suffix}`;
}

function updateNav() {
  const loggedIn = Boolean(state.user);
  elements.loginBtn.classList.toggle("hidden", loggedIn);
  elements.logoutBtn.classList.toggle("hidden", !loggedIn);
  elements.creditsBtn.classList.toggle("hidden", !loggedIn);
  elements.myWorksBtn.classList.toggle("hidden", !loggedIn);
  elements.adminBtn.classList.toggle("hidden", state.user?.role !== "admin");
  elements.creditsText.textContent = state.user ? `${text("credits")} ${state.user.credits}` : "0";

  const hasApiKey = Boolean(state.settings?.hasApiKey);
  elements.apiStatus.textContent = hasApiKey
    ? "GPT-IMAGE-2"
    : state.lang === "zh"
      ? "后台未配置 API Key"
      : "API key not configured";
  elements.apiStatus.style.color = hasApiKey ? "#64748b" : "#b42318";
}

function setView(view) {
  state.view = view;
  elements.app.classList.toggle("editor-mode", view === "editor");
  elements.homeView.classList.toggle("hidden", view !== "home" || (!shouldShowHero() && view === "home"));
  elements.chatView.classList.toggle("hidden", view !== "home" || shouldShowHero());
  elements.libraryView.classList.toggle("hidden", view !== "library");
  elements.editorView.classList.toggle("hidden", view !== "editor");
  if (view === "library") renderLibrary();
  if (view === "editor") renderEditor();
  updateNav();
  if (view === "home" && shouldShowHero()) {
    requestAnimationFrame(playHeroVideo);
  }
}

function shouldShowHero() {
  return state.forceHero || !state.showGenerationView;
}

function showHomeHero({ focusPrompt = false, smooth = false, scrollTop = 160 } = {}) {
  state.view = "home";
  state.forceHero = true;
  state.showGenerationView = false;
  setView("home");
  window.scrollTo({ top: scrollTop, behavior: smooth ? "smooth" : "auto" });
  restartHeroVideo();
  if (focusPrompt) {
    setTimeout(() => $(".prompt-box", elements.heroComposerMount)?.focus(), 120);
  }
}

function saveActionHtml(imageUrl, fileName, label = text("download")) {
  if (window.matchMedia?.("(min-width: 861px)").matches) return "";
  return `<button type="button" data-save-image="${escapeHtml(imageUrl)}" data-save-file="${escapeHtml(fileName)}" data-save-label="${escapeHtml(label)}"><i class="ri-download-line"></i>${escapeHtml(label)}</button>`;
}

function openPromptLibrary() {
  setView("library");
  window.scrollTo({ top: 0, behavior: "auto" });
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  if (state.promptLoading) loadPromptLibrary();
}

function renderAll() {
  applyI18n();
  updateNav();
  renderRecentCreations();
  renderExamples();
  renderHistory();
  if (state.view === "library") renderLibrary();
  if (state.view === "editor") renderEditor();
  renderComposers();
  setView(state.view);
}

function recentFallbackItems() {
  return getPromptSource().slice(0, 4).map((prompt, index) => ({
    id: `sample_${prompt.id}`,
    prompt: prompt.prompt,
    title: prompt.title,
    image: prompt.image,
    icon: prompt.icon || "ri-image-line",
    colors: prompt.colors,
    isSample: true,
    heightClass: ["tall", "medium", "short", "medium", "tall", "short"][index % 6]
  }));
}

function recentHistoryItems() {
  return state.history
    .filter((item) => item.images?.[0])
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
    .map((item, index) => ({
      id: item.id,
      prompt: item.prompt,
      title: truncate(item.prompt, 36),
      image: item.images[0],
      isSample: false,
      isPublic: Boolean(item.isPublic),
      heightClass: ["medium", "tall", "short", "medium"][index % 4],
      time: item.time
    }));
}

function renderRecentCreations() {
  const items = recentHistoryItems();
  const displayItems = (items.length ? items : recentFallbackItems()).slice(0, 4);
  elements.recentMasonry.innerHTML = displayItems.map((item) => {
    const visual = item.image
      ? `<img src="${escapeHtml(promptImageUrl(item.image))}" loading="lazy" decoding="async" fetchpriority="low" alt="${escapeHtml(truncate(item.prompt, 80))}">`
      : `<div class="recent-gradient" style="--art-bg:${item.colors}"><i class="${item.icon}"></i></div>`;
    const imageUrl = item.image ? promptImageUrl(item.image) : "";
    return `
      <article class="recent-tile work-card" data-recent-id="${escapeHtml(item.id)}">
        <button class="work-image-button" type="button" data-recent-view="${escapeHtml(item.id)}" aria-label="${escapeHtml(truncate(item.prompt, 80))}">
          ${visual}
        </button>
        <div class="work-body">
          <button class="work-text-button" type="button" data-recent-view="${escapeHtml(item.id)}">${escapeHtml(truncate(item.prompt, 92))}</button>
          <div class="work-footer">
            <span>${escapeHtml(item.time ? formatDate(item.time) : "")}${item.isPublic ? ` · ${text("publishToSquare")}` : ""}</span>
            <div class="work-actions">
              ${imageUrl ? saveActionHtml(imageUrl, `${item.id}.png`) : ""}
              <button type="button" data-recent-retry="${escapeHtml(item.id)}"><i class="ri-refresh-line"></i>${text("retry")}</button>
              ${imageUrl ? `<button type="button" data-recent-editor="${escapeHtml(item.id)}"><i class="ri-magic-line"></i>${text("openEditor")}</button>` : ""}
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  $$("[data-recent-view]", elements.recentMasonry).forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.recentView;
      const item = displayItems.find((entry) => String(entry.id) === id);
      if (item) openRecentPreview(item);
    });
  });
  $$("[data-recent-retry]", elements.recentMasonry).forEach((button) => {
    button.addEventListener("click", () => {
      const item = displayItems.find((entry) => String(entry.id) === button.dataset.recentRetry);
      if (!item) return;
      regenerateItem(item);
    });
  });
  $$("[data-recent-editor]", elements.recentMasonry).forEach((button) => {
    button.addEventListener("click", () => {
      const item = displayItems.find((entry) => String(entry.id) === button.dataset.recentEditor);
      if (item?.image) openImageEditor(promptImageUrl(item.image), item.prompt, item);
    });
  });
}

function openRecentPreview(item, options = {}) {
  state.restoreWorksOnViewerClose = Boolean(options.restoreWorks);
  const imageUrl = item.image ? promptImageUrl(item.image) : "";
  const visual = item.image
    ? `<button class="preview-image-button" type="button" data-preview-image><img class="preview-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(truncate(item.prompt, 80))}"></button>`
    : `<div class="preview-gradient" style="--art-bg:${item.colors}"><i class="${item.icon}"></i></div>`;
  openModal(`
    <section class="modal preview-modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      ${visual}
      <div class="preview-body">
        <h2>${escapeHtml(item.title || text("preview"))}</h2>
        <p>${escapeHtml(item.prompt)}</p>
        <div class="message-actions preview-actions">
          ${imageUrl ? saveActionHtml(imageUrl, `${item.id}.png`) : ""}
          ${item.image ? `<button type="button" data-preview-editor><i class="ri-magic-line"></i>${text("openEditor")}</button>` : ""}
          <button type="button" data-preview-use><i class="ri-edit-line"></i>${text("edit")}</button>
          <button type="button" data-preview-copy><i class="ri-file-copy-line"></i>${text("copy")}</button>
        </div>
      </div>
    </section>
  `);
  $("[data-preview-image]", elements.modalLayer)?.addEventListener("click", () => {
    openImageViewer(imageUrl, item.prompt, item.id, {
      restorePreview: item,
      restoreWorks: Boolean(options.restoreWorks)
    });
  });
  $("[data-preview-use]", elements.modalLayer).addEventListener("click", () => {
    state.draftPrompt = item.prompt;
    state.restoreWorksOnViewerClose = false;
    closeModal();
    state.forceHero = true;
    state.showGenerationView = false;
    setView("home");
    syncComposers();
    setTimeout(() => $(".prompt-box", elements.heroComposerMount)?.focus(), 120);
  });
  $("[data-preview-editor]", elements.modalLayer)?.addEventListener("click", () => {
    state.restoreWorksOnViewerClose = false;
    closeModal();
    openImageEditor(imageUrl, item.prompt, item);
  });
  $("[data-preview-copy]", elements.modalLayer).addEventListener("click", async () => {
    await copyText(item.prompt);
    showToast(state.lang === "zh" ? "提示词已复制" : "Prompt copied", "ri-file-copy-line");
  });
}

function renderComposers() {
  if (!elements.heroComposerMount.children.length) {
    elements.heroComposerMount.appendChild(createComposer(false));
  }
  if (!elements.stickyComposerMount.children.length) {
    elements.stickyComposerMount.appendChild(createComposer(true));
  }
  syncComposers();
}

function pastedImageFiles(event, prefix = "pasted-image") {
  return [...(event.clipboardData?.items || [])]
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item, index) => {
      const file = item.getAsFile();
      if (!file) return null;
      const extension = file.type.split("/")[1] || "png";
      return new File([file], `${prefix}-${Date.now()}-${index}.${extension}`, { type: file.type });
    })
    .filter(Boolean);
}

function addReferenceFiles(files, sourceForm, { pasted = false } = {}) {
  const selectedFiles = [...(files || [])].filter((file) => file?.type?.startsWith("image/"));
  if (!selectedFiles.length) return false;
  state.references.forEach((reference) => {
    if (reference?.url) URL.revokeObjectURL(reference.url);
  });
  state.references = selectedFiles.slice(0, MAX_HOME_REFERENCES).map((file) => ({
    file,
    url: URL.createObjectURL(file),
    name: file.name
  }));
  syncReferences(sourceForm);
  if (pasted) showToast(state.lang === "zh" ? "已粘贴图片" : "Image pasted", "ri-image-add-line");
  if (selectedFiles.length > MAX_HOME_REFERENCES) {
    showToast(state.lang === "zh" ? "首页参考图只能上传 1 张" : "Only 1 home reference image is supported", "ri-image-line");
  }
  return true;
}

function createComposer(sticky) {
  const fragment = elements.composerTemplate.content.cloneNode(true);
  const form = $(".composer", fragment);
  const textarea = $(".prompt-box", form);
  const referenceInput = $(".reference-input", form);
  const referenceRow = $(".reference-row", form);
  const optionsToggle = $(".options-toggle", form);
  const publicInput = $(".public-input", form);
  const polishButton = $(".polish-button", form);
  const advanced = $(".advanced-options", form);
  const resizeHandle = $(".composer-resize-handle", form);

  form.dataset.sticky = sticky ? "1" : "0";
  autoSizePromptBox(textarea);
  resizeHandle?.addEventListener("pointerdown", (event) => startPromptResize(event, form));
  resizeHandle?.addEventListener("keydown", (event) => {
    if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === "ArrowUp" ? 12 : -12;
    state.promptBoxHeight = clampPromptHeight((state.promptBoxHeight || textarea.offsetHeight) + delta);
    syncComposers();
  });
  textarea.addEventListener("input", () => {
    state.draftPrompt = textarea.value;
    autoSizePromptBox(textarea);
    syncComposers(form);
  });
  textarea.addEventListener("paste", (event) => {
    const files = pastedImageFiles(event, "reference");
    if (!files.length) return;
    event.preventDefault();
    addReferenceFiles(files, form, { pasted: true });
  });
  textarea.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      form.requestSubmit();
    }
  });
  referenceInput.addEventListener("change", () => {
    const added = addReferenceFiles(referenceInput.files, form);
    referenceInput.value = "";
    if (added) {
      showToast(state.lang === "zh" ? "已添加参考图" : "Reference image added", "ri-image-add-line");
    }
  });
  optionsToggle.addEventListener("click", () => {
    advanced.classList.toggle("hidden");
    optionsToggle.classList.toggle("active", !advanced.classList.contains("hidden"));
  });
  publicInput.addEventListener("change", () => {
    state.publishToSquare = publicInput.checked;
    syncComposers(form);
  });
  polishButton.addEventListener("click", () => polishPrompt(form));
  $$(".advanced-options select", form).forEach((select) => {
    select.addEventListener("change", () => {
      state.generationOptions = getComposerOptions(form);
      updateCustomSizeVisibility(form);
      syncComposers(form);
    });
  });
  $$(".custom-size-row input", form).forEach((input) => {
    input.addEventListener("input", () => {
      state.generationOptions = getComposerOptions(form);
      syncComposers(form);
    });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitGeneration(form);
  });
  applyI18n(form);
  return fragment;
}

function getComposerOptions(form) {
  const sizeValue = $(".size-input", form).value;
  const customWidth = $(".custom-width-input", form)?.value || "2048";
  const customHeight = $(".custom-height-input", form)?.value || "2048";
  return {
    size: sizeValue === "custom" ? `${customWidth}x${customHeight}` : sizeValue,
    sizeMode: sizeValue,
    customWidth,
    customHeight,
    quality: $(".quality-input", form).value,
    background: $(".background-input", form).value,
    outputFormat: $(".format-input", form).value,
    isPublic: $(".public-input", form).checked
  };
}

function updateCustomSizeVisibility(form) {
  const row = $(".custom-size-row", form);
  if (!row) return;
  row.classList.toggle("hidden", $(".size-input", form).value !== "custom");
}

function syncComposers(sourceForm) {
  $$(".composer").forEach((form) => {
    if (form !== sourceForm) {
      $(".prompt-box", form).value = state.draftPrompt;
      const mode = state.generationOptions.sizeMode || state.generationOptions.size;
      $(".size-input", form).value = [...$(".size-input", form).options].some((option) => option.value === mode) ? mode : "custom";
      $(".custom-width-input", form).value = state.generationOptions.customWidth || "2048";
      $(".custom-height-input", form).value = state.generationOptions.customHeight || "2048";
      $(".quality-input", form).value = state.generationOptions.quality;
      $(".background-input", form).value = state.generationOptions.background;
      $(".format-input", form).value = state.generationOptions.outputFormat;
      $(".public-input", form).checked = state.publishToSquare;
    }
    autoSizePromptBox($(".prompt-box", form));
    updateCustomSizeVisibility(form);
    $(".model-label", form).textContent = "GPT-IMAGE-2";
    $(".send-button", form).disabled = state.generating || !state.settings?.hasApiKey;
    const polishButton = $(".polish-button", form);
    if (polishButton) {
      const label = state.polishing ? text("polishing") : text("polish");
      polishButton.disabled = state.polishing || !state.settings?.hasApiKey;
      polishButton.title = label;
      polishButton.setAttribute("aria-label", label);
      $("span", polishButton).textContent = label;
    }
  });
}

function autoSizePromptBox(textarea) {
  if (!textarea) return;
  const maxHeight = 168;
  const minHeight = 46;
  textarea.style.height = "auto";
  const nextHeight = state.promptBoxHeight == null
    ? Math.max(minHeight, Math.min(maxHeight, textarea.scrollHeight))
    : clampPromptHeight(state.promptBoxHeight);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = "auto";
}

function clampPromptHeight(value) {
  return Math.max(46, Math.min(168, Number(value) || 46));
}

function startPromptResize(event, form) {
  const textarea = $(".prompt-box", form);
  if (!textarea) return;
  event.preventDefault();
  const startY = event.clientY;
  const startHeight = textarea.offsetHeight || state.promptBoxHeight || 46;
  const handle = event.currentTarget;
  handle.setPointerCapture?.(event.pointerId);
  document.body.classList.add("is-resizing-composer");

  const move = (moveEvent) => {
    const upwardDelta = Math.max(0, startY - moveEvent.clientY);
    state.promptBoxHeight = clampPromptHeight(startHeight + upwardDelta);
    syncComposers();
  };
  const stop = () => {
    handle.releasePointerCapture?.(event.pointerId);
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", stop);
    document.removeEventListener("pointercancel", stop);
    document.body.classList.remove("is-resizing-composer");
  };

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", stop);
  document.addEventListener("pointercancel", stop);
}

function renderReferences(row) {
  row.innerHTML = "";
  row.classList.add("hidden");
  const form = row.closest(".composer");
  const addButton = $(".add-reference-button", form);
  if (!addButton) return;
  $(".reference-preview", addButton)?.remove();
  addButton.classList.toggle("has-reference", state.references.length > 0);
  const reference = state.references[0];
  if (reference) {
    addButton.insertAdjacentHTML("beforeend", `
      <span class="reference-preview">
        <img src="${escapeHtml(reference.url)}" alt="${escapeHtml(reference.name)}">
        <span role="button" tabindex="0" data-remove-reference="0"><i class="ri-close-line"></i></span>
      </span>
    `);
  }
  $$("[data-remove-reference]", addButton).forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const [removed] = state.references.splice(0, 1);
      if (removed?.url) URL.revokeObjectURL(removed.url);
      syncReferences();
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      button.click();
    });
  });
}

function syncReferences(sourceForm) {
  $$(".reference-row").forEach((row) => {
    renderReferences(row);
  });
}

async function submitGeneration(form) {
  const prompt = $(".prompt-box", form).value.trim();
  if (!prompt) return;
  if (!state.user) {
    state.draftPrompt = prompt;
    openAuthModal("login");
    return;
  }
  if (!state.settings?.hasApiKey) {
    showToast(state.lang === "zh" ? "请先在后台配置 OpenAI API Key" : "Configure the OpenAI API key first", "ri-key-2-line");
    return;
  }
  if (state.generating) return;

  state.draftPrompt = "";
  state.generationOptions = getComposerOptions(form);
  state.publishToSquare = state.generationOptions.isPublic;
  const homeReference = state.references[0] || null;
  const editContext = homeReference?.file
    ? {
        primaryImage: {
          imageData: await blobToDataUrl(homeReference.file),
          maskData: ""
        },
        referenceImages: [],
        editConsistency: "high"
      }
    : null;
  const tempId = `tmp_${Date.now()}`;
  const item = {
    id: tempId,
    prompt,
    images: [],
    status: "generating",
    time: new Date().toISOString(),
    isPublic: state.publishToSquare,
    options: { ...state.generationOptions },
    references: state.references.map((reference) => reference.url),
    editContext
  };
  state.history.push(item);
  state.forceHero = false;
  state.showGenerationView = true;
  state.generating = true;
  state.references = [];
  startFunMessages();
  renderAll();
  setView("home");
  scrollToBottom();

  try {
    const data = editContext
      ? await api("/api/images/edit", {
          method: "POST",
          body: JSON.stringify({
            prompt,
            primaryImage: editContext.primaryImage,
            referenceImages: [],
            editConsistency: editContext.editConsistency,
            size: item.options.size,
            isPublic: item.isPublic
          })
        })
      : await api("/api/images/generate", {
          method: "POST",
          body: JSON.stringify({
            prompt,
            size: item.options.size,
            quality: item.options.quality,
            background: item.options.background,
            outputFormat: item.options.outputFormat,
            isPublic: item.isPublic,
            n: 1
          })
        });
    const generation = data.generations[0];
    state.history = state.history.map((entry) =>
      entry.id === tempId
        ? {
            ...entry,
            id: generation.id,
            images: [generation.imageUrl],
            status: "done",
            time: generation.createdAt,
            model: generation.model,
            isPublic: Boolean(generation.isPublic),
            editContext
          }
        : entry
    );
    state.user.credits = data.credits;
    state.stats.todayGenerated += data.generations.length;
    updateDailyMetric();
    if (item.isPublic) await loadPublicGallery();
    showToast(state.lang === "zh" ? "已生成" : "Created", "ri-sparkling-2-fill");
  } catch (error) {
    state.history = state.history.map((entry) =>
      entry.id === tempId ? { ...entry, status: "error", error: error.message } : entry
    );
    if (/credit|额度|积分|Not enough/i.test(error.message)) openCreditsModal();
    else showToast(error.message, "ri-error-warning-line");
  } finally {
    state.generating = false;
    stopFunMessages();
    renderAll();
    scrollToBottom();
  }
}

async function polishPrompt(form) {
  const textarea = $(".prompt-box", form);
  const prompt = textarea.value.trim();
  if (!prompt || state.polishing) return;
  if (!state.user) {
    state.draftPrompt = prompt;
    openAuthModal("login");
    return;
  }

  state.polishing = true;
  syncComposers(form);
  try {
    const data = await api("/api/prompts/polish", {
      method: "POST",
      body: JSON.stringify({ prompt })
    });
    const polished = String(data.prompt || "").trim();
    if (!polished) throw new Error("Empty polished prompt");
    state.draftPrompt = polished;
    syncComposers();
    const target = $(".prompt-box", form);
    target.focus();
    target.setSelectionRange(target.value.length, target.value.length);
    showToast(state.lang === "zh" ? "AI润色完成" : "Prompt polished", "ri-sparkling-2-line");
  } catch (error) {
    showToast(error.message, "ri-error-warning-line");
  } finally {
    state.polishing = false;
    syncComposers();
  }
}

function startFunMessages() {
  stopFunMessages();
  state.funIndex = 0;
  elements.generationStatus.classList.remove("hidden");
  elements.funMessage.textContent = text("funMsgs")[0];
  state.funTimer = setInterval(() => {
    const messages = text("funMsgs");
    state.funIndex = (state.funIndex + 1) % messages.length;
    elements.funMessage.textContent = messages[state.funIndex];
  }, 3000);
}

function stopFunMessages() {
  if (state.funTimer) clearInterval(state.funTimer);
  state.funTimer = null;
  elements.generationStatus.classList.add("hidden");
}

function scrollToBottom() {
  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 80);
}

function cloneEditContext(context) {
  return context ? JSON.parse(JSON.stringify(context)) : null;
}

async function regenerateItem(item) {
  if (!item) return;
  if (!item.editContext) {
    state.draftPrompt = item.prompt;
    syncComposers();
    const form = $(".composer", elements.stickyComposerMount) || $(".composer", elements.heroComposerMount);
    submitGeneration(form);
    return;
  }
  if (!state.user) {
    openAuthModal("login");
    return;
  }
  if (!state.settings?.hasApiKey) {
    showToast(state.lang === "zh" ? "请先在后台配置 OpenAI API Key" : "Configure the OpenAI API key first", "ri-key-2-line");
    return;
  }
  if (state.generating) return;

  const tempId = `tmp_${Date.now()}`;
  const editContext = cloneEditContext(item.editContext);
  const pendingItem = {
    id: tempId,
    prompt: item.prompt,
    images: [],
    status: "generating",
    time: new Date().toISOString(),
    isPublic: Boolean(item.isPublic),
    editContext
  };
  state.history.push(pendingItem);
  state.forceHero = false;
  state.showGenerationView = true;
  state.generating = true;
  startFunMessages();
  renderAll();
  setView("home");
  scrollToBottom();

  try {
    const data = await api("/api/images/edit", {
      method: "POST",
      body: JSON.stringify({
        prompt: item.prompt,
        primaryImage: editContext.primaryImage,
        referenceImages: editContext.referenceImages || [],
        editConsistency: editContext.editConsistency || "high",
        isPublic: Boolean(item.isPublic)
      })
    });
    const generation = data.generations[0];
    state.user.credits = data.credits;
    state.stats.todayGenerated += 1;
    state.history = state.history.map((entry) =>
      entry.id === tempId
        ? {
            ...entry,
            id: generation.id,
            images: [generation.imageUrl],
            status: "done",
            time: generation.createdAt,
            model: generation.model,
            isPublic: Boolean(generation.isPublic),
            editContext
          }
        : entry
    );
    if (generation.isPublic) await loadPublicGallery();
  } catch (error) {
    state.history = state.history.map((entry) =>
      entry.id === tempId ? { ...entry, status: "error", error: error.message } : entry
    );
    if (/credit|额度|积分|Not enough/i.test(error.message)) openCreditsModal();
    else showToast(error.message, "ri-error-warning-line");
  } finally {
    state.generating = false;
    stopFunMessages();
    renderAll();
    scrollToBottom();
  }
}

function mapHistoryGeneration(generation) {
  return {
    id: generation.id,
    prompt: generation.prompt,
    images: [generation.imageUrl],
    status: "done",
    time: generation.createdAt,
    model: generation.model,
    isPublic: Boolean(generation.isPublic),
    editContext: generation.editContext || null,
    options: {
      size: generation.size,
      quality: generation.quality,
      background: generation.background,
      outputFormat: generation.outputFormat
    }
  };
}

function mergeHistoryItems(items, append = false) {
  const merged = new Map();
  const source = append ? [...state.history, ...items] : items;
  source.forEach((item) => merged.set(String(item.id), item));
  state.history = [...merged.values()].sort((a, b) => new Date(a.time || 0) - new Date(b.time || 0));
}

async function loadHistory({ limit = HISTORY_PRELOAD_LIMIT, offset = 0, append = false } = {}) {
  if (!state.user) {
    state.history = [];
    state.historyLoaded = true;
    state.historyFullyLoaded = true;
    state.historyNextOffset = 0;
    return;
  }
  if (state.historyLoading) return state.historyLoadPromise?.catch(() => null);
  state.historyLoading = true;
  state.historyLoadPromise = (async () => {
    const data = await api(`/api/images/history?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`);
    const items = [...(data.generations || [])].reverse().map(mapHistoryGeneration);
    mergeHistoryItems(items, append || offset > 0);
    state.historyNextOffset = Number(data.nextOffset ?? state.history.length);
    state.historyFullyLoaded = !data.hasMore || items.length < limit;
  })();
  try {
    await state.historyLoadPromise;
  } catch (error) {
    showToast(error.message, "ri-error-warning-line");
  } finally {
    state.historyLoading = false;
    state.historyLoadPromise = null;
    state.historyLoaded = true;
  }
}

function renderHistory() {
  let lastDate = "";
  elements.historyList.innerHTML = state.history.map((item) => {
    const date = formatDate(item.time);
    const separator = date && date !== lastDate ? `<div class="date-separator">${date}</div>` : "";
    if (date) lastDate = date;
    const image = item.status === "done" && item.images[0]
      ? `<button class="image-view-button" type="button" data-view-image="${escapeHtml(item.id)}" aria-label="${escapeHtml(truncate(item.prompt, 80))}"><img class="img-reveal" src="${escapeHtml(item.images[0])}" alt="${escapeHtml(truncate(item.prompt, 80))}"></button>`
      : item.status === "generating"
        ? `<div class="paint-drip"><span></span><span></span><span></span><span></span><span></span></div>`
        : `<i class="ri-image-line"></i>`;
    const error = item.status === "error" ? `<div class="error-box">${escapeHtml(item.error || "Error")}</div>` : "";
    const actions = item.status === "done" ? `
      <div class="message-actions">
        <button type="button" data-retry="${escapeHtml(item.id)}"><i class="ri-refresh-line"></i>${text("retry")}</button>
        ${saveActionHtml(item.images[0], `${item.id}.png`)}
        <button type="button" data-edit="${escapeHtml(item.prompt)}"><i class="ri-edit-line"></i>${text("edit")}</button>
        <button type="button" data-edit-image="${escapeHtml(item.id)}"><i class="ri-magic-line"></i>${text("openEditor")}</button>
      </div>
    ` : item.status === "error" ? `
      <div class="message-actions">
        <button type="button" data-retry="${escapeHtml(item.id)}"><i class="ri-refresh-line"></i>${text("retry")}</button>
        <button type="button" data-edit="${escapeHtml(item.prompt)}"><i class="ri-edit-line"></i>${text("edit")}</button>
      </div>
    ` : "";
    return `
      ${separator}
      <article class="message-card fade-up">
        <div class="message-prompt">
          <i class="ri-chat-quote-line"></i>
          <div>${escapeHtml(item.prompt)}</div>
        </div>
        <div class="message-image"><div class="image-shell">${image}</div></div>
        ${error}
        ${actions}
      </article>
    `;
  }).join("");

  $$("[data-retry]", elements.historyList).forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.history.find((entry) => String(entry.id) === button.dataset.retry);
      regenerateItem(item);
    });
  });
  $$("[data-edit]", elements.historyList).forEach((button) => {
    button.addEventListener("click", () => {
      state.draftPrompt = button.dataset.edit;
      syncComposers();
      $(".prompt-box", $(".composer", elements.stickyComposerMount) || document).focus();
    });
  });
  $$("[data-edit-image]", elements.historyList).forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.history.find((entry) => String(entry.id) === button.dataset.editImage);
      if (item?.images?.[0]) openImageEditor(item.images[0], item.prompt, item);
    });
  });
  $$("[data-view-image]", elements.historyList).forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.history.find((entry) => String(entry.id) === button.dataset.viewImage);
      if (item?.images?.[0]) openImageViewer(item.images[0], item.prompt, item.id);
    });
  });
}

function renderExamples() {
  elements.exampleGrid.innerHTML = getPromptSource().slice(0, 4).map(promptCardHtml).join("");
  bindPromptCards(elements.exampleGrid);
}

function renderLibrary() {
  elements.librarySearchInput.value = state.librarySearch;
  const counts = getTagCounts();
  elements.tagFilters.innerHTML = tags
    .filter((tag) => tag === "all" || counts[tag])
    .map((tag) => `
    <button type="button" class="${state.libraryTag === tag ? "active" : ""}" data-tag="${tag}">
      ${escapeHtml(tagLabels[state.lang][tag] || tag)}
      <span>${tag === "all" ? getPromptSource().length : counts[tag]}</span>
    </button>
  `).join("");
  $$("[data-tag]", elements.tagFilters).forEach((button) => {
    button.addEventListener("click", () => {
      state.libraryTag = button.dataset.tag;
      state.promptVisible = 20;
      renderLibrary();
    });
  });

  const query = state.librarySearch.trim().toLowerCase();
  const source = getPromptSource();
  const filtered = source.filter((prompt) => {
    const matchesTag = state.libraryTag === "all" || prompt.tag === state.libraryTag;
    const promptTags = Array.isArray(prompt.tags) ? prompt.tags : [prompt.tag].filter(Boolean);
    const matchesTags = state.libraryTag === "all" || promptTags.includes(state.libraryTag);
    const haystack = `${prompt.title} ${prompt.prompt} ${promptTags.join(" ")} ${prompt.author || ""}`.toLowerCase();
    return (matchesTag || matchesTags) && (!query || haystack.includes(query));
  });
  const visible = filtered.slice(0, state.promptVisible);
  const sourceCount = getSourceCount(source);
  const stats = `
    <div class="library-stats">
      <div><strong>${source.length.toLocaleString()}+</strong><span>${text("totalPrompts")}</span></div>
      <div class="stat-divider"></div>
      <div><strong>${sourceCount}</strong><span>${text("totalSources")}</span></div>
    </div>
  `;
  elements.promptGrid.innerHTML = state.promptLoading
    ? `<div class="empty-message">${text("loadingPrompts")}</div>`
    : filtered.length
      ? `${visible.map(promptCardHtml).join("")}${visible.length < filtered.length ? `<div class="load-more-wrap"><button id="loadMorePrompts" type="button">${text("loadMore")} <span>(${visible.length}/${filtered.length})</span></button></div>` : ""}`
      : `<div class="empty-message">${text("noResults")}</div>`;
  const statsTarget = $(".library-stats");
  if (statsTarget) statsTarget.remove();
  $(".library-hero").insertAdjacentHTML("beforeend", stats);
  $("#loadMorePrompts")?.addEventListener("click", () => {
    state.promptVisible += 20;
    renderLibrary();
  });
  bindPromptCards(elements.promptGrid);
}

function getSourceCount(source) {
  const origins = new Set();
  source.forEach((prompt) => {
    if (prompt.source) origins.add(prompt.source);
    if (!prompt.sourceUrl) return;
    try {
      origins.add(new URL(prompt.sourceUrl).hostname.replace(/^www\./, ""));
    } catch {
      origins.add(prompt.sourceUrl);
    }
  });
  return Math.max(1, origins.size);
}

function promptCardHtml(prompt) {
  const promptText = prompt.prompt;
  const title = prompt.title;
  const tagsHtml = (prompt.tags || [prompt.tag].filter(Boolean)).slice(0, 3).map((tag) => `
    <span>${escapeHtml(tagLabels[state.lang][tag] || tag)}</span>
  `).join("");
  const art = prompt.image
    ? `<img src="${escapeHtml(promptImageUrl(prompt.image))}" loading="lazy" decoding="async" fetchpriority="low" alt="${escapeHtml(title)}" onerror="this.parentElement.classList.add('image-error')">`
    : `<i class="${prompt.icon || "ri-image-line"}"></i>`;
  return `
    <article class="prompt-card" data-preview-prompt="${escapeHtml(prompt.id)}" style="--art-bg:${prompt.colors || "linear-gradient(135deg,#64748b,#cbd5e1)"}">
      <div class="card-art">${art}<em><i class="ri-user-line"></i>${escapeHtml(prompt.author || "@open")}</em></div>
      <h3>${escapeHtml(title)}</h3>
      <div class="prompt-tags">${tagsHtml}</div>
      <p>${escapeHtml(promptText)}</p>
      <div class="card-actions">
        <button type="button" data-copy-prompt="${prompt.id}"><i class="ri-file-copy-line"></i>${text("copy")}</button>
        <button class="use-button" type="button" data-use-prompt="${prompt.id}">${text("use")} <i class="ri-arrow-right-line"></i></button>
      </div>
    </article>
  `;
}

function bindPromptCards(root) {
  $$("[data-preview-prompt]", root).forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      const prompt = getPromptSource().find((item) => item.id === Number(card.dataset.previewPrompt));
      if (!prompt) return;
      openRecentPreview({
        id: `prompt_${prompt.id}`,
        prompt: prompt.prompt,
        title: prompt.title,
        image: prompt.image ? promptImageUrl(prompt.image) : "",
        icon: prompt.icon || "ri-image-line",
        colors: prompt.colors
      });
    });
  });
  $$("[data-copy-prompt]", root).forEach((button) => {
    button.addEventListener("click", async () => {
      const prompt = getPromptSource().find((item) => item.id === Number(button.dataset.copyPrompt));
      await copyText(prompt.prompt);
      showToast(state.lang === "zh" ? "提示词已复制" : "Prompt copied", "ri-file-copy-line");
    });
  });
  $$("[data-use-prompt]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = getPromptSource().find((item) => item.id === Number(button.dataset.usePrompt));
      state.draftPrompt = prompt.prompt;
      state.forceHero = true;
      state.showGenerationView = false;
      setView("home");
      syncComposers();
      showToast(state.lang === "zh" ? "已填入生成框" : "Sent to composer", "ri-arrow-right-line");
      setTimeout(() => $(".prompt-box", elements.heroComposerMount)?.focus(), 120);
    });
  });
}

function openImageEditor(imageUrl = "", prompt = "", item = null) {
  state.editor.prompt = prompt || state.editor.prompt;
  setView("editor");
  if (item?.editContext) {
    restoreEditorFromEditContext(item.editContext, imageUrl);
  } else if (imageUrl) {
    setEditorImage(imageUrl);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
  setTimeout(() => elements.editorPromptInput?.focus(), 80);
}

function restoreEditorFromEditContext(context, fallbackImageUrl = "") {
  const editContext = cloneEditContext(context);
  const primaryImageData = editContext?.primaryImage?.imageData || fallbackImageUrl;
  if (!primaryImageData) {
    if (fallbackImageUrl) setEditorImage(fallbackImageUrl);
    return;
  }
  const referenceImages = Array.isArray(editContext.referenceImages) ? editContext.referenceImages : [];
  state.editor.images = [{
    id: `edit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    url: primaryImageData,
    data: primaryImageData.startsWith("data:") ? primaryImageData : "",
    name: text("primaryImage"),
    isPrimary: true,
    note: "",
    history: editContext.primaryImage?.maskData ? [editContext.primaryImage.maskData] : []
  }, ...referenceImages.map((reference, index) => {
    const imageData = reference.imageData || reference.annotatedImageData || "";
    return {
      id: `edit_${Date.now()}_${Math.random().toString(36).slice(2)}_${index}`,
      url: imageData,
      data: imageData.startsWith("data:") ? imageData : "",
      name: `${text("referenceImage")} ${index + 1}`,
      isPrimary: false,
      note: reference.note || "",
      history: []
    };
  }).filter((image) => image.url)];
  state.editor.consistency = editContext.editConsistency || "high";
  state.editor.activeImageIndex = 0;
  syncActiveEditorImage();
  resetEditorInteraction();
  renderEditor();
}

function renderEditor() {
  if (!elements.editorView) return;
  const editorImages = state.editor.images || [];
  normalizeEditorImages();
  const activeImage = editorImages[state.editor.activeImageIndex];
  const primaryIndex = getPrimaryEditorImageIndex();
  $$("[data-editor-tool]", elements.editorView).forEach((button) => {
    button.classList.toggle("active", button.dataset.editorTool === state.editor.tool);
  });
  if (document.activeElement !== elements.editorPromptInput) {
    elements.editorPromptInput.value = state.editor.prompt || "";
  }
  elements.editorConsistencyInput.value = state.editor.consistency;
  const consistencyKey = {
    low: "consistencyLow",
    medium: "consistencyMedium",
    high: "consistencyHigh"
  }[state.editor.consistency] || "consistencyHigh";
  const consistencyCurrent = $("[data-editor-consistency-current]", elements.editorView);
  if (consistencyCurrent) consistencyCurrent.textContent = text(consistencyKey);
  $$("[data-editor-consistency-value]", elements.editorView).forEach((button) => {
    button.classList.toggle("active", button.dataset.editorConsistencyValue === state.editor.consistency);
  });
  elements.editorColorInput.value = state.editor.color;
  elements.editorUploadCard.classList.toggle("hidden", Boolean(editorImages.length));
  elements.editorImageFrame.classList.toggle("hidden", !editorImages.length);
  elements.editorZoomText.textContent = `${Math.round(state.editor.zoom * 100)}%`;
  elements.editorImageScaler.style.transform = `scale(${state.editor.zoom})`;
  if (elements.editorReferenceNoteWrap) {
    elements.editorReferenceNoteWrap.classList.toggle("hidden", !editorImages.length);
    elements.editorReferenceNoteWrap.classList.toggle("reference-active", activeImage && !activeImage.isPrimary);
  }
  if (elements.editorImageRoleText) {
    elements.editorImageRoleText.textContent = activeImage?.isPrimary
      ? text("primaryImageHint")
      : `${text("referenceImage")} ${Math.max(1, state.editor.activeImageIndex)}`;
  }
  if (elements.editorReferenceNoteInput) {
    elements.editorReferenceNoteInput.classList.toggle("hidden", !activeImage || activeImage.isPrimary);
    if (document.activeElement !== elements.editorReferenceNoteInput) {
      elements.editorReferenceNoteInput.value = activeImage?.note || "";
      elements.editorReferenceNoteInput.placeholder = text("referenceNotePlaceholder");
    }
  }
  if (elements.editorImageStrip) {
    elements.editorImageStrip.innerHTML = editorImages.map((image, index) => `
      <button class="editor-image-thumb ${index === state.editor.activeImageIndex ? "active" : ""} ${image.isPrimary ? "primary" : "reference"}" type="button" data-editor-image-index="${index}" aria-label="${escapeHtml(image.name || "编辑图片")}">
        <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.name || "编辑图片")}">
        <em>${image.isPrimary ? text("primaryImage") : `${text("referenceImage")} ${referenceDisplayIndex(index)}`}</em>
        ${!image.isPrimary ? `<span class="editor-image-primary" data-editor-make-primary="${index}">${text("makePrimary")}</span>` : ""}
        <span class="editor-image-remove" data-editor-remove-image="${index}" aria-label="移除图片"><i class="ri-close-line"></i></span>
      </button>
    `).join("");
    $$("[data-editor-image-index]", elements.editorImageStrip).forEach((button) => {
      button.addEventListener("click", (event) => {
        if (event.target.closest("[data-editor-remove-image]")) return;
        selectEditorImage(Number(button.dataset.editorImageIndex));
      });
    });
    $$("[data-editor-remove-image]", elements.editorImageStrip).forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        removeEditorImage(Number(button.dataset.editorRemoveImage));
      });
    });
    $$("[data-editor-make-primary]", elements.editorImageStrip).forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        makeEditorImagePrimary(Number(button.dataset.editorMakePrimary));
      });
    });
  }
  if (state.editor.imageUrl && elements.editorSourceImage.getAttribute("src") !== state.editor.imageUrl) {
    elements.editorSourceImage.src = state.editor.imageUrl;
  }
}

function normalizeEditorImages() {
  const images = state.editor.images || [];
  if (!images.length) return;
  const activeImage = images[state.editor.activeImageIndex] || images[0];
  let primarySeen = false;
  images.forEach((image, index) => {
    if (image.isPrimary && !primarySeen) {
      primarySeen = true;
    } else {
      image.isPrimary = false;
    }
    image.history = image.history || [];
    image.note = image.note || "";
  });
  if (!primarySeen) images[0].isPrimary = true;
  const primaryIndex = images.findIndex((image) => image.isPrimary);
  if (primaryIndex > 0) {
    const [primaryImage] = images.splice(primaryIndex, 1);
    images.unshift(primaryImage);
  }
  state.editor.activeImageIndex = Math.max(0, images.indexOf(activeImage));
}

function getPrimaryEditorImageIndex() {
  normalizeEditorImages();
  const index = state.editor.images.findIndex((image) => image.isPrimary);
  return index >= 0 ? index : 0;
}

function getPrimaryEditorImage() {
  return state.editor.images[getPrimaryEditorImageIndex()];
}

function referenceDisplayIndex(index) {
  return state.editor.images.slice(0, index + 1).filter((image) => !image.isPrimary).length;
}

function syncActiveEditorImage() {
  normalizeEditorImages();
  const image = state.editor.images[state.editor.activeImageIndex];
  state.editor.imageUrl = image?.url || "";
  state.editor.imageData = image?.data || "";
  state.editor.history = image?.history || [];
}

function resetEditorInteraction() {
  state.editor.zoom = 1;
  state.editor.pointerDown = false;
  state.editor.startPoint = null;
  state.editor.snapshot = null;
}

function cloneEditorImages(images = []) {
  return JSON.parse(JSON.stringify(images || []));
}

function captureEditorState() {
  const activeImage = state.editor.images[state.editor.activeImageIndex];
  return {
    images: cloneEditorImages(state.editor.images),
    activeImageId: activeImage?.id || "",
    prompt: state.editor.prompt,
    consistency: state.editor.consistency,
    zoom: state.editor.zoom
  };
}

function restoreEditorState(snapshot) {
  if (!snapshot?.images?.length) return false;
  state.editor.images = cloneEditorImages(snapshot.images);
  const activeIndex = state.editor.images.findIndex((image) => image.id === snapshot.activeImageId);
  state.editor.activeImageIndex = activeIndex >= 0 ? activeIndex : 0;
  state.editor.prompt = snapshot.prompt || "";
  state.editor.consistency = snapshot.consistency || "high";
  state.editor.zoom = snapshot.zoom || 1;
  state.editor.beforeGenerationSnapshot = null;
  syncActiveEditorImage();
  state.editor.pointerDown = false;
  state.editor.startPoint = null;
  state.editor.snapshot = null;
  renderEditor();
  return true;
}

function setEditorImage(src, imageData = "", name = "编辑图片") {
  state.editor.images = [{
    id: `edit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    url: src,
    data: imageData || (src.startsWith("data:") ? src : ""),
    name,
    isPrimary: true,
    note: "",
    history: []
  }];
  state.editor.activeImageIndex = 0;
  state.editor.beforeGenerationSnapshot = null;
  syncActiveEditorImage();
  resetEditorInteraction();
  renderEditor();
}

function addEditorImages(images) {
  normalizeEditorImages();
  const slots = Math.max(0, MAX_EDITOR_IMAGES - state.editor.images.length);
  const hasPrimary = state.editor.images.some((image) => image.isPrimary);
  const nextImages = images.slice(0, slots).map((image, index) => ({
    id: `edit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    isPrimary: !hasPrimary && index === 0,
    note: "",
    history: [],
    ...image
  }));
  if (!nextImages.length) {
    showToast(state.lang === "zh" ? "最多上传 4 张图片" : "You can upload up to 4 images", "ri-image-line");
    return;
  }
  state.editor.images.push(...nextImages);
  normalizeEditorImages();
  if (!state.editor.imageUrl) state.editor.activeImageIndex = getPrimaryEditorImageIndex();
  syncActiveEditorImage();
  renderEditor();
  if (images.length > nextImages.length) {
    showToast(state.lang === "zh" ? "最多上传 4 张图片" : "You can upload up to 4 images", "ri-image-line");
  }
}

function selectEditorImage(index) {
  if (index < 0 || index >= state.editor.images.length || index === state.editor.activeImageIndex) return;
  state.editor.activeImageIndex = index;
  syncActiveEditorImage();
  resetEditorInteraction();
  renderEditor();
}

function removeEditorImage(index) {
  if (index < 0 || index >= state.editor.images.length) return;
  const removedPrimary = state.editor.images[index]?.isPrimary;
  state.editor.images.splice(index, 1);
  if (removedPrimary && state.editor.images.length) state.editor.images[0].isPrimary = true;
  state.editor.activeImageIndex = Math.min(state.editor.activeImageIndex, Math.max(0, state.editor.images.length - 1));
  syncActiveEditorImage();
  resetEditorInteraction();
  renderEditor();
}

function makeEditorImagePrimary(index) {
  if (index < 0 || index >= state.editor.images.length) return;
  const nextPrimary = state.editor.images[index];
  state.editor.images.forEach((image) => {
    image.isPrimary = image === nextPrimary;
  });
  normalizeEditorImages();
  state.editor.activeImageIndex = 0;
  syncActiveEditorImage();
  resetEditorInteraction();
  renderEditor();
}

function resetEditorCanvas() {
  const image = elements.editorSourceImage;
  const canvas = elements.editorMaskCanvas;
  if (!image?.naturalWidth || !canvas) return;
  const activeImage = state.editor.images[state.editor.activeImageIndex];
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (activeImage?.history?.length) {
    state.editor.history = activeImage.history;
    restoreEditorHistory(activeImage.history[activeImage.history.length - 1]);
    return;
  }
  const blank = canvas.toDataURL("image/png");
  if (activeImage) activeImage.history = [blank];
  state.editor.history = activeImage?.history || [blank];
}

function editorPoint(event) {
  const canvas = elements.editorMaskCanvas;
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function pushEditorHistory() {
  const canvas = elements.editorMaskCanvas;
  const activeImage = state.editor.images[state.editor.activeImageIndex];
  if (!activeImage) return;
  activeImage.history = activeImage.history || [];
  activeImage.history.push(canvas.toDataURL("image/png"));
  if (activeImage.history.length > 20) activeImage.history.shift();
  state.editor.history = activeImage.history;
}

function restoreEditorHistory(dataUrl) {
  const canvas = elements.editorMaskCanvas;
  const ctx = canvas.getContext("2d");
  const image = new Image();
  image.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  };
  image.src = dataUrl;
}

function editorPointerDown(event) {
  if (!state.editor.imageUrl || state.editor.tool === "move") return;
  event.preventDefault();
  const canvas = elements.editorMaskCanvas;
  const ctx = canvas.getContext("2d");
  const point = editorPoint(event);
  state.editor.pointerDown = true;
  state.editor.startPoint = point;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (state.editor.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 34 / state.editor.zoom;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  } else if (state.editor.tool === "rect") {
    state.editor.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = hexToRgba(state.editor.color, 0.72);
    ctx.lineWidth = 18 / state.editor.zoom;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }
}

function editorPointerMove(event) {
  if (!state.editor.pointerDown) return;
  event.preventDefault();
  const canvas = elements.editorMaskCanvas;
  const ctx = canvas.getContext("2d");
  const point = editorPoint(event);
  if (state.editor.tool === "rect" && state.editor.snapshot) {
    ctx.putImageData(state.editor.snapshot, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = hexToRgba(state.editor.color, 0.78);
    ctx.lineWidth = 8 / state.editor.zoom;
    ctx.strokeRect(
      state.editor.startPoint.x,
      state.editor.startPoint.y,
      point.x - state.editor.startPoint.x,
      point.y - state.editor.startPoint.y
    );
  } else {
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }
}

function editorPointerUp() {
  if (!state.editor.pointerDown) return;
  const ctx = elements.editorMaskCanvas.getContext("2d");
  ctx.closePath();
  ctx.globalCompositeOperation = "source-over";
  state.editor.pointerDown = false;
  state.editor.snapshot = null;
  pushEditorHistory();
}

function undoEditorMark() {
  if (restoreEditorState(state.editor.beforeGenerationSnapshot)) return;
  const activeImage = state.editor.images[state.editor.activeImageIndex];
  const history = activeImage?.history || [];
  if (history.length <= 1) return;
  history.pop();
  state.editor.history = history;
  restoreEditorHistory(history[history.length - 1]);
}

function zoomEditor(direction) {
  const factor = direction === "+" ? 1.12 : 0.88;
  state.editor.zoom = Math.max(0.25, Math.min(3, state.editor.zoom * factor));
  renderEditor();
}

function hexToRgba(hex, alpha) {
  const raw = hex.replace("#", "");
  const bigint = Number.parseInt(raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

async function handleEditorUpload(files) {
  const selectedFiles = [...(files || [])].filter((file) => file?.type?.startsWith("image/"));
  if (!selectedFiles.length) return false;
  const slots = Math.max(0, 3 - state.editor.images.length);
  if (!slots) {
    showToast(state.lang === "zh" ? "最多上传 3 张图片" : "You can upload up to 3 images", "ri-image-line");
    return false;
  }
  const images = await Promise.all(selectedFiles.slice(0, slots).map(async (file) => {
    const dataUrl = await blobToDataUrl(file);
    return {
      url: dataUrl,
      data: dataUrl,
      name: file.name
    };
  }));
  addEditorImages(images);
  if (selectedFiles.length > slots) {
    showToast(state.lang === "zh" ? "最多上传 3 张图片" : "You can upload up to 3 images", "ri-image-line");
  }
  return true;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function imageReferenceForEdit(src) {
  if (!src) return "";
  if (src.startsWith("data:")) return src;
  try {
    const response = await fetch(src, { credentials: "same-origin" });
    if (!response.ok) throw new Error("Image fetch failed");
    return await blobToDataUrl(await response.blob());
  } catch {
    return src;
  }
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function dataUrlHasMarks(dataUrl) {
  if (!dataUrl?.startsWith("data:image/")) return false;
  const maskImage = await loadImageElement(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = maskImage.naturalWidth || maskImage.width;
  canvas.height = maskImage.naturalHeight || maskImage.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(maskImage, 0, 0);
  return canvasHasMarks(canvas);
}

async function composeAnnotatedImageData(originalData, maskData) {
  if (!maskData?.startsWith("data:image/") || !(await dataUrlHasMarks(maskData))) {
    return { imageData: originalData, maskData: "" };
  }
  const originalImage = await loadImageElement(originalData);
  const canvas = document.createElement("canvas");
  canvas.width = originalImage.naturalWidth || originalImage.width;
  canvas.height = originalImage.naturalHeight || originalImage.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  const maskImage = await loadImageElement(maskData);
  ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
  return {
    imageData: canvas.toDataURL("image/png"),
    maskData
  };
}

async function editorAnnotatedImageData(originalData, image) {
  const activeImage = image || state.editor.images[state.editor.activeImageIndex];
  let maskData = activeImage?.history?.[activeImage.history.length - 1] || "";
  if (activeImage && activeImage === state.editor.images[state.editor.activeImageIndex]) {
    maskData = elements.editorMaskCanvas?.toDataURL("image/png") || maskData;
  }
  return composeAnnotatedImageData(originalData, maskData);
}

function canvasHasMarks(canvas) {
  if (!canvas?.width || !canvas.height) return false;
  const ctx = canvas.getContext("2d");
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] > 0) return true;
  }
  return false;
}

async function submitImageEdit(event) {
  event.preventDefault();
  if (!state.user) {
    openAuthModal("login");
    return;
  }
  if (!state.settings?.hasApiKey) {
    showToast(state.lang === "zh" ? "请先在后台配置 OpenAI API Key" : "Configure the OpenAI API key first", "ri-key-2-line");
    return;
  }
  const prompt = elements.editorPromptInput.value.trim();
  const primaryEditorImage = getPrimaryEditorImage();
  if (!primaryEditorImage?.url) {
    showToast(state.lang === "zh" ? "请先上传或设置一张主图" : "Choose or set a primary image first", "ri-image-add-line");
    return;
  }
  if (prompt.length < 3) {
    showToast(state.lang === "zh" ? "请输入编辑描述" : "Enter an edit prompt", "ri-edit-line");
    return;
  }

  const button = $("button[type='submit']", elements.editorPromptForm);
  const buttonLabel = $("span", button);
  button.disabled = true;
  if (buttonLabel) buttonLabel.textContent = text("editing");
  state.editor.prompt = prompt;
  const beforeGenerationSnapshot = captureEditorState();
  try {
    const primaryOriginalData = primaryEditorImage.data || await imageReferenceForEdit(primaryEditorImage.url);
    const primaryAnnotated = await editorAnnotatedImageData(primaryOriginalData, primaryEditorImage);
    const referenceImages = await Promise.all(state.editor.images
      .filter((image) => image && !image.isPrimary)
      .map(async (image) => {
        const originalData = image.data || await imageReferenceForEdit(image.url);
        const annotated = await editorAnnotatedImageData(originalData, image);
        return {
          imageData: originalData,
          annotatedImageData: annotated.maskData ? annotated.imageData : "",
          note: image.note || ""
        };
      }));
    const editContext = {
      primaryImage: {
        imageData: primaryAnnotated.imageData,
        maskData: primaryAnnotated.maskData
      },
      referenceImages,
      editConsistency: state.editor.consistency
    };
    const data = await api("/api/images/edit", {
      method: "POST",
      body: JSON.stringify({
        prompt,
        primaryImage: editContext.primaryImage,
        referenceImages: editContext.referenceImages,
        editConsistency: editContext.editConsistency,
        isPublic: elements.editorPublicInput.checked
      })
    });
    const generation = data.generations[0];
    state.user.credits = data.credits;
    state.stats.todayGenerated += 1;
    state.history.push({
      id: generation.id,
      prompt: generation.prompt,
      images: [generation.imageUrl],
      status: "done",
      time: generation.createdAt,
      model: generation.model,
      isPublic: Boolean(generation.isPublic),
      editContext
    });
    setEditorImage(generation.imageUrl);
    state.editor.beforeGenerationSnapshot = beforeGenerationSnapshot;
    if (generation.isPublic) await loadPublicGallery();
    renderAll();
    showToast(state.lang === "zh" ? "编辑完成" : "Edit created", "ri-magic-line");
  } catch (error) {
    if (/credit|额度|积分|Not enough/i.test(error.message)) openCreditsModal();
    else showToast(error.message, "ri-error-warning-line");
  } finally {
    button.disabled = false;
    if (buttonLabel) buttonLabel.textContent = text("editImage");
  }
}

function getPromptSource() {
  return state.promptItems.length ? state.promptItems : fallbackPrompts.map((prompt) => ({
    ...prompt,
    title: local(prompt.title),
    prompt: local(prompt.prompt),
    tags: [prompt.tag]
  }));
}

function promptImageUrl(url) {
  const value = String(url || "");
  if (value.startsWith("https://raw.githubusercontent.com/")) {
    return `/api/prompt-image?url=${encodeURIComponent(value)}`;
  }
  return value;
}

function getTagCounts() {
  const counts = {};
  for (const prompt of getPromptSource()) {
    const promptTags = prompt.tags || [prompt.tag].filter(Boolean);
    for (const tag of promptTags) counts[tag] = (counts[tag] || 0) + 1;
  }
  return counts;
}

async function loadPromptLibrary() {
  if (promptLibraryLoadPromise) return promptLibraryLoadPromise;
  state.promptLoading = true;
  if (state.view === "library") renderLibrary();
  promptLibraryLoadPromise = (async () => {
  try {
    const data = await fetch("/prompts.json", { cache: "force-cache" }).then((response) => response.json());
    state.promptItems = (data.prompts || []).map((prompt) => ({
      ...prompt,
      colors: prompt.colors || tagColor(prompt.tags?.[0] || prompt.tag || "other")
    }));
  } catch (error) {
    showToast(state.lang === "zh" ? "提示词库加载失败，已使用内置示例" : "Prompt library failed, using fallback", "ri-error-warning-line");
  } finally {
    state.promptLoading = false;
    renderAll();
  }
  })();
  return promptLibraryLoadPromise;
}

function setupHeroVideo() {
  const video = $(".hero-video-layer video");
  if (!video) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    video.pause();
    video.removeAttribute("autoplay");
    return;
  }
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  if (!video.querySelector("source") && video.dataset.src) {
    const source = document.createElement("source");
    source.src = video.dataset.src;
    source.type = "video/mp4";
    video.append(source);
  }
  video.addEventListener("pause", () => playHeroVideo());
  video.addEventListener("stalled", restartHeroVideo);
  video.addEventListener("suspend", () => playHeroVideo());
  window.addEventListener("focus", () => playHeroVideo());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) playHeroVideo();
  });
  if (!heroVideoWatchdog) {
    let lastTime = -1;
    let stillTicks = 0;
    heroVideoWatchdog = window.setInterval(() => {
      const currentVideo = $(".hero-video-layer video");
      if (!currentVideo || elements.homeView.classList.contains("hidden") || document.hidden) return;
      if (currentVideo.paused) {
        playHeroVideo();
        return;
      }
      const currentTime = Number(currentVideo.currentTime || 0);
      if (Math.abs(currentTime - lastTime) < 0.01) {
        stillTicks += 1;
        if (stillTicks >= 2) restartHeroVideo();
      } else {
        stillTicks = 0;
      }
      lastTime = currentTime;
    }, 1400);
  }
  restartHeroVideo();
}

function playHeroVideo() {
  const video = $(".hero-video-layer video");
  if (!video || elements.homeView.classList.contains("hidden")) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  if (video.readyState === 0) video.load();
  video.play().catch(() => null);
}

function restartHeroVideo() {
  const video = $(".hero-video-layer video");
  if (!video || elements.homeView.classList.contains("hidden")) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  try {
    if (video.readyState < 2) video.load();
    video.currentTime = 0.05;
  } catch {
    video.load();
  }
  playHeroVideo();
}

async function loadStats() {
  try {
    const data = await api("/api/stats/today");
    state.stats.todayGenerated = Number(data.todayGenerated ?? data.count ?? state.stats.todayGenerated);
    updateDailyMetric();
  } catch {
    updateDailyMetric();
  }
}

async function loadPublicGallery() {
  try {
    const data = await api("/api/images/public?limit=60");
    state.publicGallery = (data.generations || []).map((generation) => ({
      id: generation.id,
      prompt: generation.prompt,
      images: [generation.imageUrl],
      status: "done",
      time: generation.createdAt,
      model: generation.model,
      isPublic: Boolean(generation.isPublic)
    }));
  } catch {
    state.publicGallery = [];
  }
}

function tagColor(tag) {
  const colors = {
    ui: "linear-gradient(135deg, #38bdf8, #6366f1)",
    photo: "linear-gradient(135deg, #0f766e, #f59e0b)",
    poster: "linear-gradient(135deg, #111827, #2563eb)",
    portrait: "linear-gradient(135deg, #7c3aed, #ec4899)",
    illustration: "linear-gradient(135deg, #8b5cf6, #fbbf24)",
    anime: "linear-gradient(135deg, #f472b6, #a78bfa)",
    product: "linear-gradient(135deg, #0f172a, #64748b)",
    "3d": "linear-gradient(135deg, #f97316, #0f172a)",
    landscape: "linear-gradient(135deg, #22c55e, #38bdf8)",
    character: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
    logo: "linear-gradient(135deg, #111827, #fbbf24)",
    fashion: "linear-gradient(135deg, #db2777, #fb7185)",
    cyberpunk: "linear-gradient(135deg, #0f172a, #a855f7)",
    infographic: "linear-gradient(135deg, #059669, #2563eb)",
    food: "linear-gradient(135deg, #dc2626, #f59e0b)"
  };
  return colors[tag] || "linear-gradient(135deg,#64748b,#cbd5e1)";
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function openModal(html) {
  elements.modalLayer.innerHTML = html;
  elements.modalLayer.classList.remove("hidden");
  $(".close-modal", elements.modalLayer)?.addEventListener("click", closeModal);
  elements.modalLayer.addEventListener("click", onModalBackdrop);
  applyI18n(elements.modalLayer);
}

function onModalBackdrop(event) {
  if (event.target === elements.modalLayer) closeModal();
}

function closeModal() {
  const shouldRestoreWorks = state.restoreWorksOnViewerClose;
  state.restoreWorksOnViewerClose = false;
  const previewToRestore = state.restorePreviewOnViewerClose;
  state.restorePreviewOnViewerClose = null;
  elements.modalLayer.classList.add("hidden");
  elements.modalLayer.innerHTML = "";
  elements.modalLayer.removeEventListener("click", onModalBackdrop);
  if (previewToRestore) {
    setTimeout(() => openRecentPreview(previewToRestore, { restoreWorks: shouldRestoreWorks }), 0);
  } else if (shouldRestoreWorks) {
    setTimeout(openMyWorksModal, 0);
  }
}

function confirmAction({ title, message, confirmText, cancelText }) {
  return new Promise((resolve) => {
    const layer = document.createElement("div");
    layer.className = "inline-confirm-layer";
    layer.innerHTML = `
      <div class="inline-confirm" role="dialog" aria-modal="true">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
        <div class="inline-confirm-actions">
          <button class="modal-secondary" type="button" data-confirm-cancel>${escapeHtml(cancelText)}</button>
          <button class="modal-danger" type="button" data-confirm-ok>${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;
    const close = (value) => {
      document.removeEventListener("keydown", onKeydown);
      layer.remove();
      resolve(value);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") close(false);
    };
    layer.addEventListener("click", (event) => {
      if (event.target === layer) close(false);
    });
    $("[data-confirm-cancel]", layer).addEventListener("click", () => close(false));
    $("[data-confirm-ok]", layer).addEventListener("click", () => close(true));
    document.addEventListener("keydown", onKeydown);
    document.body.appendChild(layer);
    $("[data-confirm-ok]", layer).focus();
  });
}

function openMyWorksModal() {
  if (!state.user) {
    openAuthModal("login");
    return;
  }
  openModal(`
    <section class="modal works-modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="works-head">
        <div>
          <h2>${text("myWorks")}</h2>
          <p>${state.lang === "zh" ? "查看最近生成记录，继续编辑或再次生成。" : "Review recent generations, edit, or regenerate."}</p>
        </div>
        <button class="ghost-button works-refresh" type="button" data-works-refresh><i class="ri-refresh-line"></i></button>
      </div>
      <div id="worksGrid" class="works-grid"><div class="empty-message">${text("loadingWorks")}</div></div>
    </section>
  `);
  $("[data-works-refresh]", elements.modalLayer).addEventListener("click", () => loadMyWorks(true));
  loadMyWorks(false);
}

async function loadMyWorks(forceReload = false) {
  const grid = $("#worksGrid", elements.modalLayer);
  if (!grid) return;
  if (forceReload) {
    state.history = [];
    state.historyLoaded = false;
    state.historyFullyLoaded = false;
    state.historyNextOffset = 0;
  }
  if (state.history.length && !forceReload) {
    renderWorksItems(grid);
  } else {
    grid.innerHTML = `<div class="empty-message">${text("loadingWorks")}</div>`;
  }
  if (forceReload || !state.history.length) {
    await loadHistory({ limit: getWorksBatchSize(grid), offset: 0 });
    if (!$("#worksGrid", elements.modalLayer)) return;
  }
  renderWorksItems(grid);
}

function worksItemsFromHistory() {
  return [...state.history]
    .filter((item) => item.status === "done" && item.images?.[0])
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
}

function renderWorksItems(grid) {
  const items = worksItemsFromHistory();
  if (!items.length) {
    grid.innerHTML = state.historyFullyLoaded
      ? `<div class="empty-message">${text("emptyWorks")}</div>`
      : `<div class="works-sentinel"><span>${text("loadingWorks")}</span></div>`;
    if (!state.historyFullyLoaded) observeWorksSentinel(grid);
    return;
  }
  grid._worksItems = items;
  grid.dataset.worksOffset = "0";
  grid.innerHTML = "";
  bindWorksGrid(grid);
  renderWorksBatch(grid);
}

function workCardHtml(item) {
  return `
    <article class="work-card" data-work-id="${escapeHtml(item.id)}">
      <button class="work-image-button" type="button" data-work-view="${escapeHtml(item.id)}" aria-label="${escapeHtml(truncate(item.prompt, 80))}">
        <img src="${escapeHtml(item.images[0])}" loading="lazy" decoding="async" alt="${escapeHtml(truncate(item.prompt, 80))}">
      </button>
      <div class="work-body">
        <button class="work-text-button" type="button" data-work-view="${escapeHtml(item.id)}">${escapeHtml(truncate(item.prompt, 92))}</button>
        <div class="work-footer">
          <span>${escapeHtml(formatDate(item.time))}${item.isPublic ? ` · ${text("publishToSquare")}` : ""}</span>
          <div class="work-actions">
            ${saveActionHtml(item.images[0], `${item.id}.png`)}
            <button type="button" data-work-retry="${escapeHtml(item.id)}"><i class="ri-refresh-line"></i>${text("retry")}</button>
            <button type="button" data-work-editor="${escapeHtml(item.id)}"><i class="ri-magic-line"></i>${text("openEditor")}</button>
            <button class="work-delete" type="button" data-work-delete="${escapeHtml(item.id)}"><i class="ri-delete-bin-line"></i>${state.lang === "zh" ? "删除" : "Delete"}</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderWorksBatch(grid) {
  const items = grid._worksItems || [];
  const offset = Number(grid.dataset.worksOffset || 0);
  const batchSize = getWorksBatchSize(grid);
  const batch = items.slice(offset, offset + batchSize);
  $(".works-sentinel", grid)?.remove();
  if (!batch.length) {
    if (!state.historyFullyLoaded) loadMoreWorks(grid);
    return;
  }
  requestAnimationFrame(() => {
    grid.insertAdjacentHTML("beforeend", batch.map(workCardHtml).join(""));
    const nextOffset = offset + batch.length;
    grid.dataset.worksOffset = String(nextOffset);
    if (nextOffset < items.length || !state.historyFullyLoaded) {
      grid.insertAdjacentHTML("beforeend", `<div class="works-sentinel"><span>${text("loadingWorks")}</span></div>`);
      observeWorksSentinel(grid);
    }
  });
}

function getWorksBatchSize(grid) {
  const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
  return Math.max(1, columns * WORKS_BATCH_ROWS);
}

function observeWorksSentinel(grid) {
  const sentinel = $(".works-sentinel", grid);
  if (!sentinel) return;
  if (!("IntersectionObserver" in window)) {
    setTimeout(() => loadOrRenderMoreWorks(grid), 80);
    return;
  }
  grid._worksObserver?.disconnect();
  grid._worksObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    grid._worksObserver?.disconnect();
    loadOrRenderMoreWorks(grid);
  }, { root: grid.closest(".modal"), rootMargin: "240px" });
  grid._worksObserver.observe(sentinel);
}

function loadOrRenderMoreWorks(grid) {
  const items = grid._worksItems || [];
  const offset = Number(grid.dataset.worksOffset || 0);
  if (offset < items.length) {
    renderWorksBatch(grid);
    return;
  }
  if (!state.historyFullyLoaded) loadMoreWorks(grid);
}

async function loadMoreWorks(grid) {
  if (!grid || grid.dataset.loadingMore === "1" || state.historyFullyLoaded) return;
  grid.dataset.loadingMore = "1";
  const previousCount = grid._worksItems?.length || 0;
  try {
    await loadHistory({
      limit: getWorksBatchSize(grid),
      offset: state.historyNextOffset || state.history.length,
      append: true
    });
    if (!$("#worksGrid", elements.modalLayer)) return;
    grid._worksItems = worksItemsFromHistory();
    grid.dataset.worksOffset = String(previousCount);
    renderWorksBatch(grid);
  } finally {
    if (grid) grid.dataset.loadingMore = "0";
  }
}

function bindWorksGrid(grid) {
  if (grid.dataset.bound === "1") return;
  grid.dataset.bound = "1";
  grid.addEventListener("click", (event) => {
    const retryButton = event.target.closest("[data-work-retry]");
    if (retryButton) {
      const item = state.history.find((entry) => String(entry.id) === retryButton.dataset.workRetry);
      if (!item) return;
      state.restoreWorksOnViewerClose = false;
      closeModal();
      regenerateItem(item);
      return;
    }

    const editorButton = event.target.closest("[data-work-editor]");
    if (editorButton) {
      const item = state.history.find((entry) => String(entry.id) === editorButton.dataset.workEditor);
      if (!item?.images?.[0]) return;
      state.restoreWorksOnViewerClose = false;
      closeModal();
      openImageEditor(item.images[0], item.prompt, item);
      return;
    }

    const viewButton = event.target.closest("[data-work-view]");
    if (viewButton) {
      const item = state.history.find((entry) => String(entry.id) === viewButton.dataset.workView);
      if (item?.images?.[0]) {
        openRecentPreview({
          id: item.id,
          title: truncate(item.prompt, 36),
          prompt: item.prompt,
          image: item.images[0],
          isPublic: Boolean(item.isPublic),
          time: item.time
        }, { restoreWorks: true });
      }
      return;
    }

    const deleteButton = event.target.closest("[data-work-delete]");
    if (deleteButton) deleteWork(deleteButton.dataset.workDelete);
  });
}

async function deleteWork(id) {
  const item = state.history.find((entry) => String(entry.id) === String(id));
  if (!item) return;
  const confirmed = await confirmAction({
    title: state.lang === "zh" ? "删除作品" : "Delete work",
    message: state.lang === "zh"
      ? "确定删除这张作品吗？"
      : "Delete this work?",
    confirmText: state.lang === "zh" ? "删除" : "Delete",
    cancelText: state.lang === "zh" ? "取消" : "Cancel"
  });
  if (!confirmed) return;
  try {
    await api(`/api/images/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.history = state.history.filter((entry) => String(entry.id) !== String(id));
    renderHistory();
    renderRecentCreations();
    if (item.isPublic) await loadPublicGallery();
    await loadMyWorks(false);
    showToast(state.lang === "zh" ? "作品已删除" : "Work deleted", "ri-delete-bin-line");
  } catch (error) {
    showToast(error.message, "ri-error-warning-line");
  }
}

function openImageViewer(imageUrl, prompt = "", id = "image", options = {}) {
  let zoom = 1;
  state.restoreWorksOnViewerClose = Boolean(options.restoreWorks);
  state.restorePreviewOnViewerClose = options.restorePreview || null;
  const clampZoom = (value) => Math.min(4, Math.max(0.35, value));
  const fileName = `${String(id || "image").replace(/[^\w.-]+/g, "-")}.png`;
  const saveButton = window.matchMedia?.("(min-width: 861px)").matches
    ? ""
    : `<button type="button" data-save-image="${escapeHtml(imageUrl)}" data-save-file="${escapeHtml(fileName)}" data-save-label="${escapeHtml(text("download"))}" title="${text("download")}" aria-label="${text("download")}"><i class="ri-download-line"></i></button>`;
  openModal(`
    <section class="modal image-viewer-modal" role="dialog" aria-modal="true">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="image-viewer-toolbar">
        <button type="button" data-viewer-zoom-out title="缩小" aria-label="缩小"><i class="ri-subtract-line"></i></button>
        <span data-viewer-zoom-label>100%</span>
        <button type="button" data-viewer-zoom-in title="放大" aria-label="放大"><i class="ri-add-line"></i></button>
        <button type="button" data-viewer-reset title="复位" aria-label="复位"><i class="ri-fullscreen-exit-line"></i></button>
        ${saveButton}
      </div>
      <div class="image-viewer-stage">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(truncate(prompt, 120))}" data-viewer-image draggable="false">
      </div>
    </section>
  `);

  const stage = $(".image-viewer-stage", elements.modalLayer);
  const image = $("[data-viewer-image]", elements.modalLayer);
  const label = $("[data-viewer-zoom-label]", elements.modalLayer);
  const applyZoom = () => {
    image.style.width = `${Math.round(zoom * 100)}%`;
    label.textContent = `${Math.round(zoom * 100)}%`;
  };
  const updateZoom = (nextZoom) => {
    zoom = clampZoom(nextZoom);
    applyZoom();
  };

  $("[data-viewer-zoom-out]", elements.modalLayer).addEventListener("click", () => updateZoom(zoom - 0.25));
  $("[data-viewer-zoom-in]", elements.modalLayer).addEventListener("click", () => updateZoom(zoom + 0.25));
  $("[data-viewer-reset]", elements.modalLayer).addEventListener("click", () => updateZoom(1));
  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    updateZoom(zoom + (event.deltaY < 0 ? 0.12 : -0.12));
  }, { passive: false });
  applyZoom();
}

function openComplianceNotice() {
  const storageKey = "imageStudioComplianceNoticeV1";
  if (localStorage.getItem(storageKey) === "seen") return;
  openModal(`
    <section class="modal compliance-modal" role="dialog" aria-modal="true" aria-labelledby="complianceTitle">
      <button class="close-modal compliance-close" type="button" aria-label="${text("close")}"><i class="ri-close-line"></i></button>
      <div class="compliance-icon"><i class="ri-shield-check-line"></i></div>
      <div class="compliance-title">
        <h2 id="complianceTitle"><i class="ri-megaphone-fill"></i>${text("noticeTitle")}</h2>
        <p>${text("noticeSubtitle")}</p>
      </div>
      <div class="notice-card danger">
        <h3><span></span>${text("noticeCore")}</h3>
        <ul>
          <li><strong>严禁违规内容：</strong>平台（含“酒馆”等交互工具）严禁涉及低俗色情、暴力血腥、网络诈骗、政治敏感及其他违反法律法规的对话。</li>
          <li><strong>敏感词拦截：</strong>系统已启用内容安全审计功能，自动拦截不当言论及有害信息。</li>
          <li><strong>违规严厉处置：</strong>针对违规账号，我们将视情节严重程度采取：<em>警告 → 限制功能 → 临时封禁 → 永久销号 → 移送公安。</em></li>
        </ul>
      </div>
      <div class="notice-card privacy">
        <h3><i class="ri-shield-user-line"></i>${text("noticePrivacy")}</h3>
        <p><strong>信息安全：</strong>我们承诺！您的信息仅在系统内部加密存储，并严格用于系统运行及合规与安全保障相关用途。我们不会向任何个人或第三方出售、提供或披露您的数据。</p>
      </div>
      <div class="notice-card together">
        <p><strong>${text("noticeTogether").split("：")[0]}：</strong>${text("noticeTogether").split("：").slice(1).join("：") || text("noticeTogether")}</p>
      </div>
      <div class="compliance-actions">
        <button class="modal-primary" type="button" data-compliance-ack>${text("noticeAck")}</button>
      </div>
    </section>
  `);

  const markSeen = () => {
    localStorage.setItem(storageKey, "seen");
    closeModal();
  };
  $("[data-compliance-ack]", elements.modalLayer).addEventListener("click", markSeen);
  $(".compliance-close", elements.modalLayer).addEventListener("click", () => {
    localStorage.setItem(storageKey, "seen");
  });
}

function openAuthModal(mode = state.authMode) {
  state.authMode = mode;
  const isRegister = mode === "register";
  openModal(`
    <section class="modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="modal-title">
        <i class="ri-sparkling-2-fill"></i>
        <h2>${isRegister ? text("registerTitle") : text("loginTitle")}</h2>
        <p><i class="ri-gift-line"></i> ${text("authGift")}</p>
        <p class="auth-bonus"><i class="ri-flashlight-line"></i> ${text("authBonus")}</p>
      </div>
      <div class="auth-tabs">
        <button type="button" class="${!isRegister ? "active" : ""}" data-auth-mode="login">${text("submitLogin")}</button>
        <button type="button" class="${isRegister ? "active" : ""}" data-auth-mode="register">${text("submitRegister")}</button>
      </div>
      <form id="authForm" class="modal-form">
        ${isRegister ? `<label>${text("name")}<input id="authName" autocomplete="name"></label>` : ""}
        <label>${text("email")}<input id="authEmail" type="email" autocomplete="email" required></label>
        <label>${text("password")}<input id="authPassword" type="password" autocomplete="${isRegister ? "new-password" : "current-password"}" required></label>
        <button class="modal-primary" type="submit">${isRegister ? text("submitRegister") : text("submitLogin")}</button>
        <button class="link-button" type="button" data-auth-mode="${isRegister ? "login" : "register"}">
          ${isRegister ? text("switchToLogin") : text("switchToRegister")}
        </button>
        <button class="link-button" type="button" data-close-auth>${text("skip")}</button>
      </form>
    </section>
  `);
  $$("[data-auth-mode]", elements.modalLayer).forEach((button) => {
    button.addEventListener("click", () => openAuthModal(button.dataset.authMode));
  });
  $("[data-close-auth]", elements.modalLayer).addEventListener("click", closeModal);
  $("#authForm").addEventListener("submit", submitAuth);
}

async function submitAuth(event) {
  event.preventDefault();
  const submit = event.currentTarget.querySelector("button[type='submit']");
  submit.disabled = true;
  try {
    const payload = {
      email: $("#authEmail").value,
      password: $("#authPassword").value,
      name: $("#authName")?.value || ""
    };
    const data = await api(`/api/auth/${state.authMode}`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (data.pendingApproval) {
      showToast(state.lang === "zh" ? "账号已创建，等待管理员启用" : "Account created, waiting for approval", "ri-time-line");
      closeModal();
      return;
    }
    state.user = data.user;
    const me = await api("/api/auth/me");
    state.settings = me.settings;
    state.firstRun = me.firstRun;
    state.checkin = me.checkin || state.checkin;
    await loadHistory();
    closeModal();
    state.forceHero = true;
    state.showGenerationView = false;
    renderAll();
    window.scrollTo({ top: 0, behavior: "auto" });
    restartHeroVideo();
  } catch (error) {
    showToast(error.message, "ri-error-warning-line");
  } finally {
    submit.disabled = false;
  }
}

async function logout() {
  await api("/api/auth/logout", { method: "POST" }).catch(() => null);
  state.user = null;
  state.history = [];
  state.historyLoaded = true;
  state.historyFullyLoaded = true;
  state.historyNextOffset = 0;
  state.checkin = { checkedInToday: false, credit: state.settings?.checkinCredit || 1 };
  state.forceHero = true;
  state.showGenerationView = false;
  renderAll();
  window.scrollTo({ top: 0, behavior: "auto" });
  restartHeroVideo();
}

function openCreditsModal() {
  if (!state.user) {
    openAuthModal("login");
    return;
  }
  const credits = state.user?.credits ?? 0;
  const checkedIn = Boolean(state.checkin?.checkedInToday);
  const checkinCredit = Number(state.checkin?.credit || state.settings?.checkinCredit || 1);
  const generationCost = Number(state.settings?.generationCreditCost ?? 1);
  openModal(`
    <section class="modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="modal-title">
        <i class="ri-sparkling-2-fill"></i>
        <h2>${text("creditsTitle")}</h2>
        <p>${text("creditsBalance")}: <strong>${credits}</strong> · ${text("oneCredit")}: <strong>${generationCost}</strong></p>
      </div>
      <div class="checkin-card">
        <i class="ri-calendar-check-line"></i>
        <strong>+${checkinCredit}</strong>
        <span>${text("checkinReward")}</span>
      </div>
      <button class="modal-primary" type="button" data-checkin ${checkedIn ? "disabled" : ""}>
        ${checkedIn ? text("checkedIn") : text("checkinToday")}
      </button>
      <button class="modal-secondary" type="button" data-close-auth>${text("close")}</button>
    </section>
  `);
  $("[data-checkin]", elements.modalLayer).addEventListener("click", submitCheckin);
  $("[data-close-auth]", elements.modalLayer).addEventListener("click", closeModal);
}

async function submitCheckin(event) {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const data = await api("/api/checkin", { method: "POST" });
    state.user = data.user || { ...state.user, credits: data.credits };
    state.checkin = data.checkin || { checkedInToday: true, credit: state.checkin?.credit || 1 };
    showToast(data.checkedIn
      ? (state.lang === "zh" ? `签到成功，获得 ${data.awarded} 积分` : `Checked in, +${data.awarded} credit`)
      : text("checkedIn"), "ri-calendar-check-line");
    updateNav();
    openCreditsModal();
  } catch (error) {
    showToast(error.message, "ri-error-warning-line");
    button.disabled = false;
  }
}

function openContactModal() {
  openModal(`
    <section class="modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="modal-title">
        <i class="ri-customer-service-2-line" style="color:#1677ff"></i>
        <h2>${text("contactTitle")}</h2>
        <p>${text("contactDesc")}</p>
      </div>
      <div class="contact-card">
        <img src="/wx.jpg" alt="${escapeHtml(text("contactTitle"))}" class="contact-qr">
      </div>
      <button class="modal-secondary" type="button" data-close-auth>${text("close")}</button>
    </section>
  `);
  $("[data-close-auth]", elements.modalLayer).addEventListener("click", closeModal);
}

async function openAdminModal() {
  if (state.user?.role !== "admin") return;
  openModal(`
    <section class="modal admin-modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="modal-title">
        <i class="ri-settings-3-line"></i>
        <h2>${text("adminTitle")}</h2>
      </div>
      <div class="admin-grid">
        <div class="admin-card">
          <h3>${text("settings")}</h3>
          <form id="settingsForm" class="admin-form">
        <label>${text("apiKey")}<input id="apiKeyInput" type="password" placeholder="Your API key"></label>
        <label>${text("apiBaseUrl")}<input id="apiBaseUrlInput" placeholder="AI API base URL"></label>
            <label>${text("model")}<input id="modelInput" placeholder="GPT-IMAGE-2"></label>
            <label>${text("defaultCredits")}<input id="defaultCreditsInput" type="number" min="0"></label>
            <label>${text("generationCost")}<input id="generationCreditCostInput" type="number" min="0"></label>
            <label>${text("maxImages")}<input id="maxImagesInput" type="number" min="1" max="4"></label>
            <label class="admin-switch"><input id="allowRegistrationInput" type="checkbox">${text("allowRegistration")}</label>
            <label class="admin-switch"><input id="requireApprovalInput" type="checkbox">${text("requireApproval")}</label>
            <button class="modal-primary" type="submit">${text("save")}</button>
            <button id="clearApiKeyBtn" class="modal-secondary" type="button">${text("clearKey")}</button>
            <p id="apiKeyMask" style="color:#8b94a1;font-size:12px;margin:0"></p>
          </form>
        </div>
        <div class="admin-card">
          <h3>${text("users")}</h3>
          <div class="users-table-wrap">
            <table class="users-table">
              <thead>
                <tr>
                  <th>${text("user")}</th>
                  <th>${text("role")}</th>
                  <th>${text("status")}</th>
                  <th>${text("credits")}</th>
                  <th>+/-</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="usersBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `);
  await loadAdminSettings();
  await loadUsers();
}

async function loadAdminSettings() {
  const settings = await api("/api/admin/settings");
  state.settings = settings;
  $("#apiBaseUrlInput").value = settings.apiBaseUrl || "";
  $("#modelInput").value = settings.model || "GPT-IMAGE-2";
  $("#defaultCreditsInput").value = settings.defaultCredits ?? 10;
  $("#generationCreditCostInput").value = settings.generationCreditCost ?? 1;
  $("#maxImagesInput").value = settings.maxImagesPerRequest ?? 1;
  $("#allowRegistrationInput").checked = Boolean(settings.allowRegistration);
  $("#requireApprovalInput").checked = Boolean(settings.requireApproval);
  $("#apiKeyMask").textContent = settings.apiKeyMask
    ? `${text("currentKey")}: ${settings.apiKeyMask}`
    : text("noKey");
  $("#settingsForm").addEventListener("submit", saveSettings);
  $("#clearApiKeyBtn").addEventListener("click", clearApiKey);
}

async function saveSettings(event) {
  event.preventDefault();
  const settings = await api("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({
      openaiApiKey: $("#apiKeyInput").value.trim(),
      apiBaseUrl: $("#apiBaseUrlInput").value.trim(),
      model: $("#modelInput").value.trim(),
      defaultCredits: Number($("#defaultCreditsInput").value || 0),
      generationCreditCost: Number($("#generationCreditCostInput").value || 0),
      maxImagesPerRequest: Number($("#maxImagesInput").value || 1),
      allowRegistration: $("#allowRegistrationInput").checked,
      requireApproval: $("#requireApprovalInput").checked
    })
  });
  state.settings = settings;
  $("#apiKeyInput").value = "";
  $("#apiKeyMask").textContent = settings.apiKeyMask
    ? `${text("currentKey")}: ${settings.apiKeyMask}`
    : text("noKey");
  showToast(state.lang === "zh" ? "已保存" : "Saved", "ri-checkbox-circle-line");
  updateNav();
  syncComposers();
}

async function clearApiKey() {
  const settings = await api("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({ clearApiKey: true })
  });
  state.settings = settings;
  $("#apiKeyMask").textContent = text("noKey");
  showToast(state.lang === "zh" ? "已清除" : "Cleared", "ri-delete-bin-line");
  updateNav();
  syncComposers();
}

async function loadUsers() {
  const data = await api("/api/admin/users");
  const body = $("#usersBody");
  body.innerHTML = data.users.map((user) => `
    <tr data-user-id="${user.id}">
      <td class="user-cell"><strong>${escapeHtml(user.name || user.email)}</strong><span>${escapeHtml(user.email)}</span></td>
      <td>
        <select class="role-input" ${user.id === state.user.id ? "disabled" : ""}>
          <option value="user" ${user.role === "user" ? "selected" : ""}>${text("user")}</option>
          <option value="admin" ${user.role === "admin" ? "selected" : ""}>${text("adminRole")}</option>
        </select>
      </td>
      <td>
        <select class="status-input" ${user.id === state.user.id ? "disabled" : ""}>
          <option value="active" ${user.status === "active" ? "selected" : ""}>${text("active")}</option>
          <option value="disabled" ${user.status === "disabled" ? "selected" : ""}>${text("disabled")}</option>
        </select>
      </td>
      <td><input class="credits-input" type="number" min="0" value="${Number(user.credits || 0)}"></td>
      <td><input class="credit-delta-input" type="number" step="1" value="0"></td>
      <td><button class="tiny-button save-user" type="button"><i class="ri-save-line"></i>${text("save")}</button></td>
    </tr>
  `).join("");
  $$(".save-user", body).forEach((button) => {
    button.addEventListener("click", () => saveUser(button.closest("tr")));
  });
}

async function saveUser(row) {
  const id = row.dataset.userId;
  const user = await api(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      role: $(".role-input", row).value,
      status: $(".status-input", row).value,
      credits: Number($(".credits-input", row).value || 0),
      creditDelta: Number($(".credit-delta-input", row).value || 0)
    })
  });
  if (id === state.user.id) state.user = user.user;
  showToast(state.lang === "zh" ? "用户已保存" : "User saved", "ri-save-line");
  updateNav();
}

async function bootstrap() {
  renderComposers();
  try {
    const data = await api("/api/auth/me");
    state.user = data.user;
    state.settings = data.settings;
    state.firstRun = data.firstRun;
    state.checkin = data.checkin || state.checkin;
  } catch (error) {
    showToast(error.message, "ri-error-warning-line");
  }
  renderAll();
  showHomeHero();
  runWhenIdle(() => {
    loadStats();
    loadPublicGallery();
    loadHistory().then(() => {
      renderRecentCreations();
      renderHistory();
    });
  });
  runWhenIdle(setupHeroVideo, 1800);
}

function bindGlobalEvents() {
  const openImageCreate = () => {
    showHomeHero({ focusPrompt: true, smooth: true });
  };
  elements.brandBtn.addEventListener("click", () => {
    openImageCreate();
  });
  elements.promptLibraryBtn.addEventListener("click", openPromptLibrary);
  elements.imageCreateBtn.addEventListener("click", openImageCreate);
  elements.imageEditorBtn.addEventListener("click", () => openImageEditor());
  elements.openLibraryInlineBtn.addEventListener("click", openPromptLibrary);
  elements.contactBtn.addEventListener("click", openContactModal);
  elements.langBtn.addEventListener("click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    localStorage.setItem("lang", state.lang);
    renderAll();
  });
  elements.loginBtn.addEventListener("click", () => openAuthModal("login"));
  elements.logoutBtn.addEventListener("click", logout);
  elements.creditsBtn.addEventListener("click", openCreditsModal);
  elements.myWorksBtn.addEventListener("click", openMyWorksModal);
  elements.adminBtn.addEventListener("click", () => {
    window.location.href = "/admin";
  });
  elements.librarySearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.librarySearch = elements.librarySearchInput.value;
    state.promptVisible = 20;
    renderLibrary();
  });
  $$("[data-editor-create]", elements.editorView).forEach((button) => button.addEventListener("click", () => {
    showHomeHero({ focusPrompt: true });
  }));
  $$("[data-editor-tool]", elements.editorView).forEach((button) => {
    button.addEventListener("click", () => {
      state.editor.tool = button.dataset.editorTool;
      renderEditor();
    });
  });
  $("[data-editor-undo]", elements.editorView).addEventListener("click", undoEditorMark);
  $$("[data-editor-zoom]", elements.editorView).forEach((button) => {
    button.addEventListener("click", () => zoomEditor(button.dataset.editorZoom));
  });
  elements.editorColorInput.addEventListener("input", () => {
    state.editor.color = elements.editorColorInput.value;
  });
  elements.editorPromptInput.addEventListener("input", () => {
    state.editor.prompt = elements.editorPromptInput.value;
  });
  elements.editorReferenceNoteInput?.addEventListener("input", () => {
    const activeImage = state.editor.images[state.editor.activeImageIndex];
    if (activeImage && !activeImage.isPrimary) activeImage.note = elements.editorReferenceNoteInput.value;
  });
  elements.editorConsistencyInput.addEventListener("change", () => {
    state.editor.consistency = elements.editorConsistencyInput.value;
  });
  $("[data-editor-consistency-trigger]", elements.editorView)?.addEventListener("click", () => {
    const wrap = $("[data-editor-consistency]", elements.editorView);
    const expanded = !wrap.classList.contains("open");
    wrap.classList.toggle("open", expanded);
    $("[data-editor-consistency-trigger]", elements.editorView)?.setAttribute("aria-expanded", String(expanded));
  });
  $$("[data-editor-consistency-value]", elements.editorView).forEach((button) => {
    button.addEventListener("click", () => {
      state.editor.consistency = button.dataset.editorConsistencyValue;
      elements.editorConsistencyInput.value = state.editor.consistency;
      $("[data-editor-consistency]", elements.editorView)?.classList.remove("open");
      $("[data-editor-consistency-trigger]", elements.editorView)?.setAttribute("aria-expanded", "false");
      renderEditor();
    });
  });
  document.addEventListener("click", (event) => {
    const saveButton = event.target.closest("[data-save-image]");
    if (saveButton) {
      event.preventDefault();
      const imageUrl = saveButton.dataset.saveImage;
      const fileName = saveButton.dataset.saveFile || "image.png";
      const label = saveButton.dataset.saveLabel || text("download");
      saveImageToDevice(imageUrl, fileName, label);
      return;
    }
    if (event.target.closest("[data-editor-consistency]")) return;
    $("[data-editor-consistency]", elements.editorView)?.classList.remove("open");
    $("[data-editor-consistency-trigger]", elements.editorView)?.setAttribute("aria-expanded", "false");
  });
  elements.editorPromptInput.addEventListener("paste", async (event) => {
    const files = pastedImageFiles(event, "edit-image");
    if (!files.length) return;
    event.preventDefault();
    if (await handleEditorUpload(files)) {
      showToast(state.lang === "zh" ? "已粘贴图片" : "Image pasted", "ri-image-add-line");
    }
  });
  elements.editorUploadInput.addEventListener("change", (event) => {
    handleEditorUpload(event.target.files);
    event.target.value = "";
  });
  elements.editorBottomUploadInput.addEventListener("change", (event) => {
    handleEditorUpload(event.target.files);
    event.target.value = "";
  });
  elements.editorSourceImage.addEventListener("load", resetEditorCanvas);
  elements.editorMaskCanvas.addEventListener("pointerdown", editorPointerDown);
  elements.editorMaskCanvas.addEventListener("pointermove", editorPointerMove);
  window.addEventListener("pointerup", editorPointerUp);
  elements.editorPromptForm.addEventListener("submit", submitImageEdit);
}

async function startApp() {
  bindGlobalEvents();
  await bootstrap();
  renderAll();
  elements.app.classList.remove("app-booting");
  requestAnimationFrame(() => {
    elements.app.classList.add("app-ready");
    if (state.view === "home") {
      setTimeout(openComplianceNotice, 260);
    }
  });
  runWhenIdle(loadPromptLibrary, 1600);
}

startApp();
