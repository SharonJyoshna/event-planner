const $ = (id) => document.getElementById(id);
const el = (tag, text) => { const e = document.createElement(tag); e.textContent = text; return e; };

function list(title, items) {
  const wrap = document.createDocumentFragment();
  wrap.append(el("h2", title));
  const ul = document.createElement("ul");
  items.forEach((i) => ul.append(el("li", i)));
  wrap.append(ul);
  return wrap;
}

function render(d) {
  const out = $("plan");
  out.replaceChildren(el("h2", "Budget"));
  const t = document.createElement("table");
  t.innerHTML = "<caption class='sr'>Budget breakdown</caption>";
  const head = t.insertRow();
  ["Category", "Amount", "Share"].forEach((h) => { const c = document.createElement("th"); c.scope = "col"; c.textContent = h; head.append(c); });
  (d.budget_breakdown || []).forEach((r) => {
    const row = t.insertRow();
    [r.category, r.amount, r.percent + "%"].forEach((v) => row.insertCell().textContent = v);
  });
  out.append(t, list("Timeline", (d.timeline || []).map((x) => `${x.when}: ${x.task}`)),
    list("Vendor checklist", d.vendor_checklist || []), list("Ideas", d.ideas || []));
  out.hidden = false; out.focus();
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("status").textContent = "Planning your event...";
  const body = { event_type: $("event_type").value, budget: $("budget").value,
    guests: $("guests").value, date: $("date").value, notes: $("notes").value };
  try {
    const r = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    render(data); $("status").textContent = "Your plan is ready.";
  } catch (err) { $("status").textContent = err.message || "Something went wrong."; }
});

$("sample").addEventListener("click", () => {
  $("event_type").value = "birthday"; $("budget").value = 50000; $("guests").value = 40;
  $("notes").value = "Garden theme, vegetarian snacks"; $("form").scrollIntoView(); $("budget").focus();
});
