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
