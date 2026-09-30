document.getElementById("contactForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("contactMsg");
  const data = Object.fromEntries(new FormData(e.target).entries());

  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  msg.textContent = result.message;
  if (res.ok) e.target.reset();
});
