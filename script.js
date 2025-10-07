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

  const name = "💫 " + document.getElementById("name").value.trim() + " ✨";

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
      toastr.success("Contact uploaded successfully!");

      // ✅ Clear input fields after successful upload
      document.getElementById("uploadForm").reset();
      iti.setNumber(""); // clear the intl-tel-input field

      Swal.fire({
  iconHtml: `
    <div style="display:flex; justify-content:center; align-items:center;">
      <div style="width:70px; height:70px; border-radius:50%; background:#e6f9ea; display:flex; justify-content:center; align-items:center;">
        <i class="fa fa-check" style="color:#22c55e; font-size:38px;"></i>
      </div>
    </div>
  `,
  title: "Contact Uploaded!",
  html: `
    <p style="margin:6px 0 12px 0; color:#555; font-size:15px;">
      Your contact has been successfully uploaded 🎉
    </p>
    <div style="margin:0 auto; text-align:left; background:#f9f9f9; padding:12px 14px; border-radius:10px; width:90%;">
      <p style="margin:4px 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin:4px 0;"><strong>Phone Number:</strong> ${fullNumber}</p>
    </div>
    <p style="margin-top:14px; font-size:14px; color:#444;">
      Join our WhatsApp Channel below 👇 for VCF
    </p>
    <a href="https://whatsapp.com/channel/0029Vay16NVJENy6op6dBV3B"
       target="_blank"
       style="display:inline-block; background:linear-gradient(to right, #25D366, #128C7E);
              color:white; font-weight:600; border:none; padding:10px 24px;
              border-radius:8px; text-decoration:none; margin-top:10px;
              box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      <i class="fa fa-whatsapp" style="margin-right:6px;"></i>Join Channel
    </a>
    <br>
    <button style="margin-top:14px; background:#2563eb; color:white; border:none;
                   border-radius:6px; padding:8px 18px; cursor:pointer; font-weight:500;">
      Done
    </button>
  `,
  showConfirmButton: false,
  customClass: {
    popup: "custom-swal-card"
  },
  didOpen: () => {
    const popup = document.querySelector(".swal2-popup");
    if (popup) {
      popup.style.borderRadius = "20px";
      popup.style.padding = "1.3em 1em";
      popup.style.width = "340px";
      popup.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
    }
    const title = document.querySelector(".swal2-title");
    if (title) title.style.marginBottom = "0.2em";
  },
});
