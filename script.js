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