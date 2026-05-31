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
// FIREBASE CONFIG (ONLY ONCE)
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

// FADE-IN ANIMATION
window.addEventListener("load", () => {
    document.querySelector(".login-box").style.opacity = "1";
    document.querySelector(".login-box").style.transform = "translateY(0px)";
});
// GOOGLE LOGIN FUNCTION
window.googleLogin = function () {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
        .then((userCredential) => {
    window.location.href = "home.html";
})
        .catch((error) => {
            console.log("Login error:", error);
        });
};
// ================= PASSWORD TOGGLE =================
window.addEventListener("DOMContentLoaded", () => {

    const togglePassword = document.getElementById("togglePassword");
    const password = document.getElementById("password");

    togglePassword.addEventListener("click", () => {

        const type = password.type === "password" ? "text" : "password";
        password.type = type;

        togglePassword.classList.toggle("fa-eye");
        togglePassword.classList.toggle("fa-eye-slash");
    });
});


// ================= INPUT EFFECT =================
window.addEventListener("DOMContentLoaded", () => {

    const inputs = document.querySelectorAll("input");

    inputs.forEach(input => {
        input.addEventListener("focus", () => {
            input.style.border = "2px solid #6c4ccf";
        });

        input.addEventListener("blur", () => {
            input.style.border = "1px solid #ddd";
        });
    });
});


// ================= FADE IN =================
window.addEventListener("load", () => {
    const box = document.querySelector(".login-box");
    box.style.opacity = "1";
    box.style.transform = "translateY(0px)";
});