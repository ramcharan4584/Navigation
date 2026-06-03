function toggleSidebar(event) {
  if (event) event.stopPropagation();

  document
    .getElementById("sidebar")
    .classList
    .toggle("active");
}

function toggleSearch(event) {
  if (event) event.stopPropagation();

  document
    .getElementById("searchBox")
    .classList
    .toggle("active");
}

function logout() {
  alert("Logged out successfully!");
  window.location.href = "index.html";
}

/* CLOSE SIDEBAR AND SEARCH WHEN CLICKING OUTSIDE */
document.addEventListener("click", function(event) {
  const sidebar = document.getElementById("sidebar");
  const searchBox = document.getElementById("searchBox");
  const navIcons = document.querySelector(".nav-icons");

  if (
    sidebar.classList.contains("active") &&
    !sidebar.contains(event.target) &&
    !navIcons.contains(event.target)
  ) {
    sidebar.classList.remove("active");
  }

  if (
    searchBox.classList.contains("active") &&
    !searchBox.contains(event.target) &&
    !navIcons.contains(event.target)
  ) {
    searchBox.classList.remove("active");
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

function searchCollege() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const resultBox = document.getElementById("searchResults");

  resultBox.innerHTML = "";

  if (input === "") {
    return;
  }

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

/* SHOW STUDENT NAME */
window.onload = function () {
  const studentName = localStorage.getItem("studentName");

  if (studentName) {
    document.getElementById("welcomeText").innerHTML =
      `Welcome ${studentName} 👋`;
  }
};

/* IMAGE SLIDER */
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(index) {
  slides.forEach(slide => {
    slide.classList.remove("active");
  });

  slides[index].classList.add("active");
}

function changeSlide(direction) {
  currentSlide += direction;

  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }

  if (currentSlide < 0) {
    currentSlide = slides.length - 1;
  }

  showSlide(currentSlide);
}