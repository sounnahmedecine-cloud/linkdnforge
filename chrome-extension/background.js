// LinkedInForge Capture - Service Worker (Background Script)

const DEFAULT_SAAS_URL = 'https://linkedinforge.fr';

// Set up Context Menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'forge-selection-post',
    title: '⚡ Forger un post avec LinkedInForge',
    contexts: ['selection', 'page', 'link'],
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'forge-selection-post') {
    const selectedText = info.selectionText || '';
    const pageUrl = info.linkUrl || info.pageUrl || tab?.url || '';
    const pageTitle = tab?.title || '';

    // Save pending capture in local storage for popup
    await chrome.storage.local.set({
      pendingCapture: {
        text: selectedText,
        url: pageUrl,
        title: pageTitle,
        timestamp: Date.now(),
      },
    });

    // Get current Saas Base URL (user preference or default)
    const stored = await chrome.storage.sync.get(['saasBaseUrl']);
    const baseUrl = stored.saasBaseUrl || DEFAULT_SAAS_URL;

    // Construct deep link URL
    const targetUrl = new URL('/fr/dashboard', baseUrl);
    targetUrl.searchParams.set('source', 'extension');
    if (pageUrl) targetUrl.searchParams.set('url', pageUrl);
    if (pageTitle) targetUrl.searchParams.set('title', pageTitle.slice(0, 150));
    if (selectedText) {
      targetUrl.searchParams.set('selectedText', selectedText.slice(0, 500));
      targetUrl.searchParams.set('tab', 'idea');
    } else if (pageUrl) {
      targetUrl.searchParams.set('tab', 'url');
    }

    // Open Atelier in a new tab
    chrome.tabs.create({ url: targetUrl.toString() });
  }
});
