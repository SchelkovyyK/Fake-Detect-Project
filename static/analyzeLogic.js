document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const mode = document.querySelector(".tab.active").dataset.mode;
  const btn = document.getElementById("analyzeBtn");

  let payload = {};
  if (mode === "url") {
    const urlVal = document.getElementById("urlInput").value.trim();
    if (!urlVal) return alert("Please paste a URL.");
    payload = { url: urlVal };
  } else {
    const text = document.getElementById("newsText").value.trim();
    if (!text) return alert("Please paste some text.");
    payload = { text: text };
  }

  btn.disabled = true;
  btn.style.opacity = "0.5";
  btn.classList.add("loading");

  let data;
  try {
    const response = await fetch("http://127.0.0.1:8000/factcheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    data = await response.json();
  } catch {
    alert("Server returned invalid JSON or failed. Check backend logs.");
    data = null;
  }

  btn.classList.remove("loading");
  btn.disabled = false;
  btn.style.opacity = "1";

  if (!data) return;
  if (data.error) return alert("Server error: " + data.error);

  const resultsBox = document.getElementById("resultsBox");
  document.getElementById("resClass").textContent =
    data.classification || "Unknown";
  document.getElementById("resReason").textContent = data.reasoning || "";

  const resEvidence = document.getElementById("resEvidence");
  resEvidence.innerHTML = "";
  if (data.evidence && data.evidence.length) {
    data.evidence.forEach((ev) => {
      const claimDiv = document.createElement("div");
      claimDiv.style.marginBottom = "8px";
      claimDiv.innerHTML = `<strong>Claim:</strong> ${
        ev.claim
      }<br><strong>Evidence URLs:</strong> ${ev.urls.join(", ")}`;
      resEvidence.appendChild(claimDiv);
    });
  }
  resultsBox.style.display = "block";
  resultsBox.scrollIntoView({ behavior: "smooth", block: "start" });

  const h = JSON.parse(localStorage.getItem("fd_history") || "[]");
  h.unshift(
    `${new Date().toLocaleString()} — ${
      mode === "url" ? "URL" : "Text"
    } analyzed`
  );
  localStorage.setItem("fd_history", JSON.stringify(h.slice(0, 50)));
});
