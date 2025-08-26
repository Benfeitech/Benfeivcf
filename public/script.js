// ===== For index.html =====
async function createSession() {
  const sessionName = document.getElementById("sessionName").value;
  const duration = document.getElementById("duration").value;
  const whatsappLink = document.getElementById("whatsappLink").value;

  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionName, duration, whatsappLink })
  });

  const data = await res.json();
  if (data.link) {
    document.getElementById("sessionLink").innerHTML =
      `Session Created: <a href="${data.link}">${window.location.origin}${data.link}</a>`;
  } else {
    alert(data.error);
  }
}

// ===== For upload.html =====
window.onload = async function() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("sessionId");
  if (!sessionId) return;

  const res = await fetch(`/api/session/${sessionId}`);
  const session = await res.json();

  document.getElementById("sessionName").innerText = session.name;
  document.getElementById("whatsappBtn").onclick = () => {
    window.open(session.whatsappLink, "_blank");
  };

  // Countdown
  function updateCountdown() {
    const diff = session.expiresAt - Date.now();
    if (diff <= 0) {
      document.getElementById("countdown").innerText = "Session expired";
      document.getElementById("downloadBtn").style.display = "block";
      document.getElementById("downloadBtn").onclick = () => {
        window.location.href = `/api/session/${sessionId}/download`;
      };
      return;
    }
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const minutes = Math.floor((diff / (1000*60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    document.getElementById("countdown").innerText =
      `Expires in ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // Upload contact function
  window.uploadContact = async function() {
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;

    const res = await fetch(`/api/session/${sessionId}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone })
    });

    const data = await res.json();
    document.getElementById("message").innerText = data.message || data.error;
  };
};
        
