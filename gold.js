// دالة التحويل للذهب
function changeToGold() {
  document.body.classList.add("gold-theme");
  localStorage.setItem("selectedTheme", "gold");

  // إخفاء كلمة RESET (بندور على الـ span اللي قبل زرار الريسيت)
  const resetText = document.querySelector(".counter-body span");
  if (resetText) {
    resetText.style.display = "none";
  }

  // إخفاء المنيو
  const colorMenu = document.getElementById("colorMenu");
  if (colorMenu) {
    colorMenu.style.display = "none";
  }
}

// دالة تغيير الألوان العادية
function changeColor(color1, color2) {
  // 1. مسح الثيم الذهبي
  document.body.classList.remove("gold-theme");
  localStorage.removeItem("selectedTheme");

  // 2. إرجاع كلمة RESET للظهور مرة أخرى
  const resetText = document.querySelector(".counter-body span");
  if (resetText) {
    resetText.style.display = "block"; // أو inline حسب تنسيقك
  }

  // 3. تطبيق الألوان العادية
  document.documentElement.style.setProperty("--main-color-1", color1);
  document.documentElement.style.setProperty("--main-color-2", color2);

  // 4. إخفاء المنيو
  const colorMenu = document.getElementById("colorMenu");
  if (colorMenu) {
    colorMenu.style.display = "none";
  }
}
// لفتح المنيو مرة أخرى (تأكد أن زرار 🎨 ينفذ هذه الدالة)
document.getElementById("menuToggle").onclick = function () {
  const colorMenu = document.getElementById("colorMenu");
  if (colorMenu.style.display === "none" || colorMenu.style.display === "") {
    colorMenu.style.display = "grid"; // أو block حسب تصميمك
  } else {
    colorMenu.style.display = "none";
  }
};
