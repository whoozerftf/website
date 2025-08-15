// Feather icons
if (window.feather) feather.replace();

// Contact Us Popup
const contactUsBtn = document.getElementById("contactUsBtn");
const contactUsPopup = document.getElementById("contactUsPopup");

if (contactUsBtn && contactUsPopup) {
  contactUsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    contactUsPopup.style.display =
      contactUsPopup.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (
      !contactUsPopup.contains(e.target) &&
      !contactUsBtn.contains(e.target)
    ) {
      contactUsPopup.style.display = "none";
    }
  });
}

// Sidebar toggle
const sidebar = document.getElementById("mobileSidebar");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");

if (openBtn && sidebar) {
  openBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    sidebar.classList.add("active");
  });
}
if (closeBtn && sidebar) {
  closeBtn.addEventListener("click", function () {
    sidebar.classList.remove("active");
  });
}
// Klik di luar sidebar untuk menutup
document.addEventListener("click", function (e) {
  if (
    sidebar &&
    sidebar.classList.contains("active") &&
    !sidebar.contains(e.target) &&
    e.target !== openBtn &&
    !openBtn.contains(e.target)
  ) {
    sidebar.classList.remove("active");
  }
});