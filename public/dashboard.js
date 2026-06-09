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