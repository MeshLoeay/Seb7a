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

const defaultAzkar = [
  "لا إله إلا أنت سبحانك إني كنت من الظالمين",
  "الحمد لله كما ينبغي لجلال وجهك وعظيم سلطانك",
  "لا حول ولا قوة إلا بالله العلي العظيم",
  "سبحان الله وبحمده عدد خلقه ورضا نفسه وزنه عرشه و مداد كلماته",
  "سبحان الله وبحمده سبحان الله العظيم",
  "حسبى الله لا اله الا هو عليه توكلت و هو رب العرش العظيم",
  "أشهد أن لا اله الا الله وحده لا شريك له له الملك و له الحمد و هو على كل شئ قدير",
  "أستغفر الله الذى لا اله الا هو الحى القيوم عدد خلقه و رضا نفسه وزنه عرشه ومداد كلماته",
  "صل الله على محمد صلى الله عليه و سلم عليه الصلاه و السلام",
  "أشهد أن لا إله إلا الله، وأشهد أن محمدًا عبده ورسوله",
  "لا اله الا الله وحده لا شريك له له الملك و له الحمد و هو على كل شئ قدير",
  "استغفر الله",
  "استغفر الله العظيم",
  "سبحان الله",
  "الحمد لله",
  "لا حول ولا قوه الا بالله",
  "لا اله الا الله",
  "الله اكبر",
];

const defaultDoaa = [
  `رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ`,
  "دعاء طلب البركة: يَا رَبّ، إِنِّي أَسْأَلُكَ بَرَكَةً مِنْك، بَرَكَةً فِي عُمْرِي، بَرَكَةً لِي فِي أَهْلِي، بَرَكَةً فِي وَقْتِي، بَرَكَةً فِي الجُهْدِ، بَرَكَةً فِي العِلْمِ، بَرَكَةً فِي العَمَلِ، بَرَكَةً فِي الجَسَدِ، بَرَكَةً فِي الرِّزْقِ، وَارْقُزْنِي وَوَسِّعْ لِي فِي رِزْقِي يَا رَبّ. (3 مرات)",
  "دعاء السَّتْر: اللَّهُمَّ اسْتُرْنَا بِسِتْرِكَ الجَمِيلِ الَّذِي سَتَرْتَ بِهِ نَفْسَكَ فَلَا عَيْنٌ تَرَاك، وَلَا تَفْضَحْنَا بَيْنَ خَلْقِكَ وَلَا تُخْزِنِي يَوْمَ يُبْعَثُون، اللَّهُمَّ أَعْلَا فَضْلِكَ كَلِمَةَ الحَقِّ وَالدِّين، اللَّهُمَّ اسْتُرْنَا فَوْقَ الأَرْضِ وَتحت الأَرْضِ وَيَوْمَ العَرْضِ. (3 مرات)",
  "دعاء الحَاجَةِ وَالفَتْح: اللَّهُمَّ افْتَحْ بَيْنِي وَ بَيْنَ رِزْقِي وَنَصِيبِي وَسَعَادَتِي فَتْحًا مُبِينًا وَأَنْتَ خَيْرُ الفَاتِحِين، اللَّهُمَّ ارْزُقْنِي وَ وَسِّعْ لِي فِي رِزْقِي، وَارْقُزْنِي رِزْقًا وَاسِعًا عَاجِلًا يَا رَبّ، اللَّهُمَّ يَا مُسَخِّرَ الأَقْدَارِ سَخِّرْ لِي قَدْرًا يَلِيقُ بِكَرَمِكَ فَتُبْهِرُنِي بِعَطَائِكَ فِي الدُّنْيَا وَالآخِرَةِ. (3 مرات)",
  "دعاء المُعْجِزَات: اللَّهُمَّ أَرِنِي عَجَائِبَ صُنْعِكَ فِي دُعَائِي، وَأَرِنِي لُطْفَكَ وَرَحْمَتَكَ فِي قَضَاءِ حَوائِجِي، وَأَرِنِي كَرَمَكَ وَ قُدْرَتَكَ فِي مَا تَعَلَّقَ بِهِ قَلْبِي، افْتَحْ لِي بَابًا يَا اللهُ ظَنَنْتُ مِن يَأْسِي أَنَّهُ لَنْ يُفْتَح، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رِزْقِكَ وَتَوْفِيقِك، وَاسْتَجِبْ لِي دُعَائِي وَوَسِّعْ لِي فِي رِزْقِي وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه. (3 مرات)",
  "دعاء الرزق: اللَّهُمَّ إِنْ كَانَ رِزْقُنَا فِي السَّمَاءِ فَأَنْزِلْهُ، وَإِنْ كَانَ فِي الْأَرْضِ فَأَخْرِجْهُ، وَإِنْ كَانَ مُعَسَّراً فَيَسِّرْهُ، وَإِنْ كَانَ بَعِيداً فَقَرِّبْهُ، وَإِنْ كَانَ حَرَاماً فَطَهِّرْهُ، وَإِنْ كَانَ قَلِيلاً فَكَثِّرْهُ، وَإِنْ كَانَ مَعْدُوماً فَأَوْجِدْهُ، وَإِنْ كَانَ مَوْقُوفاً فَأَجْرِهِ، وَإِنْ كَانَ ذَنْباً فَاغْفِرْهُ، وَإِنْ كَانَ سَيِّئَةً فَامْحُهَا، وَإِنْ كَانَ خَطِيئَةً فَتَجَاوَزْ عَنْهَا، وَإِنْ كَانَ عَسْرَةً فَأَقِلْهَا، وَبَارِكْ لَنَا فِي جَمِيعِ ذَلِكَ، إِنَّكَ مَلِيكٌ مُقْتَدِرٌ.",
  "دعاء لقضاء مصلحة متعسرة: اللهم أنت لها ولكل حاجة، ولا يعجزك أمر في الأرض ولا في السماء، اللهم اقضِ حوائجي كلها، ما ظهر منها وما بطن، يسّر لي أمري وبدّد صعوباته، افتح لي يا الله أبواب رحمتك وفضلك وتوفيقك، واجعل لي من كل ضيق مخرجاً ومن كل هم فرجاً.",
  "ربِّ هب لي: اللهم هب لي ملكاً يليق بكرمك، ووجاهة ترفع بها قدري، ومالاً طيباً واسعاً، وتسخيراً عجيباً يدهشني بلطفه، وعوناً لا ينقطع، اجعلني في كنفك محاطاً برحمتك مُسدَّد الخطى بك.",
  "يغفر لك 70 ألف ملك: هو الله الذي لا إله إلا هو عالم الغيب والشهادة هو الرحمن الرحيم، هو الله الذي لا إله إلا هو الملك القدوس السلام المؤمن المهيمن العزيز الجبار المتكبر سبحان الله عما يشركون، هو الله الخالق البارئ المصور له الأسماء الحسنى يسبح له ما في السماوات والأرض وهو العزيز الحكيم.",
  "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
  "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
  "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
  "يا رب سامحني حين أسجد وبالي منشغل، وسامحني حين أتوب وأعود للذنب، فليس لي ملجأ غيرك يالله",
  "يا رب ان ضل قلبى فقلبى انت تعرفه و ان كان ذنبى عظيما انت غفار",
  "اللهم انك عفو كريم تحب العفو فاعفو عنى",
  "اللهم اعني علي ذكرك وشكرك حسن عبادتك",
  "اللهم دبر لى امرى فإنى لا أحسن التدبير",
  "اللهم ييسر لى ولا تعسر لى",
  "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ",
  "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام",
  "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله، ولا تكلني إلى نفسي طرفة عين",
  "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
  "اللهم إني عبدك وابن عبدك وابن أمتك ناصيتي بيدك ماض في حكمك عدل في قضاؤك، أسألك بكل اسم هو لك سميت به نفسك أو علمته أحداً من خلقك، أو أنزلته في كتابك، أو استأثرت به في علم الغيب عندك، أن تجعل القرآن ربيع قلبي ونور صدري جلاء حزني وذهاب همي",
  "اللهم رحمتك أرجو، فلا تكلني إلى نفسي طرفة عين، وأصلح لي شأني كله لا إله إلا أنت",
  "لا إله إلا الله العظيم الحليم، لا إله إلا الله رب السموات والأرض ورب العرش العظيم",
  "الله الله ربي لا أشرك به شيئاً",
  "لا إله إلا أنت سبحانك إني كنت من الظالمين",
  "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ.",
  "اللَّهُمَّ اسْتَوْدَعْنَاكَ أَرْوَاحَنَا وَأَنْفُسَنَا، وَأَهْلَنَا وَأَقَارِبَنَا وَأَصْدِقَاءَنَا وَمَنْ نُحِبُّ، يَا مَنْ لَا تَضِيعُ لَدَيْهِ الْوَدَائِعُ.",
  "اللَّهُمَّ إِنَّا عَلِمْنَا أَنَّهُ مَعَ الْعُسْرِ يُسْرًا، وَأَنَّهُ مَعَ الشِّدَّةِ الْفَرَجُ، وَأَنَّكَ مُبَدِّلُ الْأَحْوَالِ. اللَّهُمَّ مِنْ حَالٍ إِلَى حَالٍ، رَبِّي إِنَّكَ تَرَانَا وَتَعْلَمُ بِحَالِنَا، فَأَبْدِلْ عُسْرَنَا يُسْرًا، وَأَبْدِلْ شِدَّتَنَا بِفَرَجٍ قَرِيبٍ.",
  "اللهم يا مقلب القلوب ثبت قلبي على دينك",
  "اللهم يا مصرف القلوب صرف قلوبنا على طاعتك",
  "اللهم اغننا بحلالك عن حرامك وبفضلك عمن سواك",
  "اللهم جنبنا الفتن ما ظهر منها وما بطن",
  "اللهم إني أسألك الهدى والتقى والعفاف والغنى",
  "اللهم إني أسألك العلم والإيمان والإحسان والحكمة",
  "اللهم أسألك حسن الخاتمة",
  "اللهم أسألك الفردوس الأعلى",
  "اللهم أسألك لذة النظر لوجهك الكريم",
  "اللهم ألهمني رشدي وقني شر نفسي",
  "اللهم اغفر لي وارحمني وعافني وارزقني",
  "رب لا تذرني فرداً وأنت خير الوارثين",
];

let savedAzkar = JSON.parse(localStorage.getItem("myAzkarList_V3")) || [];
let savedDoaa = JSON.parse(localStorage.getItem("myDoaaList_V3")) || [];

let dhikrList = [...new Set([...defaultAzkar, ...savedAzkar])];
let doaaList = [...new Set([...defaultDoaa, ...savedDoaa])];

// الوظائف
function formatHasanat(num) {
  return num.toLocaleString();
}

function init() {
  display.innerText = count;
  hasanatDisplay.innerText = formatHasanat(totalHasanat);
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

function openOverlay(type) {
  const listDiv = document.getElementById("azkarList");
  const title = document.getElementById("overlayMainTitle");
  listDiv.innerHTML = "";

  if (type === "doaa") {
    const infoBar = document.createElement("div");
    infoBar.className = "info-bar-style";
    infoBar.innerText = "⚠️ الأدعية للقراءة داخل الصفحه";
    listDiv.appendChild(infoBar);
  }

  const list = type === "azkar" ? dhikrList : doaaList;
  title.innerText = type === "azkar" ? "الأذكار" : "الأدعية";

  list.forEach((text) => {
    const item = document.createElement("div");
    item.className = "dhikr-item";
    item.innerText = text;

    item.onclick = () => {
      if (type === "azkar") {
        selectDhikr(text);
      } else {
        showToast("❤️ الدعاء للقراءة ❤️");
      }
    };
    listDiv.appendChild(item);
  });
  document.getElementById("azkarOverlay").style.display = "flex";
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
  localStorage.setItem("tasbihCount", count);
  localStorage.setItem("totalHasanat", totalHasanat);
  if (isChildMode && count > 0 && count % 10 === 0) triggerCelebration();
}

function triggerCelebration() {
  cheerSound.currentTime = 0;
  cheerSound.play();
  setTimeout(() => {
    cheerSound.pause();
  }, 4000);
  for (let i = 0; i < 40; i++) {
    createConfetti();
  }
}

function createConfetti() {
  const c = document.createElement("div");
  c.className = "confetti";
  c.style.left = Math.random() * 100 + "vw";
  c.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
  c.style.animationDuration = Math.random() * 1 + 2 + "s";
  document.body.appendChild(c);
  setTimeout(() => {
    c.remove();
  }, 3000);
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

// الـ Event Listeners
countBtn.addEventListener("touchstart", handleStart, { passive: false });
countBtn.addEventListener("touchend", () =>
  countBtn.classList.remove("is-active"),
);
countBtn.addEventListener("mousedown", (e) => {
  if (!("ontouchstart" in window)) handleStart(e);
});
window.addEventListener("mouseup", () =>
  countBtn.classList.remove("is-active"),
);

resetBtn.addEventListener("touchstart", handleResetStart, { passive: false });
resetBtn.addEventListener("touchend", () =>
  resetBtn.classList.remove("is-active"),
);
resetBtn.addEventListener("mousedown", (e) => {
  if (!("ontouchstart" in window)) handleResetStart(e);
});
window.addEventListener("mouseup", () =>
  resetBtn.classList.remove("is-active"),
);

function showAddOptions() {
  document.getElementById("addModal").style.display = "block";
}
function hideAddOptions() {
  document.getElementById("addModal").style.display = "none";
}

function handleAddNewItem(type) {
  const promptText =
    type === "azkar" ? "أدخل الذكر الجديد:" : "أدخل الدعاء الجديد:";
  const newTxt = prompt(promptText);
  if (newTxt && newTxt.trim() !== "") {
    if (type === "azkar") {
      if (!dhikrList.includes(newTxt.trim())) {
        dhikrList.push(newTxt.trim());
        savedAzkar.push(newTxt.trim());
        localStorage.setItem("myAzkarList_V3", JSON.stringify(savedAzkar));
      }
    } else {
      if (!doaaList.includes(newTxt.trim())) {
        doaaList.push(newTxt.trim());
        savedDoaa.push(newTxt.trim());
        localStorage.setItem("myDoaaList_V3", JSON.stringify(savedDoaa));
      }
    }
  }
  hideAddOptions();
}

function changeColor(c1, c2, save = true) {
  document.documentElement.style.setProperty("--main-color-1", c1);
  document.documentElement.style.setProperty("--main-color-2", c2);
  if (save) localStorage.setItem("themeColors", JSON.stringify({ c1, c2 }));
  colorMenu.classList.remove("active");
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

// أضف هذا داخل دالة toggleChildMode
document.querySelector(".hanging-lantern").style.transform = isChildMode
  ? "scale(1.5)"
  : "scale(1)";
