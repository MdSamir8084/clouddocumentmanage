async function api(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function loadDashboard() {
  try {
    const me = await api("/api/me");
    if (me.role !== "student") {
      window.location.href = "/admin.html";
      return;
    }

    document.getElementById("welcome").textContent = `Hi, ${me.name}`;

    const profile = await api("/api/profile");
    document.getElementById("name").value = profile.name || "";
    document.getElementById("email").value = profile.email || "";
    document.getElementById("phone").value = profile.phone || "";

    loadDocuments();
  } catch {
    window.location.href = "/login.html";
  }
}

async function loadDocuments() {
  const docs = await api("/api/documents");
  const box = document.getElementById("documents");

  if (!docs.length) {
    box.innerHTML = `<p class="muted">No documents uploaded yet.</p>`;
    return;
  }

  box.innerHTML = docs.map(d => `
    <div class="list-item">
      <div>
        <strong>${escapeHtml(d.file_name)}</strong>
        <span class="muted">${new Date(d.uploaded_at).toLocaleString()}</span>
      </div>
      <a class="btn small ghost" href="${d.file_path}" target="_blank">Open</a>
    </div>
  `).join("");
}

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("profileMsg");
  const data = Object.fromEntries(new FormData(e.target).entries());

  try {
    await api("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    msg.textContent = "Profile updated successfully.";
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("uploadMsg");
  const formData = new FormData(e.target);

  try {
    await api("/api/documents", { method: "POST", body: formData });
    msg.textContent = "Document uploaded successfully.";
    e.target.reset();
    loadDocuments();
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login.html";
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

loadDashboard();
