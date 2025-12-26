// ===================================
// THEME TOGGLE (DARK MODE)
// ===================================

const toggle = document.getElementById('theme-toggle');
const icon = document.getElementById('theme-icon');
const darkModeKey = 'dark-mode-enabled';

// Apply saved theme on load
if (localStorage.getItem(darkModeKey) === 'true') {
  document.body.classList.add('dark-mode');
  icon.classList.remove('fa-moon');
  icon.classList.add('fa-sun');
} else {
  icon.classList.remove('fa-sun');
  icon.classList.add('fa-moon');
}

// Toggle handler
toggle.onclick = () => {
  document.body.classList.toggle('dark-mode');
  const darkModeOn = document.body.classList.contains('dark-mode');
  localStorage.setItem(darkModeKey, darkModeOn);

  if (darkModeOn) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
};

// ===================================
// FORM VALIDATION
// ===================================

function validateName() {
  const name = document.getElementById("fullName").value.trim();
  const error = document.getElementById("name-error");

  if (name.length < 3) {
    error.textContent = "Name must be at least 3 characters.";
    error.style.color = "#e74c3c";
    return false;
  } else {
    error.textContent = "";
    return true;
  }
}

function validateEmail() {
  const email = document.getElementById("email_id").value.trim();
  const error = document.getElementById("email-error");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  if (!email.match(emailPattern)) {
    error.textContent = "Please enter a valid email address.";
    error.style.color = "#e74c3c";
    return false;
  } else {
    error.textContent = "";
    return true;
  }
}

function validateMessage() {
  const message = document.getElementById("message").value.trim();
  const error = document.getElementById("message-error");

  if (message.length < 10) {
    error.textContent = "Message must be at least 10 characters.";
    error.style.color = "#e74c3c";
    return false;
  } else {
    error.textContent = "";
    return true;
  }
}

// ===================================
// DOM READY
// ===================================

document.addEventListener('DOMContentLoaded', function () {
  
  // ===================================
  // CERTIFICATION HOVER IMAGES
  // ===================================
  
  const certCards = document.querySelectorAll(".cert-card");
  certCards.forEach(card => {
    const imgUrl = card.getAttribute("data-cert-image");
    if (imgUrl) {
      const hoverDiv = document.createElement("div");
      hoverDiv.classList.add("cert-hover-image");
      hoverDiv.style.backgroundImage = `url(${imgUrl})`;
      const container = card.querySelector(".cert-img-container");
      if (container) {
        container.appendChild(hoverDiv);
      }
    }
  });

  // ===================================
  // ACTIVE NAVIGATION HIGHLIGHTING - FIXED
  // ===================================
  
  function updateActiveNav() {
    const scrollPos = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    
    // Special case 1: At very top
    if (scrollPos < 100) {
      setActiveLink('#home');
      return;
    }
    
    // Special case 2: Near bottom (last 150px) - always Contact
    if (scrollPos + windowHeight >= docHeight - 150) {
      setActiveLink('#contact');
      return;
    }
    
    // Normal case: check section positions
    const sections = [
      { id: 'home', offset: document.querySelector('#home')?.offsetTop || 0 },
      { id: 'about-me', offset: document.querySelector('#about-me')?.offsetTop || 0 },
      { id: 'Skills', offset: document.querySelector('#Skills')?.offsetTop || 0 },
      { id: 'projects', offset: document.querySelector('#projects')?.offsetTop || 0 },
      { id: 'certifications', offset: document.querySelector('#certifications')?.offsetTop || 0 },
      { id: 'contact', offset: document.querySelector('#contact')?.offsetTop || 0 }
    ];
    
    // Adjust scroll position for navbar
    const adjustedScrollPos = scrollPos + 120;
    
    // Find active section (iterate backwards for last match)
    let activeId = 'home';
    for (const section of sections) {
      if (adjustedScrollPos >= section.offset) {
        activeId = section.id;
      }
    }
    
    setActiveLink(`#${activeId}`);
  }
  
  function setActiveLink(href) {
    document.querySelectorAll('nav a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === href) {
        link.classList.add('active');
      }
    });
  }
  
  // Throttle scroll events
  let scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      window.requestAnimationFrame(function() {
        updateActiveNav();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });
  
  window.addEventListener('load', updateActiveNav);
  updateActiveNav();

  // ===================================
  // SMOOTH SCROLL FOR NAVIGATION
  // ===================================
  
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
      if (targetId === '#home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ===================================
  // FIXED ICONS SMOOTH SCROLL
  // ===================================
  
  document.querySelectorAll('.fixed-icons a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
});