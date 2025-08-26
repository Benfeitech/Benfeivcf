const API_BASE = ""; // auto-detect same server

// Extract sessionId from URL
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("sid");

const sessionNameEl = document.getElementById("sessionName");
const countdownEl = document.getElementById("countdown");
const whatsappLinkEl = document.getElementById("whatsappLink");
const downloadBtn = document.getElementById("downloadBtn");
const statusMessage = document.getElementById("statusMessage");
const uploadForm = document.getElementById("uploadForm");

let expiresAt = null;

// ========== Load Session Info ==========
async function loadSessionInfo() {
  try {
    const res = await fetch(`${API_BASE}/api/${sessionId}/info`);
    const data = await res.json();

    if (!res.ok) {
      sessionNameEl.textContent = "❌ Session not found.";
      return;
    }

    sessionNameEl.textContent = data.sessionName;
    expiresAt = data.expiresAt;

    // WhatsApp link
    if (data.whatsappLink) {
      whatsappLinkEl.textContent = "📱 Join WhatsApp Group";
      whatsappLinkEl.href = data.whatsappLink;
    }
    
    startCountdown();
  } catch {
    sessionNameEl.textContent = "❌ Failed to load session.";
  }
}

// ========== Countdown ==========
function startCountdown() {
  const timer = setInterval(() => {
    const now = Date.now();
    const diff = expiresAt - now;

    if (diff <= 0) {
      clearInterval(timer);
      countdownEl.textContent = "⏰ Session expired!";
      downloadBtn.style.display = "inline-block";
      downloadBtn.onclick = () => {
        window.location.href = `${API_BASE}/api/${sessionId}/download`;
      };
      return;
    }

    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    countdownEl.textContent = `⏳ Expires in ${hrs}h ${mins}m ${secs}s`;
  }, 1000);
}

// ========== Upload Form ==========
if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const [nameInput, phoneInput] = uploadForm.querySelectorAll("input");
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
      showStatus("❌ Please enter both name and phone.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/${sessionId}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone })
      });
      const data = await res.json();
      showStatus(res.ok ? "✅ Contact uploaded successfully!" : `❌ ${data.error}`);
    } catch {
      showStatus("❌ Network error. Try again.");
    }
  });
}

// ========== Status Auto-Hide ==========
function showStatus(msg) {
  statusMessage.textContent = msg;
  setTimeout(() => {
    statusMessage.textContent = "";
  }, 3000);
}

// Init
if (sessionId) {
  loadSessionInfo();
} else {
  sessionNameEl.textContent = "❌ Invalid session link.";
}
