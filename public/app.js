const API_BASE = ""; // auto-detect same server

// ========== Upload Form ==========
const uploadForm = document.getElementById("uploadForm");
const statusMessage = document.getElementById("statusMessage");

if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const [nameInput, phoneInput] = uploadForm.querySelectorAll("input");
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
      statusMessage.textContent = "❌ Please enter both name and phone.";
      return;
    }

    // Get sessionId from URL (index.html?sid=xxxxx)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("sid");

    if (!sessionId) {
      statusMessage.textContent = "❌ No session ID found in URL.";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/${sessionId}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone })
      });
      const data = await res.json();
      statusMessage.textContent = res.ok
        ? "✅ Uploaded successfully!"
        : `❌ ${data.error}`;
    } catch {
      statusMessage.textContent = "❌ Network error. Try again.";
    }
  });
}

// ========== Create Session ==========
const createForm = document.getElementById("createForm");
const createStatus = document.getElementById("createStatus");

if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const sessionName = createForm.querySelector("input[name='sessionName']").value.trim();
    const duration = createForm.querySelector("select").value;
    const whatsappLink = createForm.querySelector("input[type='url']").value.trim();

    try {
      const res = await fetch(`${API_BASE}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionName, duration, whatsappLink })
      });
      const data = await res.json();
      createStatus.textContent = res.ok
        ? `✅ Session created! Share link: ${data.uploadPage}`
        : `❌ ${data.error}`;
    } catch {
      createStatus.textContent = "❌ Network error. Try again.";
    }
  });
}
