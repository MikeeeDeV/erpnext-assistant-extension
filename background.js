// ERPNext Assistant - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ enabled: true });
});

// Open side panel on action click (also allows popup)
chrome.action.onClicked.addListener(async (tab) => {
  // Toggle side panel
  await chrome.sidePanel.open({ tabId: tab.id });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    chrome.sidePanel.open({ tabId: sender.tab.id });
    sendResponse({ success: true });
  }
  if (message.type === 'SHOW_NOTIFICATION') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: message.title || 'ERPNext Assistant',
      message: message.body || '',
    });
    sendResponse({ success: true });
  }
  return true;
});
