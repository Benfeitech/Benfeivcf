// /public/script.js  (replace existing)
const API_BASE = "/api";

// helper to find element by multiple possible ids/names
function find(selectorList, root = document) {
  for (const s of selectorList) {
    const elById = root.getElementById ? root.getElementById(s) : null;
    if (elById) return elById;
    const elByName = root.querySelector ? root.querySelector(`[name="${s}"]`) : null;
    if (elByName) return elByName;
  }
  return null;
}

function getFieldValue(form, candidates) {
  for (const c of candidates) {
    const el = form.querySelector(`#${c}`) || form.querySelector(`[name="${c}"]`);
    if (el) return el.value;
  }
  return "";
}

function readQuery(paramNames) {
  const qs = new URLSearchParams(window.location.search);
  for (const p of paramNames) {
    const v = qs.get(p);
    if (v) return v;
  }
  return null;
}

/* ===== CREATE SESSION ===== */
const createForm = find(["createSessionForm", "createForm", "sessionForm"]);
if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const sessionName = getFieldValue(createForm, ["sessionName", "name", "session_name"]);
    const duration = getFieldValue(createForm, ["duration", "days", "expiresIn"]) || "1";
    const whatsappLink = getFieldValue(createForm, ["whatsappLink", "whatsapp", "whatsapp_link"]);

    if (!sessionName || !whatsappLink) {
      alert("Please fill session name and WhatsApp link.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionName, duration: Number(duration), whatsappLink }),
      });
      const j = await res.json();
      if (j.success) {
        const uploadFull = `${window.location.origin}${j.uploadUrl}`;
        const sessionFull = `${window.location.origin}${j.sessionUrl}`;
        let output = document.getElementById("sessionLink") || document.getElementById("sessionResult");
        if (!output) {
          output = document.createElement("div");
          output.id = "sessionLink";
          createForm.appendChild(output);
        }
        output.innerHTML = `
          ✅ Session created!<br>
          Upload link: <a href="${uploadFull}" target="_blank">${uploadFull}</a>
          <button class="copyBtn" onclick="navigator.clipboard.writeText('${uploadFull}').then(()=>alert('Copied'))">Copy</button>
          <br>
          View session: <a href="${sessionFull}" target="_blank">${sessionFull}</a>
        `;
      } else {
        alert(j.message || "Failed to create session");
      }
    } catch (err) {
      console.error(err);
      alert("Network or server error while creating session");
    }
  });
}

/* ===== UPLOAD PAGE ===== */
const uploadForm = find(["uploadForm", "uploadOnlyForm", "uploadContactForm"]);
if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const sessionId = readQuery(["id", "session", "sessionId"]);
    if (!sessionId) {
      alert("Session id missing in URL.");
      return;
    }
    const name = getFieldValue(uploadForm, ["name", "u_name", "fullName", "contactName"]);
    const phone = getFieldValue(uploadForm, ["phone", "u_phone", "contactPhone", "phone_number"]);
    if (!name || !phone) {
      alert("Please enter name and phone.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/upload-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name, phone }),
      });
      const j = await res.json();
      if (j.success) {
        showUploadMessage(uploadForm, "Contact uploaded successfully", "success");
        uploadForm.reset();
      } else if (j.exists) {
        showUploadMessage(uploadForm, "Contact already exists", "warning");
      } else {
        showUploadMessage(uploadForm, j.message || "Error uploading contact", "error");
      }
    } catch (err) {
      console.error(err);
      showUploadMessage(uploadForm, "Network error", "error");
    }
  });
}

function showUploadMessage(form, text, type) {
  let box = form.querySelector(".upload-msg");
  if (!box) {
    box = document.createElement("div");
    box.className = "upload-msg";
    form.appendChild(box);
  }
  box.textContent = text;
  box.style.marginTop = "10px";
  box.style.padding = "8px";
  if (type === "success") { box.style.background = "rgba(57,255,20,0.12)"; box.style.color = "#003"; }
  else if (type === "warning") { box.style.background = "rgba(255,200,0,0.08)"; box.style.color = "#222"; }
  else { box.style.background = "rgba(255,0,0,0.06)"; box.style.color = "#fff"; }
}

/* ===== SESSION PAGE (load metadata & countdown & enable download if expired) ===== */
if (window.location.pathname.endsWith("session.html")) {
  (async function load() {
    const sessionId = readQuery(["id", "session", "sessionId"]);
    if (!sessionId) {
      document.getElementById("sessionTitle")?.insertAdjacentHTML("afterend", "<p>Session id missing</p>");
      return;
    }
    try {
      const r = await fetch(`${API_BASE}/get-session?id=${encodeURIComponent(sessionId)}`);
      const j = await r.json();
      if (!j.success) {
        console.error(j);
        document.getElementById("sessionTitle").textContent = "Session not found";
        return;
      }
      const s = j.session;
      document.getElementById("sessionTitle").textContent = s.name || "VCF Session";
      document.getElementById("expiresAt").textContent = new Date(s.expires_at).toLocaleString();
      const joinBtn = document.getElementById("joinWhatsApp");
      if (joinBtn) joinBtn.href = s.whatsapp_link || "#";

      // countdown
      function update() {
        const now = new Date();
        const expires = new Date(s.expires_at);
        const diff = expires - now;
        const countdownEl = document.getElementById("countdown");
        if (!countdownEl) return;
        if (diff <= 0) {
          countdownEl.textContent = "Expired";
          document.querySelectorAll(".pre-expire").forEach(el => el.style.display = "none");
          document.getElementById("postExpire") && (document.getElementById("postExpire").style.display = "block");
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
      update();
      setInterval(update, 1000);

      // prepare download action
      const downloadBtn = document.getElementById("downloadBtn");
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
          window.location = `${API_BASE}/download-vcf?sessionId=${encodeURIComponent(sessionId)}`;
        });
      }

      // prepare upload link
      const openUpload = document.getElementById("openUpload");
      const uploadStandalone = document.getElementById("uploadStandalone");
      const uploadUrl = `${window.location.origin}/upload.html?id=${encodeURIComponent(sessionId)}`;
      if (openUpload) openUpload.href = uploadUrl;
      if (uploadStandalone) uploadStandalone.href = uploadUrl;

    } catch (err) {
      console.error(err);
    }
  })();
    }
  
