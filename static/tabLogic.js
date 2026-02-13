document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const mode = tab.dataset.mode;
    const url = document.getElementById("urlInput");
    const txt = document.getElementById("newsText");
    const btnText = document.getElementById("btnText");

    if (mode === "url") {
      url.style.display = "block";
      txt.style.display = "none";
      btnText.textContent = "Analyze URL";
    } else {
      url.style.display = "none";
      txt.style.display = "block";
      btnText.textContent = "Analyze Text";
    }
  });
});
