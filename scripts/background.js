chrome.runtime.onMessage.addListener(message => {
  if (!message.newTab) {
    chrome.tabs.update({url: message.url});
  } else {
    chrome.tabs.create({
      url: message.url,
    });
  }
});