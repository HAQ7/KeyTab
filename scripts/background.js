chrome.runtime.onMessage.addListener((message) => {
  if (message.newTab) {
    chrome.tabs
      .query({ active: true })
      .then((tab) => {
        chrome.tabs.remove(tab[0].id);
      })
      .then(() => {
        chrome.tabs.create({
          url: "https://github.com/HAQ7/ShortTap",
        });
      });
  } else {
    chrome.tabs.create({
      url: message.url,
    });
  }
});
