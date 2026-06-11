fetch("navbar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar-container").innerHTML = data;
  });
  function toggleSearch(event){

   event.stopPropagation();

   document
   .getElementById("searchBox")
   .classList.toggle("active");
}
function initializeNavbar() {
  const savedTheme = localStorage.getItem("theme");
  if(savedTheme === "dark"){
    document.body.classList.add("dark-mode");
    const switchText = document.querySelector(".switch-text");
    if(switchText){
      switchText.textContent = "DARK";
    }
  }
}

/* SIDEBAR */
function toggleSidebar(event){
  event.preventDefault();
  event.stopPropagation();
  const sidebar = document.getElementById("sidebar");
  if(sidebar){
    sidebar.classList.toggle("active");
  }
}
window.toggleSidebar = toggleSidebar;

/* THEME */
function toggleTheme(){
  const switchText =
    document.querySelector(".switch-text");
  document.body.classList.toggle("dark-mode");
  if(document.body.classList.contains("dark-mode")){
    localStorage.setItem("theme", "dark");
    if(switchText){
      switchText.textContent = "DARK";
    }
  } else {
    localStorage.setItem("theme", "light");
    if(switchText){
      switchText.textContent = "LIGHT";
    }
  }
}
window.toggleTheme = toggleTheme;

/* DROPDOWN */
function toggleDropdown(event, menuId){

  event.preventDefault();
  event.stopPropagation();

  const menu = document.getElementById(menuId);

  document.querySelectorAll(".mega-menu").forEach(item => {

    if(item.id !== menuId){
      item.classList.remove("active");
    }
  });

  if(menu){
    menu.classList.toggle("active");
  }
}

window.toggleDropdown = toggleDropdown;

/* CLICK OUTSIDE */
document.addEventListener("click", function(event){

  const sidebar =
    document.getElementById("sidebar");

  const popup =
    document.getElementById("profilePopup");

  const searchBox =
    document.getElementById("searchBox");

  if(
    sidebar &&
    !sidebar.contains(event.target) &&
    !event.target.classList.contains("menu-icon")
  ){
    sidebar.classList.remove("active");
  }

  if(
    popup &&
    !popup.contains(event.target) &&
    !event.target.classList.contains("profile-pill")
  ){
    popup.classList.remove("active");
  }

  if(
    searchBox &&
    !searchBox.contains(event.target) &&
    !event.target.classList.contains("fa-magnifying-glass")
  ){
    searchBox.classList.remove("active");
  }

  document.querySelectorAll(".mega-menu").forEach(menu => {
    menu.classList.remove("active");
  });

});
/* SEARCH POPUP */
function toggleSearch(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const searchBox = document.getElementById("searchBox");
  const searchInput = document.getElementById("searchInput");

  if (searchBox) {
    searchBox.classList.toggle("active");

    if (searchBox.classList.contains("active") && searchInput) {
      setTimeout(() => {
        searchInput.focus();
      }, 100);
    }
  }
}

window.toggleSearch = toggleSearch;
window.addEventListener("scroll", function () {
  const searchBox = document.getElementById("searchBox");

  if (searchBox && searchBox.classList.contains("active")) {
    searchBox.classList.remove("active");
  }
});
/* PROFILE POPUP */
function toggleProfilePopup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const popup = document.getElementById("profilePopup");

  if (popup) {
    popup.classList.toggle("active");
  }
}
window.toggleProfilePopup = toggleProfilePopup;

/* DARK MODE */
function toggleTheme() {
  const switchText = document.querySelector(".switch-text");

  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
    if (switchText) switchText.textContent = "DARK";
  } else {
    localStorage.setItem("theme", "light");
    if (switchText) switchText.textContent = "LIGHT";
  }
}
window.toggleTheme = toggleTheme;

/* LOGOUT */
function logout() {

  localStorage.removeItem("loginEmail");
  localStorage.removeItem("studentName");
  localStorage.removeItem("profileImage");
  localStorage.removeItem("theme");

  window.location.href = "index.html";
}

window.logout = logout;

/*SIDE BAR*/

function toggleSidebar(event){
  event.preventDefault();
  event.stopPropagation();

  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("active");
}

window.toggleSidebar = toggleSidebar;
/* CLICK OUTSIDE CLOSE */
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
});

/* SEARCH DATA */
const collegeData = [
  {
    name: "IT Lab",
    type: "Lab",
    location: "B Block → 2nd Floor → Room 204"
  },
  {
    name: "Computer Lab",
    type: "Lab",
    location: "C Block → Ground Floor → Room 105"
  },
  {
    name: "Classroom IT-A",
    type: "Classroom",
    location: "B Block → 3rd Floor → Room 301"
  },
  {
    name: "HOD IT Cabin",
    type: "Faculty Cabin",
    location: "B Block → 2nd Floor → Near IT Lab"
  },
  {
    name: "Principal Office",
    type: "Office",
    location: "Admin Block → 1st Floor"
  },
  {
    name: "Library",
    type: "Block",
    location: "Main Block → Ground Floor"
  }
];

/* SEARCH FUNCTION */
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

/* PAGE LOAD */
document.addEventListener("DOMContentLoaded", function () {
  startAutoSlider();

  const slider = document.querySelector(".slider");

  if (slider) {
    slider.addEventListener("mouseenter", stopAutoSlider);
    slider.addEventListener("mouseleave", startAutoSlider);
  }

  const studentName =
    localStorage.getItem("studentName") || "Student";

  const welcomeText =
    document.getElementById("welcomeText");

  if (welcomeText) {
    welcomeText.innerHTML = `Hello ${studentName}`;
  }

  const savedTheme =
    localStorage.getItem("theme");

  const switchText =
    document.querySelector(".switch-text");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (switchText) switchText.textContent = "DARK";
  } else {
    document.body.classList.remove("dark-mode");
    if (switchText) switchText.textContent = "LIGHT";
  }

  const loginEmail =
    localStorage.getItem("loginEmail") || "user@email.com";

  const rollNumber =
    localStorage.getItem("rollNumber");

  let studentEmail = loginEmail;

  if (rollNumber) {
    const branchCode =
      rollNumber.substring(5, 7).toLowerCase();

    studentEmail =
      `${rollNumber}@${branchCode}.sreenidhi.edu.in`;
  }

  const profileImage = document.getElementById("profileImage");
  const popupName = document.getElementById("popupStudentName");
  const popupEmail = document.getElementById("popupStudentEmail");
  const popupImage = document.getElementById("popupProfileImage");
  const navbarProfile = document.getElementById("navbarProfile");

  if (popupName) popupName.textContent = studentName;

  if (popupEmail) popupEmail.textContent = studentEmail;

  if (profileImage) {
    if (popupImage) popupImage.src = profileImage;
    if (navbarProfile) navbarProfile.src = profileImage;
  }
});
function toggleDropdown(event, menuId) {

  event.preventDefault();
  event.stopPropagation();

  const menu = document.getElementById(menuId);

  document.querySelectorAll(".mega-menu").forEach(item => {

    if(item.id !== menuId){
      item.classList.remove("active");
    }

  });

  menu.classList.toggle("active");
}

window.toggleDropdown = toggleDropdown;

/* CLICK OUTSIDE CLOSE */
document.addEventListener("click", function () {

  document.querySelectorAll(".mega-menu").forEach(menu => {
    menu.classList.remove("active");
  });

});
function toggleMobileMenu(menuId) {
  const menu = document.getElementById(menuId);

  if (!menu) return;

  menu.classList.toggle("active");
}

window.toggleMobileMenu = toggleMobileMenu;
function toggleSidebar(event){
  event.stopPropagation();
  document.getElementById("sidebar").classList.toggle("active");
}

document.addEventListener("click", function(){
  const sidebar = document.getElementById("sidebar");
  if(sidebar){
    sidebar.classList.remove("active");
  }
});

document.addEventListener("DOMContentLoaded", function(){
  const sidebar = document.getElementById("sidebar");

  if(sidebar){
    sidebar.addEventListener("click", function(event){
      event.stopPropagation();
    });
  }
});