function toggleTheme() {

  document.body.classList.toggle("dark-mode");

  const themeIcon =
    document.getElementById("themeToggle");

  if (document.body.classList.contains("dark-mode")) {

    localStorage.setItem("theme", "dark");

    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");

  } else {

    localStorage.setItem("theme", "light");

    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  }
}