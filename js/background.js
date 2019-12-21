chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.storage.local.get(function(data) {
      data.method = 'clickAction';
      chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
        if(response.message=='settings') {
          chrome.tabs.create({ url: "html/settings.html" });
        }
      });
    });
  });
});
