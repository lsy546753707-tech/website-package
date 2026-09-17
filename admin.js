/* ============================================================
 * 李淑雁 / WENTING 视觉作品集 — 后台编辑逻辑
 * 通用 data-path 数据绑定：所有带 data-path 的控件直接映射到配置对象。
 * 保存到 localStorage，前台刷新生效；iframe 实时预览。
 * ============================================================ */

const preview = document.querySelector('#preview');
const status = document.querySelector('#save-status');
let editorConfig = window.loadWentingConfig();

/* ---------- 配置读写工具 ---------- */

function getAtPath(object, path) {
  return path.reduce((value, key) => (value == null ? value : value[key]), object);
}

function setAtPath(object, path, value) {
  const parent = path.slice(0, -1).reduce((current, key) => (current == null ? {} : current[key]), object);
  parent[path[path.length - 1]] = value;
}

/* ---------- 控件解析 / 回填 ---------- */

function parseValue(el) {
  const type = el.dataset.type;
  if (type === 'number') return Number(el.value);
  if (type === 'list') return String(el.value).split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
  if (el.type === 'checkbox') return el.checked;
  if (el.type === 'select-one') return el.value;
  return el.value;
}

function displayValue(el, value) {
  const type = el.dataset.type;
  if (type === 'list') {
    el.value = Array.isArray(value) ? value.join(', ') : '';
  } else if (el.type === 'checkbox') {
    el.checked = Boolean(value);
  } else {
    el.value = value == null ? '' : String(value);
  }
}

function formatOutput(key, value) {
  if (key === 'motion.transition') return `${value} ms`;
  if (key === 'typography.baseSize') return `${value} px`;
  if (key === 'typography.sectionSpace') return `${value} rem`;
  if (key === 'typography.heroTitle' || key === 'typography.sectionTitle') return `${value} vw`;
  return value == null ? '' : String(value);
}

/* ---------- 状态提示 / 预览 ---------- */

function announce(message) {
  status.textContent = message;
  window.clearTimeout(announce.timeout);
  announce.timeout = window.setTimeout(() => { status.textContent = '未保存'; }, 2000);
}

function sendPreview() {
  try {
    preview.contentWindow?.postMessage({ type: 'wenting-config-preview', config: editorConfig }, '*');
  } catch (error) {
    // iframe 尚未加载完成时静默跳过，load 事件会补发
  }
}

/* ---------- 数据绑定 ---------- */

function syncDisplayForPath(path) {
  const key = path.join('.');
  document.querySelectorAll(`[data-path="${CSS.escape(key)}"]`).forEach((el) => {
    displayValue(el, getAtPath(editorConfig, path));
  });
  document.querySelectorAll(`[data-output="${CSS.escape(key)}"]`).forEach((out) => {
    out.textContent = formatOutput(key, getAtPath(editorConfig, path));
  });
}

function renderValues() {
  document.querySelectorAll('[data-path]').forEach((el) => {
    const path = el.dataset.path.split('.');
    displayValue(el, getAtPath(editorConfig, path));
  });
  document.querySelectorAll('[data-output]').forEach((out) => {
    const path = out.dataset.output.split('.');
    out.textContent = formatOutput(out.dataset.output, getAtPath(editorConfig, path));
  });
}

document.querySelectorAll('[data-path]').forEach((el) => {
  el.addEventListener('input', () => {
    const path = el.dataset.path.split('.');
    setAtPath(editorConfig, path, parseValue(el));
    syncDisplayForPath(path);
    sendPreview();
    announce('正在预览');
  });
});

/* ---------- 图片上传（自动压缩内嵌） ---------- */

function compressImage(file, maxSize = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(type, quality));
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片读取失败'));
    };
    image.src = url;
  });
}

document.querySelectorAll('[data-upload]').forEach((input) => {
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    const path = input.dataset.upload.split('.');
    try {
      const dataUrl = await compressImage(file);
      setAtPath(editorConfig, path, dataUrl);
      syncDisplayForPath(path);
      sendPreview();
      announce('图片已更新，点击保存生效');
    } catch (error) {
      announce('图片处理失败');
    }
    input.value = '';
  });
});

/* ---------- 保存 / 恢复默认 / 导入 / 导出 ---------- */

function save() {
  try {
    localStorage.setItem(window.WENTING_CONFIG_KEY, JSON.stringify(editorConfig));
    announce('已保存');
  } catch (error) {
    announce('保存失败：存储空间不足');
  }
}

document.querySelectorAll('#save-button, #save-button-bottom').forEach((button) => {
  button.addEventListener('click', save);
});

document.querySelectorAll('#reset-button, #reset-button-bottom').forEach((button) => {
  button.addEventListener('click', () => {
    editorConfig = window.mergeWentingConfig(window.WENTING_DEFAULTS, {});
    renderValues();
    localStorage.removeItem(window.WENTING_CONFIG_KEY);
    sendPreview();
    announce('已恢复默认');
  });
});

document.querySelector('#export-button').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(editorConfig, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'wenting-portfolio-config.json';
  anchor.click();
  URL.revokeObjectURL(url);
  announce('已导出');
});

const importFile = document.querySelector('#import-file');
document.querySelector('#import-button').addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      editorConfig = window.mergeWentingConfig(window.WENTING_DEFAULTS, parsed);
      renderValues();
      sendPreview();
      announce('已导入，请保存');
    } catch (error) {
      announce('导入失败：文件格式错误');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
});

/* ---------- 初始化 ---------- */

preview.addEventListener('load', sendPreview);
renderValues();
