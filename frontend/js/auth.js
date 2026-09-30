const loginForm = document.getElementById("loginForm");

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const msg = document.getElementById("loginMsg");
  const data = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  msg.textContent = result.message;

  if (res.ok) window.location.href = result.redirect;
});

const registerForm = document.getElementById("registerForm");

registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const msg = document.getElementById("registerMsg");
  const data = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  msg.textContent = result.message;

  if (res.ok) {
    setTimeout(() => window.location.href = "/login.html", 900);
  }
});
