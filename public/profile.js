const BACKEND_URL =
  "https://student-portal-backend-uo7y.onrender.com";

window.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  loadStudentProfile();
  loadProfileImage();
  setupProfileImageUpload();
});

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
}

async function saveStudentProfile() {
  const student = {
    name: document.getElementById("studentName").value.trim(),
    roll_number: document.getElementById("studentRoll").value.trim(),
    branch: document.getElementById("studentBranch").value.trim(),
    year: document.getElementById("studentYear").value.trim(),
    email: document.getElementById("studentEmail").value.trim(),
    phone: document.getElementById("studentPhone").value.trim()
  };

  if (!student.name || !student.email || !student.phone) {
    alert("Please enter name, email and phone number");
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/students/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(student)
    });

    const data = await response.json();

    console.log("Profile request sent:", student);
    console.log("Profile backend response:", data);

    if (data.success) {
      saveProfileToLocalStorage(student);
      alert("Profile saved successfully");
    } else {
      alert(data.message || "Profile not saved");
    }

  } catch (error) {
    console.error(error);
    alert("Backend not connected");
  }
}

function saveProfileToLocalStorage(student) {
  localStorage.setItem("studentName", student.name);
  localStorage.setItem("studentEmail", student.email);
  localStorage.setItem("studentPhone", student.phone);
  localStorage.setItem("studentRoll", student.roll_number);
  localStorage.setItem("studentBranch", student.branch);
  localStorage.setItem("studentYear", student.year);
}

function loadStudentProfile() {
  document.getElementById("studentName").value =
    localStorage.getItem("studentName") || "";

  document.getElementById("studentRoll").value =
    localStorage.getItem("studentRoll") || "";

  document.getElementById("studentBranch").value =
    localStorage.getItem("studentBranch") || "";

  document.getElementById("studentYear").value =
    localStorage.getItem("studentYear") || "";

  document.getElementById("studentEmail").value =
    localStorage.getItem("studentEmail") || "";

  document.getElementById("studentPhone").value =
    localStorage.getItem("studentPhone") || "";
}

function setupProfileImageUpload() {
  const profileUpload =
    document.getElementById("profileUpload");

  const avatarPreview =
    document.getElementById("avatarPreview");

  if (!profileUpload || !avatarPreview) return;

  profileUpload.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const imageData = e.target.result;

      avatarPreview.innerHTML = `
        <img
          src="${imageData}"
          alt="Profile"
          class="profile-img">
      `;

      localStorage.setItem(
        "studentProfileImage",
        imageData
      );
    };

    reader.readAsDataURL(file);
  });
}

function loadProfileImage() {
  const avatarPreview =
    document.getElementById("avatarPreview");

  const savedImage =
    localStorage.getItem("studentProfileImage");

  if (!avatarPreview || !savedImage) return;

  avatarPreview.innerHTML = `
    <img
      src="${savedImage}"
      alt="Profile"
      class="profile-img">
  `;
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  const themeIcon =
    document.getElementById("themeToggle");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");

    if (themeIcon) {
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    }

  } else {
    localStorage.setItem("theme", "light");

    if (themeIcon) {
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
    }
  }
}