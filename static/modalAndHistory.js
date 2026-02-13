const histBtn = document.getElementById("historyBtn");
const histPanel = document.getElementById("historyPanel");
const histList = document.getElementById("historyList"); 

function loadHistory() {
  const h = JSON.parse(localStorage.getItem("fd_history") || "[]");
  histList.innerHTML = h.length
    ? h.map((x) => `<div style='margin-bottom:8px;'>• ${x}</div>`).join("")
    : "No history yet.";
}

histBtn.onclick = () => {
  loadHistory();
  histPanel.style.display = "block";
};

const closeHistBtn = document.getElementById("closeHistory");
if (closeHistBtn) {
  closeHistBtn.addEventListener("click", () => {
    histPanel.style.display = "none";
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") histPanel.style.display = "none";
});

const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");

loginBtn.onclick = () => (loginModal.style.display = "flex");
loginModal.onclick = (e) => {
  if (e.target === loginModal) loginModal.style.display = "none";
};

document.getElementById("loginConfirm").onclick = () => {
  loginModal.style.display = "none";
};
