const API_BASE = ""; // same server

// Extract sessionId from URL path (/api/:sessionId/upload)
const pathParts = window.location.pathname.split("/");
const sessionId = pathParts[2];

// DOM Elements
const uploadForm = document.getElementById("uploadForm");
const statusMessage = document.getElementById("statusMessage");
const sessionTitle = document.getElementById("sessionTitle");
const countdownEl = document.getElementById("countdown");
const whatsappLinkEl = document.getElementById("whatsappLink");
const expiredSection = document.getElementById("expiredSection");

// ========== Fetch Session Info ==========
async function loadSession() {
  try {
    const res = await fetch(`/api/session-info/${sessionId}`);
    if (!res.ok) throw new Error("Invalid session link");

    const data = await res.json();

    // Show session name
    if (sessionTitle) sessionTitle.textContent = data.sessionName;

    // Show WhatsApp link
    if (whatsappLinkEl) {
      whatsappLinkEl.href = data.whatsappLink;
      whatsappLinkEl.style.display = "inline-block";
    }

    // Setup countdown
    if (countdownEl) startCountdown(data.expiresAt);

  } catch (err) {
    if (statusMessage) statusMessage.textContent = "❌ Invalid session link.";
    if (uploadForm) uploadForm.style.display = "none";
  }
}

// ========== Countdown Timer ==========
function startCountdown(expiryTime) {
  function updateTimer() {
    const now = Date.now();
    const diff = expiryTime - now;

    if (diff <= 0) {
      countdownEl.textContent = "Expired!";
      if (uploadForm) uploadForm.style.display = "none";
      if (expiredSection) {
        expiredSection.style.display = "block";
        expiredSection.innerHTML = `
          <p>📥 Session expired. Download all contacts below:</p>
          <a href="/api/${sessionId}/download" class="btn">⬇ Download VCF</a>
        `;
      }
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    countdownEl.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
  }

  updateTimer();
  const timer = setInterval(updateTimer, 1000);
}

// ========== Upload Contact ==========
if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const [nameInput, phoneInput] = uploadForm.querySelectorAll("input");
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
      showStatus("❌ Please enter both name and phone.", false);
      return;
    }

    try {
      const res = await fetch(`/api/${sessionId}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone })
      });
      const data = await res.json();
      showStatus(res.ok ? "✅ Uploaded successfully!" : `❌ ${data.error}`, res.ok);
      if (res.ok) {
        nameInput.value = "";
        phoneInput.value = "";
      }
    } catch {
      showStatus("❌ Network error. Try again.", false);
    }
  });
}

// ========== Auto-hide Status ==========
function showStatus(msg, success) {
  if (!statusMessage) return;
  statusMessage.textContent = msg;
  statusMessage.style.color = success ? "green" : "red";

  setTimeout(() => {
    statusMessage.textContent = "";
  }, 3000);
}

// Init
if (sessionId) loadSession();
      
