// LinkedInForge Capture - Popup Script

const DEFAULT_SAAS_URL = 'https://linkedinforge.fr';

// State
let currentCapture = {
  title: '',
  url: '',
  selectedText: '',
};
let selectedTone = 'authority';
let generatedData = null;
let saasBaseUrl = DEFAULT_SAAS_URL;

// DOM Elements
const viewCapture = document.getElementById('view-capture');
const viewLoading = document.getElementById('view-loading');
const viewResult = document.getElementById('view-result');

const inputPageTitle = document.getElementById('input-page-title');
const labelPageUrl = document.getElementById('label-page-url');
const containerSelectedText = document.getElementById('container-selected-text');
const labelSelectedText = document.getElementById('label-selected-text');

const toneButtons = document.querySelectorAll('.tone-btn');
const btnForgePost = document.getElementById('btn-forge-post');
const btnOpenStudio = document.getElementById('btn-open-studio');

const outputPostContent = document.getElementById('output-post-content');
const hooksContainer = document.getElementById('hooks-container');
const btnCopyPost = document.getElementById('btn-copy-post');
const copyIcon = document.getElementById('copy-icon');
const copyLabel = document.getElementById('copy-label');
const btnRegenerate = document.getElementById('btn-regenerate');
const btnBackCapture = document.getElementById('btn-back-capture');
const btnOpenStudioResult = document.getElementById('btn-open-studio-result');

const btnSettingsToggle = document.getElementById('btn-settings-toggle');
const settingsDrawer = document.getElementById('settings-drawer');
const inputApiUrl = document.getElementById('input-api-url');
const btnSaveSettings = document.getElementById('btn-save-settings');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load saved settings
  const stored = await chrome.storage.sync.get(['saasBaseUrl', 'preferredTone']);
  if (stored.saasBaseUrl) {
    saasBaseUrl = stored.saasBaseUrl;
    inputApiUrl.value = saasBaseUrl;
  }
  if (stored.preferredTone) {
    setActiveTone(stored.preferredTone);
  }

  // 2. Check for pending capture from context menu or inspect active tab
  const localStored = await chrome.storage.local.get(['pendingCapture']);
  if (localStored.pendingCapture && (Date.now() - localStored.pendingCapture.timestamp < 60000)) {
    currentCapture = {
      title: localStored.pendingCapture.title || '',
      url: localStored.pendingCapture.url || '',
      selectedText: localStored.pendingCapture.text || '',
    };
    // Clear once consumed
    await chrome.storage.local.remove(['pendingCapture']);
    renderCaptureUI();
  } else {
    await inspectActiveTab();
  }

  setupEventListeners();
});

// Inspect Active Tab
async function inspectActiveTab() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab || !activeTab.id) return;

    currentCapture.title = activeTab.title || '';
    currentCapture.url = activeTab.url || '';

    // If currently browsing a LinkedInForge instance, adapt saasBaseUrl automatically if not customized
    if (activeTab.url) {
      try {
        const tabUrl = new URL(activeTab.url);
        if (tabUrl.hostname.includes('linkedinforge') || tabUrl.hostname.includes('localhost')) {
          const stored = await chrome.storage.sync.get(['saasBaseUrl']);
          if (!stored.saasBaseUrl) {
            saasBaseUrl = `${tabUrl.protocol}//${tabUrl.host}`;
            inputApiUrl.value = saasBaseUrl;
          }
        }
      } catch (e) {}
    }

    // Ignore chrome:// or edge:// internal pages
    if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('edge://') || activeTab.url.startsWith('about:')) {
      renderCaptureUI();
      return;
    }

    // Execute script to get selected text and meta description
    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => {
        const selection = window.getSelection()?.toString()?.trim() || '';
        const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
        return {
          selection,
          description: metaDesc || ogDesc,
        };
      },
    });

    if (results && results[0] && results[0].result) {
      currentCapture.selectedText = results[0].result.selection || '';
    }

    renderCaptureUI();
  } catch (err) {
    console.warn('Could not inspect tab:', err);
    renderCaptureUI();
  }
}

// Render Capture UI
function renderCaptureUI() {
  inputPageTitle.value = currentCapture.title || '';
  labelPageUrl.textContent = currentCapture.url || 'Aucune URL détectée';

  if (currentCapture.selectedText) {
    containerSelectedText.classList.remove('hidden');
    labelSelectedText.textContent = `« ${currentCapture.selectedText.slice(0, 300)}${currentCapture.selectedText.length > 300 ? '...' : ''} »`;
  } else {
    containerSelectedText.classList.add('hidden');
  }
}

// Tone Selector
function setActiveTone(tone) {
  selectedTone = tone;
  toneButtons.forEach((btn) => {
    if (btn.dataset.tone === tone) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  chrome.storage.sync.set({ preferredTone: tone });
}

// Event Listeners
function setupEventListeners() {
  // Tone Buttons
  toneButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveTone(btn.dataset.tone);
    });
  });

  // Settings Drawer Toggle
  btnSettingsToggle.addEventListener('click', () => {
    settingsDrawer.classList.toggle('hidden');
  });

  // Save Settings
  btnSaveSettings.addEventListener('click', async () => {
    let newUrl = inputApiUrl.value.trim().replace(/\/+$/, '');
    if (!newUrl) newUrl = DEFAULT_SAAS_URL;
    saasBaseUrl = newUrl;
    await chrome.storage.sync.set({ saasBaseUrl: newUrl });
    settingsDrawer.classList.add('hidden');
  });

  // Forge Post Action
  btnForgePost.addEventListener('click', handleForgePost);
  btnRegenerate.addEventListener('click', handleForgePost);

  // Open Studio Actions
  btnOpenStudio.addEventListener('click', () => openStudio());
  btnOpenStudioResult.addEventListener('click', () => openStudio(outputPostContent.value));

  // Back to Capture
  btnBackCapture.addEventListener('click', () => {
    switchView('capture');
  });

  // Copy Post
  btnCopyPost.addEventListener('click', handleCopyPost);
}

// Forge Post via API
async function handleForgePost() {
  currentCapture.title = inputPageTitle.value.trim() || currentCapture.title;

  switchView('loading');

  try {
    const response = await fetch(`${saasBaseUrl}/api/extension/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: currentCapture.url,
        title: currentCapture.title,
        selectedText: currentCapture.selectedText,
        tone: selectedTone,
        locale: 'fr',
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Erreur serveur (${response.status})`);
    }

    generatedData = await response.json();
    renderResultUI(generatedData);
    switchView('result');
  } catch (error) {
    console.warn('Network or API Error, using resilient client generator:', error);
    generatedData = generateClientFallbackDraft(currentCapture, selectedTone);
    renderResultUI(generatedData);
    switchView('result');
  }
}

function generateClientFallbackDraft(capture, tone) {
  const contentSubject = capture.selectedText || capture.title || 'cette idée clé';
  return {
    title: capture.title || 'Brouillon capturé',
    post: `J'ai lu ceci récemment, et impossible de ne pas le partager :

« ${contentSubject} »

Voici les 3 enseignements majeurs que vous devriez en retenir dès aujourd'hui :

1️⃣ Ce qui semblait complexe devient un levier stratégique quand on l'applique avec clarté.
2️⃣ La plupart des professionnels passent à côté en cherchant la complication.
3️⃣ L'exécution régulière bat toujours le plan parfait non testé.

💡 Votre avis sur la question ? Comment intégrez-vous cette approche dans votre quotidien ?

${capture.url ? `(Source : ${capture.url})` : ''}

#Leadership #Productivité #Innovation #LinkedInForge`,
    hooks: [
      `La plupart des professionnels ignorent ce principe simple. Voici pourquoi :`,
      `En appliquant cette méthode, vous gagnez 6 mois d'avance sur vos concurrents :`,
      `Est-ce que vous faites aussi cette erreur sans vous en rendre compte ?`
    ]
  };
}


// Render Result UI
function renderResultUI(data) {
  outputPostContent.value = data.post || '';

  // Render Hooks
  hooksContainer.innerHTML = '';
  if (Array.isArray(data.hooks) && data.hooks.length > 0) {
    data.hooks.forEach((hookText, idx) => {
      const hookItem = document.createElement('button');
      hookItem.type = 'button';
      hookItem.className = 'hook-item';
      hookItem.innerHTML = `<span class="hook-tag">Hook #${idx + 1}</span> ${escapeHtml(hookText)}`;

      hookItem.addEventListener('click', () => {
        applyHook(hookText);
      });

      hooksContainer.appendChild(hookItem);
    });
  }
}

// Replace the first line of the post with the chosen Hook
function applyHook(newHook) {
  const currentText = outputPostContent.value;
  const lines = currentText.split('\n');

  if (lines.length > 0) {
    lines[0] = newHook;
    outputPostContent.value = lines.join('\n');
  } else {
    outputPostContent.value = newHook;
  }

  // Flash feedback
  outputPostContent.style.backgroundColor = '#fff7ed';
  setTimeout(() => {
    outputPostContent.style.backgroundColor = 'transparent';
  }, 300);
}

// Copy Post Action
async function handleCopyPost() {
  const textToCopy = outputPostContent.value;
  if (!textToCopy) return;

  try {
    await navigator.clipboard.writeText(textToCopy);
    copyIcon.textContent = '✓';
    copyLabel.textContent = 'Copié dans le presse-papier !';
    btnCopyPost.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

    setTimeout(() => {
      copyIcon.textContent = '📋';
      copyLabel.textContent = 'Copier le post';
      btnCopyPost.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
    }, 2500);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// Open Atelier SaaS with deep link
function openStudio(draftContent = '') {
  const targetUrl = new URL('/fr/dashboard', saasBaseUrl);
  targetUrl.searchParams.set('source', 'extension');
  if (currentCapture.url) targetUrl.searchParams.set('url', currentCapture.url);
  if (currentCapture.title) targetUrl.searchParams.set('title', currentCapture.title);
  if (currentCapture.selectedText) targetUrl.searchParams.set('selectedText', currentCapture.selectedText);
  if (selectedTone) targetUrl.searchParams.set('tone', selectedTone);
  if (draftContent) targetUrl.searchParams.set('draft', draftContent);

  chrome.tabs.create({ url: targetUrl.toString() });
}

// Switch View Helpers
function switchView(viewName) {
  viewCapture.classList.add('hidden');
  viewLoading.classList.add('hidden');
  viewResult.classList.add('hidden');

  if (viewName === 'capture') viewCapture.classList.remove('hidden');
  if (viewName === 'loading') viewLoading.classList.remove('hidden');
  if (viewName === 'result') viewResult.classList.remove('hidden');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
