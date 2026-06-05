import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyD_7Cp155ILuZlzdVRk4-pdj9RGlztmkhM",
  authDomain: "student-portal-1baed.firebaseapp.com",
  projectId: "student-portal-1baed",
  storageBucket: "student-portal-1baed.firebasestorage.app",
  messagingSenderId: "1017420453175",
  appId: "1:1017420453175:web:5c9c44f5a68a3e4d5476b2",
  measurementId: "G-T8PCR4Q06B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* LOGIN PROTECTION */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    localStorage.setItem("loginEmail", user.email);
  }
});

/* SIDEBAR */
function toggleSidebar(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const sidebar = document.getElementById("sidebar");

  if (sidebar) {
    sidebar.classList.toggle("active");
  }
}
window.toggleSidebar = toggleSidebar;

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
window.logout = function () {
  signOut(auth).then(() => {
    localStorage.removeItem("loginEmail");
    window.location.href = "index.html";
  });
};

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

/* IMAGE SLIDER */
let currentSlide = 0;

function showSlide(index) {
  const slides = document.querySelectorAll(".slide");

  if (slides.length === 0) return;

  slides.forEach(slide => {
    slide.classList.remove("active");
  });

  slides[index].classList.add("active");
}

function changeSlide(direction) {
  const slides = document.querySelectorAll(".slide");

  if (slides.length === 0) return;

  currentSlide += direction;

  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }

  if (currentSlide < 0) {
    currentSlide = slides.length - 1;
  }

  showSlide(currentSlide);
}
window.changeSlide = changeSlide;

/* AUTO IMAGE SLIDER */
let autoSlideInterval;

function startAutoSlider() {
  stopAutoSlider();

  autoSlideInterval = setInterval(function () {
    changeSlide(1);
  }, 3000);
}

function stopAutoSlider() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
}

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

  const profileImage =
    localStorage.getItem("profileImage");

  const popupName =
    document.getElementById("popupStudentName");

  const popupEmail =
    document.getElementById("popupStudentEmail");

  const popupImage =
    document.getElementById("popupProfileImage");

  const navbarProfile =
    document.getElementById("navbarProfile");

  if (popupName) popupName.textContent = studentName;

  if (popupEmail) popupEmail.textContent = studentEmail;

  if (profileImage) {
    if (popupImage) popupImage.src = profileImage;
    if (navbarProfile) navbarProfile.src = profileImage;
  }
});