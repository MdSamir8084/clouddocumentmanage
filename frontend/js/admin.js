async function api(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function loadAdmin() {
  try {
    const me = await api("/api/me");
    if (me.role !== "admin") {
      window.location.href = "/dashboard.html";
      return;
    }

    const [stats, users, messages, documents] = await Promise.all([
      api("/api/admin/stats"),
      api("/api/admin/users"),
      api("/api/admin/messages"),
      api("/api/admin/documents")
    ]);

    document.getElementById("usersCount").textContent = stats.users;
    document.getElementById("messagesCount").textContent = stats.messages;
    document.getElementById("documentsCount").textContent = stats.documents;

    document.getElementById("usersTable").innerHTML = users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone || "-")}</td>
        <td><span class="badge">${u.role}</span></td>
        <td>${new Date(u.created_at).toLocaleDateString()}</td>
      </tr>
    `).join("");

    document.getElementById("messagesTable").innerHTML = messages.map(m => `
      <tr>
        <td>${escapeHtml(m.name)}</td>
        <td>${escapeHtml(m.email)}</td>
        <td>${escapeHtml(m.message)}</td>
        <td>${new Date(m.created_at).toLocaleString()}</td>
      </tr>
    `).join("");

    document.getElementById("documentsTable").innerHTML = documents.map(d => `
      <tr>
        <td>${escapeHtml(d.user_name)}</td>
        <td>${escapeHtml(d.user_email)}</td>
        <td>${escapeHtml(d.file_name)}</td>
        <td>${escapeHtml(d.file_type || "-")}</td>
        <td>${new Date(d.uploaded_at).toLocaleString()}</td>
        <td><a href="${d.file_path}" target="_blank">Open</a></td>
      </tr>
    `).join("");
  } catch (err) {
    console.error(err);
    window.location.href = "/login.html";
  }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login.html";
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

loadAdmin();
