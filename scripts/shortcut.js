let shortcuts = [];
let keybinds = [];

const getSavedShortcuts = () => {
  chrome.storage.local.get(["savedShortcuts"], result => {
    shortcuts = [...result.savedShortcuts];
  });
};

getSavedShortcuts();

chrome.storage.onChanged.addListener(getSavedShortcuts);

document.addEventListener("keydown", event => {
  if (!event.repeat) {
    let pressedKey = event.code;
      if (event.code.includes("Key")) {
        pressedKey = event.code.slice(3)
      } else if (event.code.includes("Alt")) {
        pressedKey = event.code.slice(0,3);
      } else if (event.code.includes("Shift")) {
        pressedKey = event.code.slice(0,5);
      }
    keybinds.push(pressedKey);

    shortcuts.forEach(shortcut => {
      if (keybinds.length === shortcut.keybind.length) {
        let numOfTrue = 0;
        keybinds.forEach(keybind => {
          if (shortcut.keybind.includes(keybind, numOfTrue)) {
            numOfTrue++;
          }
        });
        if (numOfTrue === shortcut.keybind.length) {
          chrome.runtime.sendMessage({
            url: shortcut.url,
            newTab: shortcut.newTab,
          });
        }
      }
    });
  }
});

document.addEventListener("keyup", () => {
  keybinds = [];
});
