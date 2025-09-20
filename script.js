document.addEventListener("DOMContentLoaded", function () {
    const certCards = document.querySelectorAll(".cert-card");

    certCards.forEach(card => {
      const imgUrl = card.getAttribute("data-cert-image");
      const hoverDiv = document.createElement("div");
      hoverDiv.classList.add("cert-hover-image");
      hoverDiv.style.backgroundImage = `url(${imgUrl})`;

      const container = card.querySelector(".cert-img-container");
      if (container) {
        container.appendChild(hoverDiv);
      }
    });
  });


const toggle = document.getElementById('theme-toggle');
const icon = document.getElementById('theme-icon');
const darkModeKey = 'dark-mode-enabled';

// ✅ Apply saved theme on load
if (localStorage.getItem(darkModeKey) === 'true') {
  document.body.classList.add('dark-mode');
  icon.classList.remove('fa-moon');
  icon.classList.add('fa-sun');
} else {
  icon.classList.remove('fa-sun');
  icon.classList.add('fa-moon');
}

// ✅ Toggle handler
toggle.onclick = () => {
  document.body.classList.toggle('dark-mode');
  const darkModeOn = document.body.classList.contains('dark-mode');
  localStorage.setItem(darkModeKey, darkModeOn);

  if (darkModeOn) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun'); // 🌞 show sun
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon'); // 🌙 show moon
  }
};




function validateName() {
  const name = document.getElementById("fullName").value.trim();
  const error = document.getElementById("name-error");

  if (name.length < 3) {
    error.textContent = "Name must be at least 3 characters.";
    return false;
  } else {
    error.textContent = "";
    return true;
  }
}

function validateEmail() {
  const email = document.getElementById("email_id").value.trim();
  const error = document.getElementById("email-error");

  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

  if (!email.match(emailPattern)) {
    error.textContent = "Please enter a valid email address.";
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
    return false;
  } else {
    error.textContent = "";
    return true;
  }
}

function SendMail() {
  if (!validateName() || !validateEmail() || !validateMessage()) {
    alert("Please fill out the form correctly.");
    return false;
  }

  // For demo — replace with EmailJS or actual backend later
  alert("Message sent successfully!");
  return true;
}
