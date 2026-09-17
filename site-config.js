/* ============================================================
 * 李淑雁 / WENTING 视觉作品集 — 全站内容配置
 * 前台（script.js）与后台（admin.js）共用本文件的默认值与读写工具。
 * 编辑入口：后台 admin.html（保存到 localStorage，key 见下）。
 * ============================================================ */

window.WENTING_CONFIG_KEY = 'wenting-portfolio-config-v1';

window.WENTING_DEFAULTS = {
  brand: 'WENTING',
  brandSuffix: '/ VISUALS',
  pageTitle: '李淑雁 LISHUYAN — 视觉作品集',

  content: {
    /* —— 第一幕 · 开场 —— */
    scene0Eyebrow: '00 - VISUAL DESIGNER / ART DIRECTOR',
    scene0TitleA: '把想象，',
    scene0TitleB: '变成画面。',
    heroIntro: '用品牌创意、三维影像与动态设计，制造让人记住的视觉瞬间。',

    /* —— 第二幕 · 关于我 —— */
    scene1Eyebrow: 'ABOUT ME',
    aboutTitle: "Hi, I'm Shuyan Li",
    aboutTaglineA: '让故事，',
    aboutTaglineB: '拥有形状。',
    aboutRole: '拥有丰富的品牌视觉设计与管理经验，擅长将品牌视觉系统搭建、品牌叙事表达与AIGC创意生产力深度融合，构建从策略到落地的完整设计战斗力。',
    aboutIntro: '从品牌VI到电商视觉，从产品包装到小红书/抖音/公众号全渠道物料，从3D渲染到AE动效——不只是产出好看的图，而是用一套统一的视觉系统把品牌故事讲透，让每一份设计都承载调性，传递情感。同时将AIGC深度融入设计流程，用AI做创意探索与高效生产，把过去多轮迭代的方案压缩到小时级交付。\n\n兼具设计团队管理经验，曾统筹网站PC/APP/手机端全平台建设，并为企业成功申报省重点研发项目全额经费300万——既能沉下心做设计，也能站在项目和商业的角度拿结果。',
    creatorSummary: [
      { label: '设计经验', value: '8+' },
      { label: '研发经费', value: '300w' }
    ],
    skills: ['品牌视觉全案', 'AIGC视觉工作流', '3D与动态视觉', '全平台营销视觉', '项目管理与商业思维'],
    chatLink: '和我聊聊',

    /* —— 第三幕 · 经历 —— */
    scene2TitleA: '画面背后，',
    scene2TitleB: '是故事在生长。',
    career: [
      { period: '2025.02 - 至今', role: '品牌/视觉设计负责人', company: '杭州鹏羽生物科技有限公司', desc: '主导品牌视觉全链路创意：从策略制定到电商、社媒全渠道落地，独立完成产品包装从概念到成品；以差异化营销视觉提升品牌传播力与用户转化。' },
      { period: '2023.07 - 2025.01', role: '平面设计师', company: '浙江桦树林生物科技有限公司', desc: '兼顾线上线下全场景设计：配合企划制定视觉方案，覆盖电商主图详情页、社媒全渠道内容，以及产品包装、宣传册等线下物料；全程把控品牌调性，推动视觉系统迭代升级。' },
      { period: '2022.05 - 2022.11', role: '品牌设计师', company: '杭州佳泽数码科技有限公司', desc: '从0搭建品牌VI体系：主导公司视觉识别系统设计，统一品牌形象与价值观；统筹营销物料与节日视频创作，用创新视觉语言讲述品牌故事，强化用户情感连接。' },
      { period: '2017.03 - 2021.09', role: '设计部主管', company: '东阳市亚新齿科器材有限公司', desc: '带领设计团队统筹全平台视觉：负责宣传物料与品牌视觉升级，统筹活动视频拍摄剪辑；主导公司网站PC/APP/手机端建设与公众号运营，积累团队管理与项目统筹经验。' }
    ],
    worksLink: '查看精选作品',
    heroName: '李淑雁',

    /* —— 作品区 —— */
    worksTitle: 'SELECTED',
    worksItalic: 'WORKS',
    worksAsideLine1: '从一个想法，',
    worksAsideLine2: '到一个有记忆点的画面。',
    worksAsideTag: '品牌创意 / 三维影像 / 动态设计',
    collectionHeading: '更多视觉探索',
    collectionSub: 'MORE EXPLORATIONS',

    /* —— 联系区 —— */
    contactKicker: '05 — GET IN TOUCH',
    contactLead: '下一次创意，从一次交流开始。',
    contactHeading1: "Let's create",
    contactHeading2: 'something together.',
    email: '546753707@qq.com',
    wechat: 'Ahri_Yan',

    /* —— 页脚 —— */
    footerLeft: '© 2026 SHUYAN LI',
    footerMid: 'BRAND AND VISUAL DESIGN'
  },

  projects: {
    featured: [
      { title: '品牌视觉体系', category: 'CORE', type: 'CORE', number: '01', role: '', cover: '', behance: false, behanceText: 'Behance 精选', openText: '', description: '', tags: [], points: ['需求拆解 · 策略推导', '跨阶段推进 · 创意落地', '把控整体视觉质量'], detail: { client: '品牌', type: '视觉设计', year: '2025-2026', credits: 'Shuyan Li' } },
      { title: '3D与动态视觉', category: 'CORE', type: 'CORE', number: '02', role: '', cover: '', behance: false, behanceText: 'Behance 精选', openText: '', description: '', tags: [], points: ['3D建模渲染', '视频制作'], detail: { client: '品牌宣传', type: '视觉设计', year: '2025-2026', credits: 'Shuyan Li' } }
    ],
    collection: [
      { title: 'AIGC视觉', category: 'SYSTEM', type: 'SYSTEM', number: '03', role: '', cover: '', behance: false, behanceText: '', openText: '', description: '', tags: [], points: ['AIGC 创意探索', '风格推演与迭代', 'AI 工作流复用'], detail: { client: '内部工作流', type: 'AIGC 创意工作流', year: '2025 — 2026', credits: 'Shuyan Li' } },
      { title: '全平台营销视觉', category: 'SYSTEM', type: 'SYSTEM', number: '04', role: '', cover: '', behance: false, behanceText: '', openText: '', description: '', tags: [], points: ['多项目并行管理', '统一设计标准', '稳定高质量交付'], detail: { client: '项目组 / 团队', type: '设计项目管理', year: '2025-2026', credits: 'Shuyan Li' } }
    ]
  },

  socials: [
    { name: '联系我', sub: '', url: 'tel:15067902110' }
  ],

  modal: {
    title: 'Project title'
  },

  colors: {
    ink: '#07132f',
    inkSoft: '#0e1d41',
    blue: '#fea9c8',
    accent: '#fea9c8',
    muted: '#9da8c6'
  },

  typography: {
    baseSize: 16,
    heroTitle: 7,
    sectionTitle: 8,
    sectionSpace: 9
  },

  motion: { transition: 600 }
};

/* 深层合并：对象递归合并，数组整体替换，其余以 override 为准 */
window.mergeWentingConfig = function mergeWentingConfig(base, override) {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base) || Array.isArray(override)) return override;
  if (typeof base === 'object' && typeof override === 'object') {
    const result = { ...base };
    Object.keys(override).forEach((key) => {
      result[key] = mergeWentingConfig(base[key], override[key]);
    });
    return result;
  }
  return override;
};

window.loadWentingConfig = function loadWentingConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(window.WENTING_CONFIG_KEY) || 'null');
    const config = window.mergeWentingConfig(window.WENTING_DEFAULTS, saved || {});
    // Migrate the legacy default accent colors to the pink brand color.
    if (config.colors) {
      if (config.colors.blue === '#b6c8ff') config.colors.blue = '#fea9c8';
      if (config.colors.accent === '#e4a0ff') config.colors.accent = '#fea9c8';
    }
    return config;
  } catch (error) {
    return window.mergeWentingConfig(window.WENTING_DEFAULTS, {});
  }
};
