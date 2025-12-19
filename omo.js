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

// Function for Robotic Voice
function playRoboticVoice(text) {
  const msg = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  
  // To make it sound "robotic", we lower the pitch and slow the rate
  msg.pitch = 0.8; // Lower pitch = more robotic
  msg.rate = 1.3;  // Slightly slower
  msg.volume = 1;

  window.speechSynthesis.speak(msg);
}

// Fetch and update live member count
async function updateMemberCount() {
  try {
    const res = await fetch("/api/count");
    const data = await res.json();
    document.getElementById("memberCount").textContent = data.count || 0;
  } catch (err) {
    document.getElementById("memberCount").textContent = "N/A";
    console.error("Error fetching counter:", err);
  }
}

updateMemberCount();
setInterval(updateMemberCount, 1000);

// Handle form submission
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = "🥭 " + document.getElementById("name").value.trim() + " 🌽";
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
      playRoboticVoice("Contact uploaded successfully, join the channel now");

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
        timer: 3000, // Give them time to hear the voice
        timerProgressBar: true
      });

      setTimeout(() => {
        window.location.href = '';
      }, 3500); 

      updateMemberCount();
    } else {
      toastr.error("Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error(err);
    toastr.error("Network error. Please check your connection.");
  }
});
