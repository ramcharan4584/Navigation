// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyD_7Cp155ILuZlzdVRk4-pdj9RGlztmkhM",
  authDomain: "student-portal-1baed.firebaseapp.com",
  projectId: "student-portal-1baed",
  storageBucket: "student-portal-1baed.firebasestorage.app",
  messagingSenderId: "1017420453175",
  appId: "1:1017420453175:web:5c9c44f5a68a3e4d5476b2",
  measurementId: "G-T8PCR4Q06B"
};

// INITIALIZE FIREBASE
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

window.addEventListener("DOMContentLoaded", () => {

  // LOGIN PASSWORD TOGGLE
  const togglePassword = document.getElementById("togglePassword");
  const password = document.getElementById("password");

  togglePassword.addEventListener("click", () => {
    const type = password.type === "password" ? "text" : "password";
    password.type = type;

    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");
  });

  // SIGNUP PASSWORD TOGGLE
  const toggleSignupPassword =
    document.getElementById("toggleSignupPassword");

  const signupPassword =
    document.getElementById("signupPassword");

  toggleSignupPassword.addEventListener("click", () => {

    const type =
      signupPassword.type === "password"
        ? "text"
        : "password";

    signupPassword.type = type;

    toggleSignupPassword.classList.toggle("fa-eye");
    toggleSignupPassword.classList.toggle("fa-eye-slash");
  });

  // SIGN IN BUTTON
  const signInBtn = document.querySelector(".signin-btn");

  signInBtn.addEventListener("click", () => {
  const email = document.querySelector('input[type="email"]').value;
  const passwordValue = document.getElementById("password").value;

  if (email === "" || passwordValue === "") {
    alert("Please fill all fields!");
    return;
  }

  auth.signInWithEmailAndPassword(email, passwordValue)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

  // INPUT FOCUS EFFECT
  const inputs = document.querySelectorAll("input");

  inputs.forEach(input => {
    input.addEventListener("focus", () => {
      input.style.border = "2px solid #6c4ccf";
      input.style.boxShadow = "0 0 10px rgba(108,76,207,0.3)";
    });

    input.addEventListener("blur", () => {
      input.style.border = "1px solid #ddd";
      input.style.boxShadow = "none";
    });
  });
});

// FADE-IN ANIMATION
window.addEventListener("load", () => {
  const box = document.querySelector(".login-box");
  box.style.opacity = "1";
  box.style.transform = "translateY(0px)";
});

// GOOGLE LOGIN FUNCTION
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
.then((result) => {

    const user = result.user;

    // SAVE NAME
    localStorage.setItem(
      "studentName",
      user.displayName
    );

    // OPEN DASHBOARD
    window.location.href = "dashboard.html";
});
}
function showSignup() {
  document.querySelector(".signin-btn").style.display = "none";
  document.querySelector(".google-btn").style.display = "none";
  document.querySelector(".options").style.display = "none";
  document.getElementById("signupBox").style.display = "block";
}

function hideSignup() {
  document.querySelector(".signin-btn").style.display = "block";
  document.querySelector(".google-btn").style.display = "flex";
  document.querySelector(".options").style.display = "block";
  document.getElementById("signupBox").style.display = "none";
}

function registerUser() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (name === "" || email === "" || password === "") {
    alert("Please fill all registration details!");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user.updateProfile({
        displayName: name
      });
    })
    .then(() => {
      alert("Registration successful! You can now login.");
      hideSignup();
    })
    .catch((error) => {
      alert(error.message);
    });
}
function forgotPassword() {
  const email = document.querySelector('input[type="email"]').value;

  if (email === "") {
    alert("Please enter your registered email first.");
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset link sent to your email.");
    })
    .catch((error) => {
      alert(error.message);
    });
}