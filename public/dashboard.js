import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getMessaging,
  getToken
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

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
const messaging = getMessaging(app);
const vapidKey =
"BHjO5qV1g41Mvrtqk-Jp08v9G7VQ44LpH_KAMZzwMZxpKlYdRrOL4zxDt1_oFGcVT6EJEQM_4WvmVNS-xq-QKnM";
/* ENABLE NOTIFICATION */
async function enableNotifications() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Notification permission denied");
      return;
    }

    const token = await getToken(messaging, {
    vapidKey: vapidKey
  });

    console.log("FCM Token:", token);

    localStorage.setItem("fcmToken", token);

  } catch (error) {
    console.error("Notification error:", error);
  }
}

/* LOGIN PROTECTION */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("index.html");
  } else {
    localStorage.setItem("studentEmail", user.email);
    localStorage.setItem("loginEmail", user.email);
  }
});

/* SIDEBAR */
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

  const slides = document.querySelectorAll(".slide");
  if (slides.length <= 1) return;

  autoSlideInterval = setInterval(() => {
    changeSlide(1);
  }, 3000);
}

function stopAutoSlider() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
}

/* CLOSE EMERGENCY BOX WHEN CLICKING OUTSIDE */

document.addEventListener("click", closeEmergencyBox);
document.addEventListener("touchstart", closeEmergencyBox);

function closeEmergencyBox(event){

  const emergencyBox =
    document.getElementById("emergencyBox");

  const emergencyBtn =
    document.querySelector(".emergency-btn");

  if(
    emergencyBox &&
    emergencyBox.classList.contains("active") &&
    !emergencyBox.contains(event.target) &&
    !emergencyBtn.contains(event.target)
  ){
    emergencyBox.classList.remove("active");
  }
}

/* START SLIDER AFTER PAGE LOAD */
document.addEventListener("DOMContentLoaded", () => {
  showSlide(currentSlide);
  startAutoSlider();
});