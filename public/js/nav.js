const init = (html) => {
  document.getElementById("nav").innerHTML = html.replace(
    "<!DOCTYPE html>",
    ""
  );
  const dark_theme_btn = document.getElementById("enable-dark-theme");
  const light_theme_btn = document.getElementById("enable-light-theme");
  const html_element = document.querySelector("html");
  light_theme_btn.addEventListener("click", () => {
    html_element.setAttribute("data-bs-theme", "dark");
    dark_theme_btn.classList.remove("active");
    light_theme_btn.classList.add("active");
  });
  dark_theme_btn.addEventListener("click", () => {
    html_element.setAttribute("data-bs-theme", "light");
    dark_theme_btn.classList.add("active");
    light_theme_btn.classList.remove("active");
  });
};

fetch("/segments/nav.html")
  .then((response) => response.text())
  .then(init)
  .catch((error) => {
    console.error("Error loading segment:", error);
  });
