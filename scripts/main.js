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
let isValid = false;
let hasStartedRec = false;
let shortcuts = [];
let keybinds = [];

// url and shortcut validate ----------------------------------------------------------



const urlValidate = () => {
  if (
    urlInput.value.includes("https://") ||
    urlInput.value.includes("http://") ||
    urlInput.value.includes("file://")
  ) {
    errorTrigger("Invalid URL","off");
    urlInput.style = "border: none";
  } else {
    errorTrigger("Invalid URL","on");
    urlInput.style = "border: #992822 1px solid;";
  }
}

urlInput.addEventListener("blur", urlValidate);

const errorTrigger = (textError, mode) => {
  if (mode === 'on') {
    isValid = false;
    invalidText.classList.add("invalid");
    invalidText.style = "opacity: 1;";
    invalidText.textContent = textError;
  } else {
    isValid = true;
    invalidText.classList.remove("invalid");
    invalidText.style = "opacity: 0;";
  }
};

const validateShortcut = newShortcut => {
  if (newShortcut.keybind[0] !== "Shift" && newShortcut.keybind[0] !== "Alt") {
    errorTrigger("Must start with SHIFT or ALT","on");
    return;
  }
  for (j = 0; j < shortcuts.length; j++) {
    numOfTrue = 0;
    for (i = 0; i < shortcuts[j].keybind.length; i++) {
      if (shortcuts[j].keybind[i] === newShortcut.keybind[i]) {
        numOfTrue++;
      }

      if (numOfTrue === shortcuts[j].keybind.length) {
        errorTrigger("Keybind already in use, try another","on");
        return;
      }
    }
  }
  errorTrigger("","off");
}

// record -----------------------------------------------------------


const recBtnHandler = () => {
  urlValidate();
  if (hasStartedRec || !isValid) {
    return
  }
  hasStartedRec = true;
  checkPage();
  changeRecStyle("#6B1C18", "#992822", "insert keybind...");
  const recorder = event => {
    if (!event.repeat && event.code !== "Space" && event.code !== "Enter") {
      let pressedKey = event.code;
      if (event.code.includes("Key")) {
        pressedKey = event.code.slice(3)
      } else if (event.code.includes("Alt")) {
        pressedKey = event.code.slice(0,3);
      } else if (event.code.includes("Shift")) {
        pressedKey = event.code.slice(0,5);
      }
      keybinds.push(pressedKey);
    }
  };
  document.addEventListener("keydown", recorder);

  const endRecord = event => {
    if (event.code === "Enter" || event.code === "Space") {
      return;
    }
    document.removeEventListener("keydown", recorder);
    document.removeEventListener("keyup", endRecord);
    hasStartedRec = false;
    checkPage();
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
  console.log(keybinds)
  const shortcut = {
    name: nameInput.value,
    url: urlInput.value,
    newTab: checkbox.checked,
    keybind: keybinds,
    id: `${Math.random()}`,
  };
  resetInput();
  validateShortcut(shortcut);
  if (!isValid) {
    return
  }
  shortcuts.push(shortcut);
  displayCheck();
  setSavedShortcuts();
  createShortcutElement(shortcut);
};

const createShortcutElement = shortcut => {
  const shortcutElement = document.createElement("li");
  shortcutElement.id = `${shortcut.id}`;
  shortcutElement.className = "shortcut";
  shortcutElement.innerHTML = `
    <p class="shortcut-info shortcut-name">${shortcut.name}</p>
    <p class="shortcut-info shortcut-keybind">${shortcut.keybind}</p>
    <p class="shortcut-info shortcut-openas">${
      shortcut.newTab ? "Yes" : "No"
    }</p>
    <button class="change-openas">NewTab</button>
    <button class="delete-shortcut">Delete</button>
  `;
  shortcutList.append(shortcutElement);
  const deleteBtn = shortcutElement.querySelector(".delete-shortcut");
  deleteBtn.addEventListener("click", deleteShortcut.bind(null, shortcut.id));
  const changeOpenasBtn = shortcutElement.querySelector("button");
  changeOpenasBtn.addEventListener("click", changeOpenas.bind(null,shortcut.id));
};

const changeOpenas = shortcutId => {
  for (let i in shortcuts) {
    if (shortcuts[i].id === shortcutId) {
      shortcuts[i].newTab = !shortcuts[i].newTab;
      break;
    }
  }

  const element = document.getElementById(shortcutId).querySelector(".shortcut-openas");
  element.textContent = element.textContent === "Yes" ? "No" : "Yes";
  setSavedShortcuts();
}

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
  document.getElementById(shortcutId).remove();
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
  chrome.storage.local.set({ savedShortcuts: shortcuts });
};

const getSavedShortcuts = () => {
  chrome.storage.local.get(["savedShortcuts"], result => {
    console.log(result.savedShortcuts)
    if (result.savedShortcuts) {
      shortcuts = [...result.savedShortcuts];
      shortcuts.forEach(shortcut => {
        createShortcutElement(shortcut);
      });
    }
    displayCheck();
  });
};

const checkPage = () => {
  if(hasStartedRec) {
    hint.style = "display: block;";
    hint.textContent = "note that the Keybind must start with ALT or SHIFT";
  } else {
    hint.style = "display: none;"
    chrome.tabs.query({ active: true }).then(tab => {
      if (tab[0].url.includes("chrome://") || tab[0].url.includes("https://chrome.google.com/")) {
        hint.style = "display: block;";
        hint.textContent = "chrome will not allow keybinds to work on this page !";
      }
    });
  }
};

checkPage();
getSavedShortcuts();

recBtn.addEventListener("click", recBtnHandler);


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

