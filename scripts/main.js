const nameInput = document.getElementById("nameInput");
const urlInput = document.getElementById("urlInput");
const checkbox = document.getElementById("checkbox");
const recBtn = document.getElementById("recBtn");
const shortcutList = document.getElementById("shortcutList");
const shortcutListHeader = document.querySelector('.shortcut-list-header');
let shortcuts = [];
let keybinds = [];

const recBtnHandler = () => {
  const recorder = (event) => {
    if (!event.repeat) {
      keybinds.push(event.key);
    }
  };
  document.addEventListener("keydown", recorder);

  const endRecord = () => {
    document.removeEventListener("keydown", recorder);
    document.removeEventListener("keyup", endRecord);
    createShortcut();
  };
  document.addEventListener("keyup", endRecord);
};

const createShortcut = () => {
  const shortcut = {
    name: nameInput.value,
    url: urlInput.value,
    newTab: checkbox.checked,
    keybind: keybinds,
    id: `${Math.random()}`,
  };
  shortcuts.push(shortcut);
  displayCheck();
  setSavedShortcuts();
  createShortcutElement(shortcut);
  resetInput();
};

const createShortcutElement = (shortcut) => {
  const shortcutElement = document.createElement("li");
  shortcutElement.id = `${shortcut.id}`;
  shortcutElement.className = "shortcut";
  shortcutElement.innerHTML = `
    <p class="shortcut-info shortcut-name">${shortcut.name}</p>
    <p class="shortcut-info shortcut-keybind">${shortcut.keybind}</p>
    <p class="shortcut-info hortcut-openas">${
      shortcut.newTab ? "Yes" : "No"
    }</p>
    <button class="delete-shortcut">Delete</button>
  `;
  shortcutList.append(shortcutElement);
  const deleteBtn = shortcutElement.querySelector("button");
  deleteBtn.addEventListener("click", deleteShortcut.bind(null, shortcut.id));
};

const deleteShortcut = (shortcutId) => {
  for (let i in shortcuts) {
    if (shortcuts[i].id === shortcutId) {
      shortcuts.splice(i, 1);
      break;
    }
  }
  setSavedShortcuts();
  displayCheck();
  deleteShortcutElement(shortcutId);
};

const deleteShortcutElement = (shortcutId) => {
  document.getElementById(`${shortcutId}`).remove();
};

const resetInput = () => {
  nameInput.textContent = "";
  urlInput.textContent = "";
  keybinds = [];
};

const displayCheck = () => {
  if (!shortcuts.length) {
    shortcutListHeader.style.opacity = '0';
  } else {
    shortcutListHeader.style.opacity = '1';
  }
};

const setSavedShortcuts = () => {
  chrome.storage.local.set({ savedShortcuts: shortcuts }, () => {
    console.log(`saved`);
  });
};

const getSavedShortcuts = () => {
  chrome.storage.local.get(["savedShortcuts"], (result) => {
    console.log(result);
    shortcuts = [...result.savedShortcuts];
    shortcuts.forEach((shortcut) => {
      createShortcutElement(shortcut);
    });
    displayCheck();
  });
};

getSavedShortcuts();


recBtn.addEventListener("click", recBtnHandler);
