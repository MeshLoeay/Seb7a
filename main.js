// كود إجباري لمسح أي نسخة قديمة مخزنة في المتصفح (Service Worker)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

// العناصر الأساسية
const display = document.getElementById("display");
const hasanatDisplay = document.getElementById("hasanatDisplay");
const countBtn = document.getElementById("countBtn");
const resetBtn = document.getElementById("resetBtn");
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const colorMenu = document.getElementById("colorMenu");
const activeDhikrLabel = document.getElementById("activeDhikr");
const childModeToggle = document.getElementById("childModeToggle");
const modeEmoji = document.getElementById("modeEmoji");

// --- [تعديل] إنشاء عنصر المستوى الشفاف مع الشريط النحيف (3px) ---
const levelBadge = document.createElement("div");
levelBadge.id = "levelDisplay";
levelBadge.style.cssText = `
  position: absolute;
  top: 60px;
  right: 10px;
  width: 70px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  order: 10;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: none;
`;

// عنصر نص كلمة "المستوى"
const levelTextSpan = document.createElement("span");
levelTextSpan.id = "levelText";
levelTextSpan.innerText = "المستوى";
levelTextSpan.style.cssText = `
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

// حاوية شريط التقدم
const progressContainer = document.createElement("div");
progressContainer.style.cssText = `
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
`;

// الشريط الملون الداخلي (الذي يملأ النسبة)
const progressBarFill = document.createElement("div");
progressBarFill.id = "levelProgressBar";
progressBarFill.style.cssText = `
  position: absolute;
  left: 0;
  top: 0;
  width: 0%;
  height: 100%;
  background: #fff;
  transition: width 0.5s ease;
`;

progressContainer.appendChild(progressBarFill);
levelBadge.appendChild(levelTextSpan);
levelBadge.appendChild(progressContainer);

const toolsContainer = document.querySelector(".bottom-right-tools");
if (toolsContainer) {
  toolsContainer.style.flexWrap = "wrap";
  toolsContainer.style.justifyContent = "center";
  toolsContainer.appendChild(levelBadge);
}

// استرجاع البيانات المحفوظة
let count = parseInt(localStorage.getItem("tasbihCount")) || 0;
let totalHasanat = parseInt(localStorage.getItem("totalHasanat")) || 0;
let isDark = localStorage.getItem("isDark") === "true";
let activeDhikrText =
  localStorage.getItem("activeDhikr") ||
  "اللهم انك عفو كريم تحب العفو فاعفو عنى";
let savedColors = JSON.parse(localStorage.getItem("themeColors")) || {
  c1: "#1e3a8a",
  c2: "#172554",
};
let isChildMode = false;
let fruitInterval;
let lastLevel = -1;

// --- منطق حساب المستويات وتحديث الشريط ---
function updateLevel() {
  let score = totalHasanat;
  let level = 0;
  let nextGoal = 0;
  let currentBase = 0;

  if (score >= 1000) {
    level = 5 + Math.floor((score - 1000) / 1000);
    currentBase = 1000 + Math.floor((score - 1000) / 1000) * 1000;
    nextGoal = currentBase + 1000;
  } else if (score >= 500) {
    level = 4;
    currentBase = 500;
    nextGoal = 1000;
  } else if (score >= 250) {
    level = 3;
    currentBase = 250;
    nextGoal = 500;
  } else if (score >= 100) {
    level = 2;
    currentBase = 100;
    nextGoal = 250;
  } else if (score >= 10) {
    level = 1;
    currentBase = 10;
    nextGoal = 100;
  } else {
    level = 0;
    currentBase = 0;
    nextGoal = 10;
  }

  let progress = score - currentBase;
  let range = nextGoal - currentBase;
  let percent = Math.floor((progress / range) * 100);

  // تحديث النص والشريط
  document.getElementById("levelText").innerText = `المستوى ${level}`;
  document.getElementById("levelProgressBar").style.width = `${percent}%`;

  if (lastLevel !== -1 && level > lastLevel) {
    triggerLevelUpAnimation();
  }
  lastLevel = level;
}

function triggerLevelUpAnimation() {
  levelBadge.style.transform = "scale(1.3)";
  display.style.transition = "transform 0.3s ease";
  display.style.transform = "scale(1.15)";
  setTimeout(() => {
    levelBadge.style.transform = "scale(1)";
    display.style.transform = "scale(1)";
  }, 500);
}

// باقي دوال الموقع (ToDo, Data Loading, الخ)
let todoTasks = JSON.parse(localStorage.getItem("myTodoTasks")) || [];
const fruits = [
  "🍎",
  "🍏",
  "🍊",
  "🍋",
  "🍌",
  "🍉",
  "🍇",
  "🍓",
  "🍒",
  "🍑",
  "🍍",
  "🥭",
  "🥝",
];
const cheerSound = new Audio(
  "https://www.myinstants.com/media/sounds/kids_cheering.mp3",
);

let dhikrList = [];
let doaaList = [];
let savedAzkar = JSON.parse(localStorage.getItem("myAzkarList_V3")) || [];
let savedDoaa = JSON.parse(localStorage.getItem("myDoaaList_V3")) || [];
let baseQA = [];
let baseQuran = [];
let baseMsgs = [];
let myQA = JSON.parse(localStorage.getItem("customQA")) || [];
let myQuran = JSON.parse(localStorage.getItem("customQuran")) || [];
let myMsgs = JSON.parse(localStorage.getItem("customMsgs")) || [];

async function loadData() {
  try {
    const [azkarRes, doaaRes, qaRes, quranRes, msgsRes] = await Promise.all([
      fetch("azkar.json").catch(() => null),
      fetch("doaa.json").catch(() => null),
      fetch("qa.json").catch(() => null),
      fetch("quran.json").catch(() => null),
      fetch("messages.json").catch(() => null),
    ]);
    if (azkarRes && azkarRes.ok) {
      const data = await azkarRes.json();
      dhikrList = [...new Set([...data.azkar])];
    }
    if (doaaRes && doaaRes.ok) {
      const data = await doaaRes.json();
      doaaList = [...new Set([...data.doaa])];
    }
    if (qaRes && qaRes.ok) {
      const data = await qaRes.json();
      baseQA = data.qa;
    }
    if (quranRes && quranRes.ok) {
      const data = await quranRes.json();
      baseQuran = data.quran;
    }
    if (msgsRes && msgsRes.ok) {
      const data = await msgsRes.json();
      baseMsgs = data.messages;
    }
    activeDhikrLabel.innerText = activeDhikrText;
  } catch (error) {
    console.error("خطأ في تحميل الملفات:", error);
  }
}

function formatHasanat(num) {
  return num.toLocaleString();
}

function init() {
  loadData();
  display.innerText = count;
  hasanatDisplay.innerText = formatHasanat(totalHasanat);
  updateLevel();
  activeDhikrLabel.innerText = activeDhikrText;
  changeColor(savedColors.c1, savedColors.c2, false);
  if (isDark) applyTheme(true);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-popup";
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1500);
}

function showMoreOptions() {
  const listDiv = document.getElementById("azkarList");
  const title = document.getElementById("overlayMainTitle");
  listDiv.innerHTML = "";
  title.innerText = "القائمة الإضافية";
  const options = [
    { text: "📅 هنعمل إيه النهاردة", action: () => openTodoSection() },
    { text: "الأدعية", action: () => openOverlay("doaa") },
    { text: "سؤال وجواب", action: () => openSection("qa") },
    { text: "رسائل من القرآن", action: () => openSection("quran") },
    { text: "رسائل", action: () => openSection("msg") },
  ];
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.style.width = "100%";
    btn.style.marginBottom = "10px";
    btn.style.padding = "15px";
    btn.style.backgroundColor = "white";
    btn.style.color = "var(--main-color-1)";
    btn.style.border = "2px solid var(--main-color-1)";
    btn.style.fontWeight = "bold";
    btn.style.borderRadius = "12px";
    btn.innerText = opt.text;
    btn.onclick = opt.action;
    listDiv.appendChild(btn);
  });
  document.getElementById("azkarOverlay").style.display = "flex";
}

function openTodoSection() {
  const listDiv = document.getElementById("azkarList");
  const title = document.getElementById("overlayMainTitle");
  listDiv.innerHTML = "";
  title.innerText = "📅 هنعمل إيه النهاردة";
  const completed = todoTasks.filter((t) => t.done).length;
  const total = todoTasks.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  let barColor = "var(--main-color-1)";
  const progressHTML = `
    <div style="margin-bottom: 25px; text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 20px;">
      <div style="background: white; border-radius: 12px; height: 16px; width: 100%; overflow: hidden; border: 2px solid rgba(255,255,255,0.2);">
        <div id="todoProgressBar" style="background: ${barColor}; height: 100%; width: ${percent}%; transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1), background 0.5s ease;"></div>
      </div>
      <p style="margin-top: 10px; color: white; font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">إنجازك: ${percent}%</p>
      <p style="color: #cbd5e1; font-size: 0.9rem;">أنا جبت ${completed} من ${total}</p>
    </div>
  `;
  listDiv.innerHTML += progressHTML;
  const addBtn = document.createElement("button");
  addBtn.className = "nav-btn";
  addBtn.style.width = "100%";
  addBtn.style.marginBottom = "20px";
  addBtn.style.backgroundColor = "#059669";
  addBtn.style.color = "white";
  addBtn.innerText = "إضافة بوست جديد +";
  addBtn.onclick = () => {
    const task = prompt("ماذا ستقوم بفعله اليوم؟");
    if (task && task.trim() !== "") {
      todoTasks.push({ text: task.trim(), done: false });
      saveTodo();
      openTodoSection();
    }
  };
  listDiv.appendChild(addBtn);
  const doneWrapper = document.createElement("div");
  const pendingWrapper = document.createElement("div");
  const hDone = document.createElement("h3");
  hDone.innerText = "✅ خلصنا الحمد لله";
  hDone.style.color = "#059669";
  const hPending = document.createElement("h3");
  hPending.innerText = "📌 لسه مخلصناش";
  hPending.style.color = "#fff";
  todoTasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = "dhikr-item";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.gap = "10px";
    card.style.transition = "all 0.5s ease";
    card.style.opacity = "1";
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="flex:1; font-weight:bold; color:black;">${task.text}</span>
        <button class="nav-btn" style="padding:6px 12px; background:${task.done ? "#059669" : "#b91c1c"}; border-radius: 8px; color:white;">
          ${task.done ? "✅ خلصنا" : "❌ اضغط"}
        </button>
      </div>
      <div style="display:flex; justify-content: flex-end; gap:20px; border-top: 1px solid rgba(0,0,0,0.05); padding-top:8px;">
         <span style="cursor:pointer; font-size:13px; color: #00932f;" onclick="editTodo(${index})">تعديل</span>
         <span style="cursor:pointer; font-size:13px; color: #ff0000;" onclick="deleteTodo(${index})">حذف</span>
      </div>
    `;
    card.querySelector("button").onclick = () => {
      card.style.opacity = "0";
      card.style.transform = "translateX(20px)";
      setTimeout(() => {
        todoTasks[index].done = !todoTasks[index].done;
        saveTodo();
        openTodoSection();
      }, 400);
    };
    if (task.done) doneWrapper.appendChild(card);
    else pendingWrapper.appendChild(card);
  });
  listDiv.append(hDone, doneWrapper, hPending, pendingWrapper);
}

function saveTodo() {
  localStorage.setItem("myTodoTasks", JSON.stringify(todoTasks));
}
function deleteTodo(index) {
  if (confirm("هل تريد حذف هذا البوست؟")) {
    todoTasks.splice(index, 1);
    saveTodo();
    openTodoSection();
  }
}
function editTodo(index) {
  const newT = prompt("تعديل البوست:", todoTasks[index].text);
  if (newT && newT.trim() !== "") {
    todoTasks[index].text = newT.trim();
    saveTodo();
    openTodoSection();
  }
}

function openSection(mode) {
  const listDiv = document.getElementById("azkarList");
  const title = document.getElementById("overlayMainTitle");
  listDiv.innerHTML = "";
  const titles = { qa: "سؤال وجواب", quran: "رسائل قرآنية", msg: "الرسائل" };
  title.innerText = titles[mode];
  const tabContainer = document.createElement("div");
  tabContainer.style.display = "flex";
  tabContainer.style.gap = "10px";
  tabContainer.style.marginBottom = "15px";
  const btnMain = document.createElement("button");
  btnMain.className = "nav-btn";
  btnMain.style.flex = "1";
  btnMain.innerText = "الأساسية";
  const btnCustom = document.createElement("button");
  btnCustom.className = "nav-btn";
  btnCustom.style.flex = "1";
  btnCustom.innerText = "إضافاتي";
  tabContainer.append(btnMain, btnCustom);
  listDiv.appendChild(tabContainer);
  const addBtn = document.createElement("button");
  addBtn.className = "nav-btn";
  addBtn.style.width = "100%";
  addBtn.style.marginBottom = "15px";
  addBtn.style.backgroundColor = "#059669";
  addBtn.innerText = "إضافة جديد +";
  addBtn.onclick = () => handleAddDynamic(mode);
  listDiv.appendChild(addBtn);
  const itemsWrapper = document.createElement("div");
  listDiv.appendChild(itemsWrapper);
  const render = (isMain) => {
    itemsWrapper.innerHTML = "";
    btnMain.style.opacity = isMain ? "1" : "0.5";
    btnCustom.style.opacity = isMain ? "0.5" : "1";
    let data;
    if (mode === "qa") data = isMain ? baseQA : myQA;
    else if (mode === "quran") data = isMain ? baseQuran : myQuran;
    else data = isMain ? baseMsgs : myMsgs;
    data.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "dhikr-item";
      card.style.display = "flex";
      card.style.justifyContent = "space-between";
      const content = document.createElement("div");
      content.style.flex = "1";
      if (mode === "qa")
        content.innerHTML = `<b style="color:var(--main-color-1);">س: ${item.q}</b><br><small>ج: ${item.a}</small>`;
      else content.innerText = item;
      card.appendChild(content);
      if (!isMain) {
        const editBtn = document.createElement("button");
        editBtn.innerText = "✏️";
        editBtn.style.background = "none";
        editBtn.style.border = "none";
        editBtn.onclick = () => handleEditDynamic(mode, index);
        card.appendChild(editBtn);
      }
      itemsWrapper.appendChild(card);
    });
  };
  btnMain.onclick = () => render(true);
  btnCustom.onclick = () => render(false);
  render(true);
}

function handleAddDynamic(mode) {
  if (mode === "qa") {
    const q = prompt("أدخل السؤال:");
    const a = prompt("أدخل الإجابة:");
    if (q && a) {
      myQA.push({ q, a });
      localStorage.setItem("customQA", JSON.stringify(myQA));
    }
  } else {
    const txt = prompt("أدخل النص:");
    if (txt) {
      if (mode === "quran") {
        myQuran.push(txt);
        localStorage.setItem("customQuran", JSON.stringify(myQuran));
      } else {
        myMsgs.push(txt);
        localStorage.setItem("customMsgs", JSON.stringify(myMsgs));
      }
    }
  }
  openSection(mode);
}

function handleEditDynamic(mode, index) {
  if (mode === "qa") {
    const newQ = prompt("تعديل السؤال:", myQA[index].q);
    const newA = prompt("تعديل الإجابة:", myQA[index].a);
    if (newQ && newA) {
      myQA[index] = { q: newQ, a: newA };
      localStorage.setItem("customQA", JSON.stringify(myQA));
    }
  } else {
    let arr = mode === "quran" ? myQuran : myMsgs;
    const newTxt = prompt("تعديل النص:", arr[index]);
    if (newTxt) {
      arr[index] = newTxt;
      localStorage.setItem(
        mode === "quran" ? "customQuran" : "customMsgs",
        JSON.stringify(arr),
      );
    }
  }
  openSection(mode);
}

function openOverlay(type) {
  const listDiv = document.getElementById("azkarList");
  const title = document.getElementById("overlayMainTitle");
  listDiv.innerHTML = "";
  const isAzkar = type === "azkar";
  title.innerText = isAzkar ? "الأذكار" : "الأدعية";
  const tabContainer = document.createElement("div");
  tabContainer.style.display = "flex";
  tabContainer.style.gap = "10px";
  tabContainer.style.marginBottom = "15px";
  const btnMain = document.createElement("button");
  btnMain.className = "nav-btn";
  btnMain.style.flex = "1";
  btnMain.innerText = "الأساسية";
  const btnCustom = document.createElement("button");
  btnCustom.className = "nav-btn";
  btnCustom.style.flex = "1";
  btnCustom.innerText = "إضافاتي";
  tabContainer.append(btnMain, btnCustom);
  listDiv.appendChild(tabContainer);
  const addBtn = document.createElement("button");
  addBtn.className = "nav-btn";
  addBtn.style.width = "100%";
  addBtn.style.marginBottom = "15px";
  addBtn.style.backgroundColor = "#059669";
  addBtn.innerText = "إضافة جديد +";
  addBtn.onclick = () => {
    handleAddNewItem(type);
    openOverlay(type);
  };
  listDiv.appendChild(addBtn);
  const itemsWrapper = document.createElement("div");
  listDiv.appendChild(itemsWrapper);
  const render = (isMain) => {
    itemsWrapper.innerHTML = "";
    btnMain.style.opacity = isMain ? "1" : "0.5";
    btnCustom.style.opacity = isMain ? "0.5" : "1";
    let data = isMain
      ? isAzkar
        ? dhikrList
        : doaaList
      : isAzkar
        ? savedAzkar
        : savedDoaa;
    data.forEach((text, index) => {
      const card = document.createElement("div");
      card.className = "dhikr-item";
      card.style.display = "flex";
      card.style.justifyContent = "space-between";
      const span = document.createElement("span");
      span.innerText = text;
      span.style.flex = "1";
      span.onclick = () => {
        if (isAzkar) selectDhikr(text);
        else showToast("❤️ للقراءة ❤️");
      };
      card.appendChild(span);
      if (!isMain) {
        const editBtn = document.createElement("button");
        editBtn.innerText = "✏️";
        editBtn.style.background = "none";
        editBtn.style.border = "none";
        editBtn.onclick = (e) => {
          e.stopPropagation();
          handleEditItem(type, index);
        };
        card.appendChild(editBtn);
      }
      itemsWrapper.appendChild(card);
    });
  };
  btnMain.onclick = () => render(true);
  btnCustom.onclick = () => render(false);
  render(true);
  document.getElementById("azkarOverlay").style.display = "flex";
}

function handleEditItem(type, index) {
  const currentList = type === "azkar" ? savedAzkar : savedDoaa;
  const newTxt = prompt("تعديل النص:", currentList[index]);
  if (newTxt && newTxt.trim() !== "") {
    currentList[index] = newTxt.trim();
    localStorage.setItem(
      type === "azkar" ? "myAzkarList_V3" : "myDoaaList_V3",
      JSON.stringify(currentList),
    );
    openOverlay(type);
  }
}

function selectDhikr(text) {
  activeDhikrText = text;
  activeDhikrLabel.innerText = text;
  localStorage.setItem("activeDhikr", text);
  closeAzkar();
}

function handleStart(e) {
  if (e) e.preventDefault();
  countBtn.classList.add("is-active");
  count++;
  totalHasanat++;
  display.innerText = count;
  hasanatDisplay.innerText = formatHasanat(totalHasanat);
  updateLevel();
  localStorage.setItem("tasbihCount", count);
  localStorage.setItem("totalHasanat", totalHasanat);
  if (isChildMode && count > 0 && count % 10 === 0) triggerCelebration();
}

function handleEnd() {
  countBtn.classList.remove("is-active");
}

function triggerCelebration() {
  cheerSound.currentTime = 0;
  cheerSound.play();
  setTimeout(() => cheerSound.pause(), 4000);
  for (let i = 0; i < 40; i++) createConfetti();
}

function createConfetti() {
  const c = document.createElement("div");
  c.className = "confetti";
  c.style.left = Math.random() * 100 + "vw";
  c.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
  c.style.animationDuration = Math.random() * 1 + 2 + "s";
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 3000);
}

function toggleChildMode() {
  isChildMode = !isChildMode;
  modeEmoji.innerText = isChildMode ? "🧔🏻" : "👶🏻";
  if (isChildMode) startFruitRain();
  else stopFruitRain();
}

function startFruitRain() {
  if (fruitInterval) return;
  fruitInterval = setInterval(() => {
    const f = document.createElement("div");
    f.className = "fruit-drop";
    f.innerText = fruits[Math.floor(Math.random() * fruits.length)];
    f.style.left = Math.random() * 100 + "vw";
    const dur = Math.random() * 2 + 3;
    f.style.setProperty("--duration", dur + "s");
    document.body.appendChild(f);
    setTimeout(() => f.remove(), dur * 1000);
  }, 500);
}

function stopFruitRain() {
  clearInterval(fruitInterval);
  fruitInterval = null;
}

function handleResetStart(e) {
  if (e) e.preventDefault();
  resetBtn.classList.add("is-active");
  count = 0;
  display.textContent = count;
  localStorage.setItem("tasbihCount", count);
}
function handleResetEnd() {
  resetBtn.classList.remove("is-active");
}

countBtn.addEventListener("touchstart", handleStart, { passive: false });
countBtn.addEventListener("touchend", handleEnd);
countBtn.addEventListener("mousedown", (e) => {
  if (!("ontouchstart" in window)) handleStart(e);
});
window.addEventListener("mouseup", handleEnd);

resetBtn.addEventListener("touchstart", handleResetStart, { passive: false });
resetBtn.addEventListener("touchend", handleResetEnd);
resetBtn.addEventListener("mousedown", (e) => {
  if (!("ontouchstart" in window)) handleResetStart(e);
});
window.addEventListener("mouseup", handleResetEnd);

function handleAddNewItem(type) {
  const promptText =
    type === "azkar" ? "أدخل الذكر الجديد:" : "أدخل الدعاء الجديد:";
  const newTxt = prompt(promptText);
  if (newTxt && newTxt.trim() !== "") {
    if (type === "azkar") {
      savedAzkar.push(newTxt.trim());
      localStorage.setItem("myAzkarList_V3", JSON.stringify(savedAzkar));
    } else {
      savedDoaa.push(newTxt.trim());
      localStorage.setItem("myDoaaList_V3", JSON.stringify(savedDoaa));
    }
    showToast("تمت الإضافة");
  }
}

function changeColor(c1, c2, save = true) {
  document.documentElement.style.setProperty("--main-color-1", c1);
  document.documentElement.style.setProperty("--main-color-2", c2);

  // تحديث لون شريط التقدم ليتناسب مع لون السبحة
  const bar = document.getElementById("levelProgressBar");
  if (bar) bar.style.background = "#fff"; // الشريط يظل أبيض ليكون واضحاً على الخلفية الملونة أو الشفافة

  if (save) localStorage.setItem("themeColors", JSON.stringify({ c1, c2 }));
}

function applyTheme(dark) {
  if (dark) {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeToggle.textContent = "🌙";
  }
}

themeToggle.addEventListener("click", () => {
  isDark = !isDark;
  applyTheme(isDark);
  localStorage.setItem("isDark", isDark);
});
menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  colorMenu.classList.toggle("active");
});
document.addEventListener("click", () => colorMenu.classList.remove("active"));
function closeAzkar() {
  document.getElementById("azkarOverlay").style.display = "none";
}

init();
