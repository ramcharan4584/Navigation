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
function toggleProfile() {
  const card = document.getElementById("profileCard");

  if (card.style.display === "block") {
    card.style.display = "none";
  } else {
    card.style.display = "block";
  }
}