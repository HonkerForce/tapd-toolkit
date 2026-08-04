chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('tapd_settings', data => {
    if (!data.tapd_settings) {
      chrome.storage.sync.set({
        tapd_settings: {
          enabled: true,
          brightness: 0,
          contrast: 0,
          temperature: 0,
          followSystem: true
        }
      });
    }
  });
});
