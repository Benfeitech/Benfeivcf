// Handle create session
document.getElementById("createSessionForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("sessionName").value;
  const duration = document.getElementById("duration").value;
  const whatsappLink = document.getElementById("whatsappLink").value;

  const res = await fetch("/api/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, duration, whatsappLink }),
  });

  const data = await res.json();

  if (data.error) {
    alert("Error: " + data.error);
  } else {
    document.getElementById("sessionLink").innerHTML =
      `✅ Session created! <br>
       <a href="session.html?id=${data.sessionId}" target="_blank">Click here to open session</a>`;
  }
});

// Handle upload contact
document.getElementById("uploadForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("id");
  const name = document.getElementById("contactName").value;
  const phone = document.getElementById("contactPhone").value;

  const res = await fetch("/api/upload-contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, name, phone }),
  });

  const data = await res.json();
  alert(data.message || "Something went wrong");
});

// Handle session page (countdown + download link)
async function loadSessionPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("id");
  if (!sessionId) return;

  const res = await fetch(`/api/get-contacts?id=${sessionId}`);
  const data = await res.json();

  if (data.error) {
    document.getElementById("sessionInfo").innerText = "Error: " + data.error;
    return;
  }

  const session = data.session;
  document.getElementById("sessionName").innerText = session.name;
  document.getElementById("whatsappLink").href = session.whatsapp_link;

  // Countdown
  const expireDate = new Date(session.expires_at);
  const countdownEl = document.getElementById("countdown");
  function updateCountdown() {
    const diff = expireDate - new Date();
    if (diff <= 0) {
      countdownEl.innerText = "Expired";
      document.getElementById("downloadBtn").style.display = "block";
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      countdownEl.innerText = `${days}d ${hours}h ${mins}m`;
    }
  }
  setInterval(updateCountdown, 60000);
  updateCountdown();

  // Download button
  document.getElementById("downloadBtn").addEventListener("click", () => {
    window.location.href = `/api/download-vcf?id=${sessionId}`;
  });
}

if (window.location.pathname.endsWith("session.html")) {
  loadSessionPage();
      }
  
