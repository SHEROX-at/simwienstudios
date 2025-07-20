const translations = {
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_progress: "Progress",
    nav_contact: "Contact",
    home_title: "Welcome to SimWien Studios",
    home_text: "SimWien Studios creates realistic virtual experiences of Vienna’s transit systems, focusing on immersive gameplay and authentic design.",
    about_title: "About Us",
    about_text: "We are passionate about recreating Vienna’s infrastructure in Roblox, delivering highly detailed and accurate projects such as Vienna Lines. Our mission is to combine realism with engaging gameplay.",
    progress_title: "Project Progress",
    contact_title: "Contact",
    contact_text: "Stay connected with us:"
  },
  de: {
    nav_home: "Startseite",
    nav_about: "Über uns",
    nav_progress: "Fortschritt",
    nav_contact: "Kontakt",
    home_title: "Willkommen bei SimWien Studios",
    home_text: "SimWien Studios erstellt realistische virtuelle Erlebnisse der Wiener Verkehrssysteme mit Fokus auf immersives Gameplay und authentisches Design.",
    about_title: "Über uns",
    about_text: "Wir sind begeistert davon, die Infrastruktur Wiens in Roblox nachzubilden, mit detaillierten und realistischen Projekten wie Vienna Lines. Unser Ziel ist es, Realismus mit spannendem Gameplay zu verbinden.",
    progress_title: "Projektfortschritt",
    contact_title: "Kontakt",
    contact_text: "Bleib mit uns verbunden:"
  }
};

let currentLang = "en";

document.getElementById("lang-switch").addEventListener("click", () => {
  currentLang = currentLang === "en" ? "de" : "en";
  document.getElementById("lang-switch").innerText = currentLang === "en" ? "DE" : "EN";
  updateLanguage();
});

function updateLanguage() {
  document.querySelectorAll("[data-key]").forEach(el => {
    const key = el.getAttribute("data-key");
    el.textContent = translations[currentLang][key];
  });
}

// Dark/Light-Mode Toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.getElementById("theme-toggle").innerText = document.body.classList.contains("dark") ? "🌙" : "☀️";
});

// Fortschrittswerte
const projectProgress = {
  viennaLines: 65 // Prozent
};

function updateProgressBars() {
  const bar = document.getElementById("vienna-progress");
  const text = document.getElementById("vienna-progress-text");
  bar.style.width = projectProgress.viennaLines + "%";
  text.innerText = projectProgress.viennaLines + "%";
}

// Scroll-Animation
document.addEventListener("scroll", () => {
  document.querySelectorAll(".fade-in").forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add("visible");
    }
  });
});

updateLanguage();
updateProgressBars();
