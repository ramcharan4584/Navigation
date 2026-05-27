function searchLocation() {
    let input = document.getElementById("searchInput").value;
    let result = document.getElementById("resultBox");

    if (input === "") {
        result.innerHTML = "Please enter something to search.";
    } 
    else if (input.toLowerCase() === "it lab") {
        result.innerHTML = "IT Lab → B Block → 2nd Floor → Near Seminar Hall";
    } 
    else if (input.toLowerCase() === "principal") {
        result.innerHTML = "Principal Office → Admin Block → 1st Floor";
    } 
    else {
        result.innerHTML = "No data found. Try another search.";
    }
}
function openLogin() {
  alert("Login page coming soon 🚀");
}

function openProfile() {
  alert("Profile page coming soon 👤");
}

function openSearch() {
  let query = prompt("Enter search (example: IT Lab):");

  if (query === "it lab") {
    alert("IT Lab → B Block → 2nd Floor");
  } else {
    alert("No result found for: " + query);
  }
}
function openLogin() {
  alert("Login page coming soon 🚀");
}

// PASSWORD SHOW / HIDE
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

togglePassword.addEventListener("click", () => {

    const type =
        password.getAttribute("type") === "password"
            ? "text"
            : "password";

    password.setAttribute("type", type);

    // Change icon
    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");
});


// SIGN IN BUTTON ANIMATION
const signInBtn = document.querySelector(".signin-btn");

signInBtn.addEventListener("click", () => {

    const email =
        document.querySelector('input[type="email"]').value;

    const passwordValue =
        document.getElementById("password").value;

    // Validation
    if (email === "" || passwordValue === "") {
        alert("Please fill all fields!");
        return;
    }

    // Button loading effect
    signInBtn.innerHTML = "Signing In...";
    signInBtn.style.opacity = "0.8";

    setTimeout(() => {
        signInBtn.innerHTML = "✓ Login Successful";
        signInBtn.style.background = "green";

        setTimeout(() => {
            signInBtn.innerHTML = "Sign in";
            signInBtn.style.background = "#6c4ccf";
            signInBtn.style.opacity = "1";
        }, 2000);

    }, 1500);
});


// INPUT FOCUS EFFECT
const inputs = document.querySelectorAll("input");

inputs.forEach(input => {
    input.addEventListener("focus", () => {
        input.style.border = "2px solid #6c4ccf";
        input.style.boxShadow =
            "0 0 10px rgba(108,76,207,0.3)";
    });

    input.addEventListener("blur", () => {
        input.style.border = "1px solid #ddd";
        input.style.boxShadow = "none";
    });
});


// FADE-IN ANIMATION
window.addEventListener("load", () => {
    document.querySelector(".login-box").style.opacity = "1";
    document.querySelector(".login-box").style.transform =
        "translateY(0px)";
});
  const firebaseConfig = {
    apiKey: "AIzaSyD_7Cp155ILuZlzdVRk4-pdj9RGlztmkhM",
  authDomain: "student-portal-1baed.firebaseapp.com",
  projectId: "student-portal-1baed",
  storageBucket: "student-portal-1baed.firebasestorage.app",
  messagingSenderId: "1017420453175",
  appId: "1:1017420453175:web:5c9c44f5a68a3e4d5476b2",
  measurementId: "G-T8PCR4Q06B"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
// ✅ GOOGLE LOGIN FUNCTION (PASTE HERE ↓↓↓)
window.googleLogin = function () {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log("User logged in:", user.displayName);
            alert("Welcome " + user.displayName);

            // optional redirect
            // window.location.href = "dashboard.html";
        })
        .catch((error) => {
            console.log("Login error:", error);
        });
};