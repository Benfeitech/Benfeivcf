 // Initialize phone input
const phoneInput = document.querySelector("#phone");

const iti = window.intlTelInput(phoneInput, {
  initialCountry: "auto",
  separateDialCode: true,
  preferredCountries: ["ng", "us", "gb"],
  showSearchBox: true,
  geoIpLookup: (callback) => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => callback(data.country_code ? data.country_code.toLowerCase() : "ng"))
      .catch(() => callback("ng"));
  },
  utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
});

function playRoboticVoice(text) {
  const msg = new SpeechSynthesisUtterance(text);

  // Get all available voices on the user's device
  const voices = window.speechSynthesis.getVoices();

  // 1. Try to find a female voice (English)
  // We look for 'Google' voices as they often sound more robotic/clear
  const femaleVoice = voices.find(voice => 
    (voice.name.includes('Female') || voice.name.includes('Google UK English Female')) 
    && voice.lang.includes('en')
  );

  if (femaleVoice) {
    msg.voice = femaleVoice;
  }

  // 2. Setting for "Female Robot" effect:
  msg.pitch = 0.8;  // Higher pitch (1.5 - 2.0) makes it sound more like a female android
  msg.rate = 1.2;   // Keep it slightly below 1.0 for that "calculated" robotic speed
  msg.volume = 1;

  window.speechSynthesis.speak(msg);
}

// CRITICAL: Some browsers (like Chrome) need this to load voices correctly
window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
};
// Fetch and update live member count
// REPLACE THE OLD updateMemberCount FUNCTION WITH THIS

const TARGET_NUMBER = 1000; // Change this number to match your target

async function updateMemberCount() {
  try {
    const res = await fetch("/api/count");
    const data = await res.json();
    
    const currentCount = data.count || 0;
    
    // Calculate remaining
    let remaining = TARGET_NUMBER - currentCount;
    if (remaining < 0) remaining = 0; // Prevent negative numbers if you pass target

    // Update the circles
    document.getElementById("displayCurrent").textContent = currentCount;
    document.getElementById("displayRemaining").textContent = remaining;

  } catch (err) {
    document.getElementById("displayCurrent").textContent = "-";
    document.getElementById("displayRemaining").textContent = "-";
    console.error("Error fetching counter:", err);
  }
}

updateMemberCount();
setInterval(updateMemberCount, 1000);

// Handle form submission
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = "🍏 " + document.getElementById("name").value.trim() + " 🥑";
  if (!name) return toastr.warning("Please enter your name.");

  const countryData = iti.getSelectedCountryData();
  const countryName = countryData?.name || "your country";

  if (!iti.isValidNumber()) {
    toastr.error(`Invalid phone number from ${countryName}`);
    return;
  }

  const fullNumber = iti.getNumber();

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone: fullNumber }),
    });

    const result = await response.json();

    if (result.exists) {
      toastr.warning("This number already exists in our database!");
    } else if (result.success) {

      // 1. Trigger Confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1e60d6', '#ffffff', '#ff0000'],
        zIndex: 9999// Custom Xmas/Brand colors
      });

      // 2. Play Robotic Voice
      playRoboticVoice("Contact uploaded successfully.");

      // 3. Show Success Message
      toastr.success("Contact uploaded successfully!");

      document.getElementById("uploadForm").reset();
      iti.setNumber(""); 

      Swal.fire({
        icon: "success",
        title: "Contact Uploaded!",
        html: `
          <p><b>Name: ${name}</b><br><b>Phone Number:</b> <b>${fullNumber}</b></p><br>
          <p>Redirecting to group...</p>
        `,
        timer: 50, // Give them time to hear the voice
        timerProgressBar: true
      });

      setTimeout(() => {
        window.location.href = 'https://chat.whatsapp.com/GziRusMIESkF55nvNKz7fl?mode=gi_t';
      }, 1000); 

      updateMemberCount();
    } else {
      toastr.error("Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error(err);
    toastr.error("Network error. Please check your connection.");
  }
});