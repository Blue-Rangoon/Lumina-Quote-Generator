/**
 * ============================================================
 * THOSE WHO GENERATOR
 * Vanilla JavaScript - ES6+ - No framework runtime required.
 * ============================================================
 */

'use strict';

/* =====================================================
   CONSTANTS
   ===================================================== */

<script src="https://deskmind-backend-9870e6dc.fastapicloud.dev/widget.js" data-bot-id="39908dd3-8095-448f-8529-d74e2014f2b4"></script>

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];
const MAX_PREFIX_LENGTH = 60;
const MAX_STATEMENT_LENGTH = 120;
const DEFAULT_PREFIX = '';
const DEFAULT_TEXT_COLOR = '#ffffff';
const TOAST_DURATION = 2600;

/* =====================================================
   DOM REFERENCES
   ===================================================== */

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const previewAvatar = document.getElementById('previewAvatar');
const previewName = document.getElementById('previewName');
const previewSize = document.getElementById('previewSize');
const removeBtn = document.getElementById('removeBtn');

const prefixInput = document.getElementById('prefixInput');
const statementInput = document.getElementById('statementInput');
const prefixCounter = document.getElementById('prefixCounter');
const statementCounter = document.getElementById('statementCounter');
const prefixColor = document.getElementById('prefixColor');
const statementColor = document.getElementById('statementColor');

const livePreview = document.getElementById('livePreview');
const liveAvatar = document.getElementById('liveAvatar');
const livePrefix = document.getElementById('livePrefix');
const liveStatement = document.getElementById('liveStatement');

const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

const exportCard = document.getElementById('exportCard');
const exportAvatar = document.getElementById('exportAvatar');
const exportPrefix = document.getElementById('exportPrefix');
const exportStatement = document.getElementById('exportStatement');

const toastContainer = document.getElementById('toastContainer');

/* =====================================================
   APPLICATION STATE
   ===================================================== */

const state = {
  avatarDataUrl: null,
  avatarName: null,
  avatarSize: 0,
  prefix: DEFAULT_PREFIX,
  statement: '',
  prefixColor: DEFAULT_TEXT_COLOR,
  statementColor: DEFAULT_TEXT_COLOR,
};

/* =====================================================
   UTILITIES
   ===================================================== */

const formatSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const debounce = (fn, wait = 60) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
};

const shake = (el) => {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
};

const getTrimmedQuote = () => ({
  prefix: state.prefix.trim(),
  statement: state.statement.trim(),
});

/* =====================================================
   TOASTS
   ===================================================== */

const ICONS = {
  success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
};

const toast = (message, type = 'info') => {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${ICONS[type]}</span><span>${message}</span>`;
  toastContainer.appendChild(el);

  setTimeout(() => {
    el.classList.add('leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, TOAST_DURATION);
};

/* =====================================================
   AVATAR UPLOAD
   ===================================================== */

const validateFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only PNG, JPG and JPEG images are allowed.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be under 5 MB.';
  }
  return null;
};

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });

const enableQuoteFields = () => {
  prefixInput.disabled = false;
  statementInput.disabled = false;
  prefixInput.placeholder = 'Type a prefix...';
  statementInput.placeholder = 'Type anything...';
};

const disableQuoteFields = () => {
  prefixInput.disabled = true;
  statementInput.disabled = true;
  prefixInput.placeholder = 'Upload an avatar first...';
  statementInput.placeholder = 'Upload an avatar first...';
};

const handleFile = async (file) => {
  if (!file) return;

  const error = validateFile(file);
  if (error) {
    shake(dropzone);
    toast(error, 'error');
    return;
  }

  try {
    const dataUrl = await readFile(file);

    state.avatarDataUrl = dataUrl;
    state.avatarName = file.name;
    state.avatarSize = file.size;

    previewAvatar.src = dataUrl;
    liveAvatar.src = dataUrl;
    previewName.textContent = file.name;
    previewSize.textContent = formatSize(file.size);
    preview.classList.add('visible');

    enableQuoteFields();
    statementInput.focus();

    updateLivePreview();
    updateActionState();
    toast('Avatar uploaded.', 'success');
  } catch {
    toast('Could not read image.', 'error');
  }
};

const clearAvatar = () => {
  state.avatarDataUrl = null;
  state.avatarName = null;
  state.avatarSize = 0;

  preview.classList.remove('visible');
  previewAvatar.removeAttribute('src');
  liveAvatar.removeAttribute('src');
  fileInput.value = '';

  disableQuoteFields();
  updateLivePreview();
  updateActionState();
};

/* =====================================================
   QUOTE INPUTS, COLORS, AND PREVIEW
   ===================================================== */

const updateCounter = (element, len, max) => {
  element.textContent = `${len} / ${max}`;
  element.classList.toggle('warn', len >= Math.floor(max * 0.84) && len < max);
  element.classList.toggle('max', len >= max);
};

const syncColorControls = () => {
  livePrefix.style.color = state.prefixColor;
  liveStatement.style.color = state.statementColor;
  exportPrefix.style.color = state.prefixColor;
  exportStatement.style.color = state.statementColor;
};

const updateLivePreview = () => {
  const { prefix, statement } = getTrimmedQuote();

  livePrefix.textContent = prefix || 'Your Prefix';
  liveStatement.textContent = statement || '...your statement will appear here';
  syncColorControls();

  livePreview.classList.toggle('active', !!state.avatarDataUrl && !!prefix && !!statement);
};

const updateActionState = () => {
  const { prefix, statement } = getTrimmedQuote();
  const ready = !!state.avatarDataUrl && !!prefix && !!statement;

  downloadBtn.disabled = !ready;
  copyBtn.disabled = !(!!prefix && !!statement);
};

const debouncedPreview = debounce(() => {
  updateLivePreview();
  updateActionState();
}, 40);

const sanitizeInputValue = (input, max) => {
  let value = input.value;
  if (value.startsWith(' ')) value = value.trimStart();
  if (value.length > max) value = value.slice(0, max);
  if (value !== input.value) input.value = value;
  return value;
};

const handlePrefixInput = () => {
  state.prefix = sanitizeInputValue(prefixInput, MAX_PREFIX_LENGTH);
  updateCounter(prefixCounter, state.prefix.length, MAX_PREFIX_LENGTH);
  debouncedPreview();
};

const handleStatementInput = () => {
  state.statement = sanitizeInputValue(statementInput, MAX_STATEMENT_LENGTH);
  updateCounter(statementCounter, state.statement.length, MAX_STATEMENT_LENGTH);
  debouncedPreview();
};

const handlePrefixColor = () => {
  state.prefixColor = prefixColor.value;
  updateLivePreview();
};

const handleStatementColor = () => {
  state.statementColor = statementColor.value;
  updateLivePreview();
};

/* =====================================================
   DOWNLOAD / EXPORT
   ===================================================== */

const validateReadyForExport = () => {
  const { prefix, statement } = getTrimmedQuote();

  if (!state.avatarDataUrl) {
    toast('Upload an avatar first.', 'error');
    shake(dropzone);
    return false;
  }
  if (!prefix) {
    toast('Please enter a prefix.', 'error');
    shake(prefixInput);
    return false;
  }
  if (!statement) {
    toast('Please enter a quote statement.', 'error');
    shake(statementInput);
    return false;
  }
  return true;
};

const downloadQuote = async () => {
  if (!validateReadyForExport()) return;

  const { prefix, statement } = getTrimmedQuote();

  exportAvatar.src = state.avatarDataUrl;
  exportPrefix.textContent = prefix;
  exportStatement.textContent = statement;
  syncColorControls();

  if (!exportAvatar.complete) {
    await new Promise((resolve) => {
      exportAvatar.addEventListener('load', resolve, { once: true });
      exportAvatar.addEventListener('error', resolve, { once: true });
    });
  }

  try {
    downloadBtn.disabled = true;

    const canvas = await html2canvas(exportCard, {
      backgroundColor: '#0a0a0a',
      scale: 1,
      width: 1600,
      height: 900,
      logging: false,
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = 'quote.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    downloadBtn.classList.add('success-flash');
    setTimeout(() => downloadBtn.classList.remove('success-flash'), 700);
    toast('Downloaded!', 'success');
  } catch (err) {
    console.error('Export failed:', err);
    toast('Download failed.', 'error');
  } finally {
    updateActionState();
  }
};

/* =====================================================
   COPY AND RESET
   ===================================================== */

const copyQuote = async () => {
  const { prefix, statement } = getTrimmedQuote();
  if (!prefix || !statement) {
    toast('Nothing to copy.', 'error');
    return;
  }

  const fullQuote = `${prefix}\n${statement}`;

  try {
    await navigator.clipboard.writeText(fullQuote);
    toast('Copied.', 'success');
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = fullQuote;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      toast('Copied.', 'success');
    } catch {
      toast('Copy failed.', 'error');
    }
  }
};

const resetAll = () => {
  clearAvatar();

  state.prefix = DEFAULT_PREFIX;
  state.statement = '';
  state.prefixColor = DEFAULT_TEXT_COLOR;
  state.statementColor = DEFAULT_TEXT_COLOR;

  prefixInput.value = DEFAULT_PREFIX;
  statementInput.value = '';
  prefixColor.value = DEFAULT_TEXT_COLOR;
  statementColor.value = DEFAULT_TEXT_COLOR;

  updateCounter(prefixCounter, state.prefix.length, MAX_PREFIX_LENGTH);
  updateCounter(statementCounter, 0, MAX_STATEMENT_LENGTH);
  updateLivePreview();
  updateActionState();

  toast('Reset complete.', 'info');
};

/* =====================================================
   EVENTS
   ===================================================== */

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('drag-over');
  });
});

dropzone.addEventListener('drop', (e) => {
  handleFile(e.dataTransfer?.files?.[0]);
});

fileInput.addEventListener('change', (e) => {
  handleFile(e.target.files?.[0]);
});

removeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  clearAvatar();
  toast('Avatar removed.', 'info');
});

document.addEventListener('paste', (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        handleFile(file);
        break;
      }
    }
  }
});

prefixInput.addEventListener('input', handlePrefixInput);
statementInput.addEventListener('input', handleStatementInput);
prefixColor.addEventListener('input', handlePrefixColor);
statementColor.addEventListener('input', handleStatementColor);

[prefixInput, statementInput].forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      downloadQuote();
    }
  });
});

downloadBtn.addEventListener('click', downloadQuote);
copyBtn.addEventListener('click', copyQuote);
resetBtn.addEventListener('click', resetAll);

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    downloadQuote();
  }

  if (e.key === 'Escape') {
    e.preventDefault();
    resetAll();
    prefixInput.blur();
    statementInput.blur();
  }
});

/* =====================================================
   INIT
   ===================================================== */

updateCounter(prefixCounter, state.prefix.length, MAX_PREFIX_LENGTH);
updateCounter(statementCounter, 0, MAX_STATEMENT_LENGTH);
updateLivePreview();
updateActionState();
