document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("navbar-container");

  if (!container) return;

  fetch("navbar.html")
    .then(response => response.text())
    .then(data => {
      container.innerHTML = data;
      loadProfileData();
      applySavedTheme();
    });
});

function toggleSidebar(event) {
  event.preventDefault();
  event.stopPropagation();

  const sidebar = document.getElementById("sidebar");

  if (sidebar) {
    sidebar.classList.toggle("active");
  }
}

window.toggleSidebar = toggleSidebar;

document.addEventListener("click", function(event) {
  const sidebar = document.getElementById("sidebar");
  const menuIcon = document.querySelector(".menu-icon");

  if (
    sidebar &&
    sidebar.classList.contains("active") &&
    !sidebar.contains(event.target) &&
    !menuIcon.contains(event.target)
  ) {
    sidebar.classList.remove("active");
  }
});

function toggleSearch(event) {
  event.preventDefault();
  event.stopPropagation();

  const searchBox = document.getElementById("searchBox");
  const searchInput = document.getElementById("searchInput");

  if (searchBox) {
    searchBox.classList.toggle("active");
    if (searchBox.classList.contains("active") && searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }
}
window.toggleSearch = toggleSearch;

function toggleProfilePopup(event) {
  event.preventDefault();
  event.stopPropagation();

  const popup = document.getElementById("profilePopup");
  if (popup) popup.classList.toggle("active");
}
window.toggleProfilePopup = toggleProfilePopup;

function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  const switchText = document.querySelector(".switch-text");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
    if (switchText) switchText.textContent = "DARK";
  } else {
    localStorage.setItem("theme", "light");
    if (switchText) switchText.textContent = "LIGHT";
  }
}
window.toggleTheme = toggleTheme;

function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  const switchText = document.querySelector(".switch-text");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (switchText) switchText.textContent = "DARK";
  } else {
    document.body.classList.remove("dark-mode");
    if (switchText) switchText.textContent = "LIGHT";
  }
}

function loadProfileData() {
  const studentName = localStorage.getItem("studentName") || "Student";
  const loginEmail = localStorage.getItem("loginEmail") || "student@email.com";
  const profileImage = localStorage.getItem("profileImage");

  const popupName = document.getElementById("popupStudentName");
  const popupEmail = document.getElementById("popupStudentEmail");
  const popupImage = document.getElementById("popupProfileImage");
  const navbarProfile = document.getElementById("navbarProfile");

  if (popupName) popupName.textContent = studentName;
  if (popupEmail) popupEmail.textContent = loginEmail;

  if (profileImage) {
    if (popupImage) popupImage.src = profileImage;
    if (navbarProfile) navbarProfile.src = profileImage;
  }
}

function logout() {
  localStorage.removeItem("loginEmail");
  localStorage.removeItem("studentName");
  localStorage.removeItem("profileImage");

  window.location.href = "student-index.html";
}
window.logout = logout;

function toggleDropdown(event, menuId) {
  event.preventDefault();
  event.stopPropagation();

  const menu = document.getElementById(menuId);

  document.querySelectorAll(".mega-menu").forEach(item => {
    if (item.id !== menuId) item.classList.remove("active");
  });

  if (menu) menu.classList.toggle("active");
}
window.toggleDropdown = toggleDropdown;

const collegeData = [
  { name: "IT Lab", type: "Lab", location: "B Block → 2nd Floor → Room 204" },
  { name: "Computer Lab", type: "Lab", location: "C Block → Ground Floor → Room 105" },
  { name: "Classroom IT-A", type: "Classroom", location: "B Block → 3rd Floor → Room 301" },
  { name: "HOD IT Cabin", type: "Faculty Cabin", location: "B Block → 2nd Floor → Near IT Lab" },
  { name: "Principal Office", type: "Office", location: "Admin Block → 1st Floor" },
  { name: "Library", type: "Block", location: "Main Block → Ground Floor" }
];

function searchCollege() {
  const inputBox = document.getElementById("searchInput");
  const resultBox = document.getElementById("searchResults");

  if (!inputBox || !resultBox) return;

  const input = inputBox.value.toLowerCase().trim();
  resultBox.innerHTML = "";

  if (input === "") return;

  const results = collegeData.filter(item =>
    item.name.toLowerCase().includes(input) ||
    item.type.toLowerCase().includes(input) ||
    item.location.toLowerCase().includes(input)
  );

  if (results.length === 0) {
    resultBox.innerHTML = `
      <div class="result-card">
        <h4>No result found</h4>
        <p>Try searching IT Lab, Classroom, Principal, Library, B Block</p>
      </div>
    `;
    return;
  }

  results.forEach(item => {
    resultBox.innerHTML += `
      <div class="result-card">
        <h4>${item.name}</h4>
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Location:</strong> ${item.location}</p>
      </div>
    `;
  });
}
window.searchCollege = searchCollege;

document.addEventListener("click", function (event) {
  const sidebar = document.getElementById("sidebar");
  const searchBox = document.getElementById("searchBox");
  const popup = document.getElementById("profilePopup");
  const profileBtn = document.querySelector(".profile-pill");

  if (
    sidebar &&
    sidebar.classList.contains("active") &&
    !sidebar.contains(event.target) &&
    !event.target.classList.contains("menu-icon")
  ) {
    sidebar.classList.remove("active");
  }

  if (
    searchBox &&
    searchBox.classList.contains("active") &&
    !searchBox.contains(event.target) &&
    !event.target.classList.contains("fa-magnifying-glass")
  ) {
    searchBox.classList.remove("active");
  }

  if (
    popup &&
    popup.classList.contains("active") &&
    !popup.contains(event.target) &&
    profileBtn &&
    !profileBtn.contains(event.target)
  ) {
    popup.classList.remove("active");
  }

  document.querySelectorAll(".mega-menu").forEach(menu => {
    if (!menu.contains(event.target)) menu.classList.remove("active");
  });
});

window.addEventListener("scroll", function () {
  const searchBox = document.getElementById("searchBox");
  if (searchBox) searchBox.classList.remove("active");
});