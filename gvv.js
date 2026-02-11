/**
 * Benfei VCF - Live Counter Script
 * (Registration Closed Version)
 */

const TARGET_NUMBER = 700;

/**
 * Updates the UI with current member stats from the backend
 */
async function updateMemberCount() {
  try {
    const res = await fetch("/api/count");
    
    // Check if the response is okay before parsing
    if (!res.ok) throw new Error("Network response was not ok");
    
    const data = await res.json();
    const currentCount = data.count || 0;

    // Calculate remaining (clamped at 0)
    let remaining = Math.max(0, TARGET_NUMBER - currentCount);

    // Update DOM elements
    const currentEl = document.getElementById("displayCurrent");
    const remainingEl = document.getElementById("displayRemaining");

    if (currentEl) currentEl.textContent = currentCount.toLocaleString();
    if (remainingEl) remainingEl.textContent = remaining.toLocaleString();

  } catch (err) {
    console.error("Counter Error:", err);
    // Optional: Show error state in the UI
    document.getElementById("displayCurrent").textContent = "!";
    document.getElementById("displayRemaining").textContent = "!";
  }
}

/**
 * Robotic Voice Utility 
 * (In case you want to trigger a 'Target Reached' announcement)
 */
function playRoboticVoice(text) {
  if (!('speechSynthesis' in window)) return;

  const msg = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  // Attempt to find a clear female voice
  const femaleVoice = voices.find(v => 
    (v.name.includes('Female') || v.name.includes('Google UK English Female')) 
    && v.lang.includes('en')
  );

  if (femaleVoice) msg.voice = femaleVoice;
  
  msg.pitch = 0.8; 
  msg.rate = 1.1;
  window.speechSynthesis.speak(msg);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Initial fetch
  updateMemberCount();

  // Update every 5 seconds (1s might be heavy on your server/API)
  setInterval(updateMemberCount, 5000);
  
  // Ensure voices are loaded for the synth
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
});
