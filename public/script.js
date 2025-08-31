// Get current page
const page = window.location.pathname.split("/").pop();

// API base
const API_BASE = "https://benfeivcf.vercel.app/"; // change to your deployed URL when online

// ------------------ INDEX PAGE ------------------
if (page === "index.html" || page === "") {
  const form = document.getElementById("createForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const sessionName = form.sessionName.value;
      const whatsappLink = form.whatsappLink.value;
      const expiresIn = form.expiresIn.value;

      const res = await fetch(`${API_BASE}/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionName, whatsappLink, expiresIn }),
      });

      const data = await res.json();
      if (data.success) {
        document.getElementById("message").innerHTML = `
          ✅ Session created successfully! <br>
          <a href="${data.url}" target="_blank">${data.url}</a>
        `;
      } else {
        document.getElementById("message").innerHTML = `❌ ${data.error}`;
      }
    });
  }
}

document.getElementById("sessionForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const sessionName = document.getElementById("sessionName").value;
  const sessionResultDiv = document.getElementById("sessionResult");

  try {
    const res = await fetch("/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionName }),
    });

    const data = await res.json();

    if (data.success) {
      // Show session link for user to copy or click
      sessionResultDiv.innerHTML = `
        ✅ Session created!<br>
        <a href="${data.sessionLink}" target="_blank">
          ${window.location.origin}${data.sessionLink}
        </a>
        <br><small>Copy this link or click it to upload contacts.</small>
      `;
    } else {
      sessionResultDiv.innerHTML = `<p style="color:red;">❌ ${data.message}</p>`;
    }
  } catch (err) {
    console.error(err);
    sessionResultDiv.innerHTML = `<p style="color:red;">Something went wrong. Please try again.</p>`;
  }
});
document.getElementById("sessionForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const sessionName = document.getElementById("sessionName").value;
  const sessionResultDiv = document.getElementById("sessionResult");

  try {
    const res = await fetch("/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionName }),
    });

    const data = await res.json();

    if (data.success) {
      // Show session link for user to copy or click
      sessionResultDiv.innerHTML = `
        ✅ Session created!<br>
        <a href="${data.sessionLink}" target="_blank">
          ${window.location.origin}${data.sessionLink}
        </a>
        <br><small>Copy this link or click it to upload contacts.</small>
      `;
    } else {
      sessionResultDiv.innerHTML = `<p style="color:red;">❌ ${data.message}</p>`;
    }
  } catch (err) {
    console.error(err);
    sessionResultDiv.innerHTML = `<p style="color:red;">Something went wrong. Please try again.</p>`;
  }
});
  
// ------------------ SESSION PAGE ------------------
if (page === "session.html") {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  async function loadSession() {
    const res = await fetch(`${API_BASE}/session/${id}`);
    const data = await res.json();

    if (!data.success) {
      document.querySelector(".container").innerHTML = `<p>❌ Session not found</p>`;
      return;
    }

    document.getElementById("sessionName").textContent = data.session.sessionName;
    document.getElementById("whatsappBtn").href = data.session.whatsappLink;
    document.getElementById("uploadBtn").href = `upload.html?id=${id}`;
    if (data.session.contacts.length > 0) {
      document.getElementById("downloadBtn").style.display = "block";
      document.getElementById("downloadBtn").href = `${API_BASE}/download-vcf/${id}`;
    }

    // Countdown
    const expireTime = new Date(data.session.expiresAt).getTime();
    const countdownEl = document.getElementById("countdown");
    setInterval(() => {
      const now = new Date().getTime();
      const diff = expireTime - now;
      if (diff <= 0) {
        countdownEl.textContent = "Expired";
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        countdownEl.textContent = `${h}h ${m}m ${s}s`;
      }
    }, 1000);
  }

  loadSession();
}

// ------------------ UPLOAD PAGE ------------------
if (page === "upload.html") {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const form = document.getElementById("uploadForm");
  const msg = document.getElementById("message");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.name.value;
      const phone = form.phone.value;

      const res = await fetch(`${API_BASE}/upload-contact/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (data.success) {
        msg.className = "message success";
        msg.textContent = "✅ Contact uploaded successfully!";
      } else {
        msg.className = "message error";
        msg.textContent = `❌ ${data.error}`;
      }
    });
  }
      }
