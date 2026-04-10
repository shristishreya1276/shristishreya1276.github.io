const state = {
  requests: [],
  confirmed: [],
};

const requestForm = document.getElementById("request-form");
const timezoneSelect = document.getElementById("timezone");
const queueEl = document.getElementById("queue");
const confirmedEl = document.getElementById("confirmed");

function seedTimezones() {
  const zones = [
    "America/Los_Angeles",
    "Asia/Kolkata",
    "Europe/London",
    "America/New_York",
    "Asia/Singapore",
    "Australia/Sydney",
  ];

  zones.forEach((tz) => {
    const option = document.createElement("option");
    option.value = tz;
    option.textContent = tz;
    timezoneSelect.appendChild(option);
  });

  timezoneSelect.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function toHostDateString(localDateTime, userTimeZone) {
  const local = new Date(localDateTime);
  const viewerTime = new Date(local.toLocaleString("en-US", { timeZone: userTimeZone }));
  const hostTime = new Date(viewerTime.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  return hostTime.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  });
}

function render() {
  queueEl.innerHTML = "";
  confirmedEl.innerHTML = "";

  if (state.requests.length === 0) {
    queueEl.innerHTML = `<p class="muted">No pending requests.</p>`;
  }

  state.requests.forEach((item) => {
    const div = document.createElement("div");
    div.className = "request";
    div.innerHTML = `
      <p><strong>${item.name}</strong> (${item.email})</p>
      <p>Topic: ${item.topic || "Not provided"}</p>
      <p>Request timezone: ${item.timezone}</p>
      <p>Requested local slot: ${item.localDateTime.replace("T", " ")}</p>
      <p>Host view (San Francisco): <strong>${item.hostView}</strong></p>
      <p class="status-pending">Pending approval</p>
      <div class="stack">
        <button data-action="approve" data-id="${item.id}">Approve & collect payment</button>
        <button class="danger" data-action="reject" data-id="${item.id}">Reject</button>
      </div>
    `;
    queueEl.appendChild(div);
  });

  if (state.confirmed.length === 0) {
    confirmedEl.innerHTML = `<p class="muted">No approved calls yet.</p>`;
  }

  state.confirmed.forEach((item) => {
    const div = document.createElement("div");
    div.className = "request";
    div.innerHTML = `
      <p><strong>${item.name}</strong></p>
      <p>${item.hostView} (America/Los_Angeles)</p>
      <p class="status-approved">Approved · invite can now be sent</p>
      <p class="muted">Next step: trigger Razorpay payment link + calendar invite API.</p>
    `;
    confirmedEl.appendChild(div);
  });
}

requestForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(requestForm);
  const name = formData.get("name") || document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const timezone = document.getElementById("timezone").value;
  const localDateTime = document.getElementById("localDateTime").value;
  const topic = document.getElementById("topic").value;

  const req = {
    id: crypto.randomUUID(),
    name,
    email,
    timezone,
    localDateTime,
    topic,
    hostView: toHostDateString(localDateTime, timezone),
  };

  state.requests.unshift(req);
  requestForm.reset();
  timezoneSelect.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  render();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  const target = state.requests.find((request) => request.id === id);
  if (!target) return;

  state.requests = state.requests.filter((request) => request.id !== id);

  if (action === "approve") {
    state.confirmed.unshift(target);
  }

  render();
});

seedTimezones();
render();
