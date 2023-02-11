const nameInput = document.getElementById("nameInput");
const urlInput = document.getElementById("urlInput");
const invalidText = document.querySelector(".invalid-text");
const checkbox = document.getElementById("checkbox");
const recBtn = document.getElementById("recBtn");
const shortcutList = document.getElementById("shortcutList");
const shortcutListHeader = document.querySelector(".shortcut-list-header");
const githubIcon = document.querySelector(".github");
const coffeeIcon = document.querySelector(".coffee");
const hint = document.querySelector(".hint");
const root = document.querySelector(":root");
let urlValid = true;
let hasStartedRec = false;
let shortcuts = [];
let keybinds = [];

const recBtnHandler = () => {
  if (hasStartedRec || !urlValid) {
    return;
  }
  hasStartedRec = true;
  changeRecStyle("#6B1C18", "#992822", "insert keybind...");
  const recorder = event => {
    if (!event.repeat && event.code !== "Space") {
      keybinds.push(event.key);
    }
  };
  document.addEventListener("keydown", recorder);

  const endRecord = event => {
    if (event.key === "Enter" || event.code === "Space") {
      return;
    }
    document.removeEventListener("keydown", recorder);
    document.removeEventListener("keyup", endRecord);
    hasStartedRec = false;
    changeRecStyle("#0f3157", "#438BDE", "Record Keybind");
    createShortcut();
  };
  document.addEventListener("keyup", endRecord);
};

const changeRecStyle = (mainColor, secColor, text) => {
  root.style.setProperty("--mainColor", mainColor);
  root.style.setProperty("--secColor", secColor);
  recBtn.textContent = text;
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

const createShortcutElement = shortcut => {
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

const deleteShortcut = shortcutId => {
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

const deleteShortcutElement = shortcutId => {
  document.getElementById(`${shortcutId}`).remove();
};

const resetInput = () => {
  nameInput.textContent = "";
  urlInput.textContent = "";
  keybinds = [];
};

const displayCheck = () => {
  if (!shortcuts.length) {
    shortcutListHeader.style.opacity = "0";
  } else {
    shortcutListHeader.style.opacity = "1";
  }
};

const setSavedShortcuts = () => {
  chrome.storage.local.set({ savedShortcuts: shortcuts }, () => {
    console.log(`saved`);
  });
};

const getSavedShortcuts = () => {
  chrome.storage.local.get(["savedShortcuts"], result => {
    if (result.savedShortcuts !== 0) {
      shortcuts = [...result.savedShortcuts];
      shortcuts.forEach(shortcut => {
        createShortcutElement(shortcut);
      });
    }
    displayCheck();
  });
};

const checkPage = () => {
  chrome.tabs.query({active: true}).then(tab => {
    if (tab[0].url.includes("chrome://")) {
      hint.style = "display: block;"
    }
  })
}

checkPage();
getSavedShortcuts();

recBtn.addEventListener("click", recBtnHandler);

// url validate ----------------------------------------------------------

urlInput.addEventListener("blur", () => {
  if (
    urlInput.value.includes("https://") ||
    urlInput.value.includes("http://") ||
    urlInput.value.includes("file://")
  ) {
    urlValid = true;
    urlInput.classList.remove("invalid");
    invalidText.style = "opacity: 0;"
  } else {
    urlValid = false;
    urlInput.classList.add("invalid");
    invalidText.style = "opacity: 1;"
  }
});

// ANIMATION and LINKS FOR ICONS ------------------

githubIcon.addEventListener("click", () => {
  chrome.tabs.create({
    url: "https://github.com/HAQ7/ShortTap",
  });
});

coffeeIcon.addEventListener("mouseover", () => {
  coffeeIcon.classList.remove("coffee-animation");
});

coffeeIcon.addEventListener("mouseout", () => {
  coffeeIcon.classList.add("coffee-animation");
});

coffeeIcon.addEventListener("click", () => {
  chrome.tabs.create({
    url: "https://www.buymeacoffee.com/HAQ7",
  });
});
