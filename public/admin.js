const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  user: null,
  firstRun: false,
  view: "records",
  settings: null,
  users: [],
  records: [],
  recordFilters: { q: "", status: "all", public: "all" },
  userFilters: { q: "", role: "all", status: "all" },
  selectedRecords: new Set(),
  selectedUsers: new Set()
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.details?.error?.message || data.error || "Request failed");
  return data;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmt(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  $("#toastLayer").appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function confirmInline({ title, message, confirmText = "确认删除", cancelText = "取消" }) {
  return new Promise((resolve) => {
    const layer = document.createElement("div");
    layer.className = "confirm-layer";
    layer.innerHTML = `
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <h3 id="confirmTitle">${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
        <div class="confirm-actions">
          <button class="secondary" type="button" data-confirm-cancel>${escapeHtml(cancelText)}</button>
          <button class="danger" type="button" data-confirm-ok>${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    const finish = (value) => {
      document.removeEventListener("keydown", onKeydown);
      layer.remove();
      resolve(value);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") finish(false);
    };

    layer.addEventListener("click", (event) => {
      if (event.target === layer) finish(false);
    });
    $("[data-confirm-cancel]", layer).addEventListener("click", () => finish(false));
    $("[data-confirm-ok]", layer).addEventListener("click", () => finish(true));
    document.addEventListener("keydown", onKeydown);
    document.body.appendChild(layer);
    $("[data-confirm-ok]", layer).focus();
  });
}

function renderLogin() {
  $("#logoutBtn").classList.add("hidden");
  $("#adminApp").innerHTML = `
    <section class="hero">
      <h1>后台管理</h1>
      <p>请使用管理员账号登录。管理员账号由服务器环境变量 ADMIN_EMAIL / ADMIN_PASSWORD 初始化，普通前台注册不会获得后台权限。</p>
    </section>
    <section class="card" style="max-width:460px">
      <h2>管理员登录</h2>
      <form id="loginForm" class="form">
        <label>邮箱<input id="emailInput" type="email" autocomplete="email" required></label>
        <label>密码<input id="passwordInput" type="password" autocomplete="current-password" required></label>
        <button class="primary" type="submit">登录后台</button>
        <a class="secondary" href="/" style="display:grid;place-items:center">回到前台注册/登录</a>
      </form>
    </section>
  `;
  $("#loginForm").addEventListener("submit", login);
}

function renderDenied() {
  $("#logoutBtn").classList.remove("hidden");
  $("#adminApp").innerHTML = `
    <section class="hero">
      <h1>没有后台权限</h1>
      <p>当前账号 ${escapeHtml(state.user?.email || "")} 不是管理员。</p>
    </section>
    <section class="card" style="max-width:520px">
      <button class="secondary" type="button" id="backHome">返回前台</button>
    </section>
  `;
  $("#backHome").addEventListener("click", () => {
    window.location.href = "/";
  });
}

function renderAdmin() {
  $("#logoutBtn").classList.remove("hidden");
  $("#adminApp").innerHTML = `
    <section class="hero">
      <h1>后台管理</h1>
      <p>管理用户、积分、接口设置，并查看生图审计记录、提示词、IP 和浏览器信息。</p>
    </section>
    <div class="tabs">
      <button class="secondary ${state.view === "records" ? "active" : ""}" data-view="records">生图记录</button>
      <button class="secondary ${state.view === "users" ? "active" : ""}" data-view="users">用户管理</button>
      <button class="secondary ${state.view === "settings" ? "active" : ""}" data-view="settings">接口设置</button>
    </div>
    <section id="panel"></section>
  `;
  $$("[data-view]").forEach((button) => {
    button.addEventListener("click", async () => {
      state.view = button.dataset.view;
      await loadPanel();
      renderAdmin();
      renderPanel();
    });
  });
  renderPanel();
}

function renderPanel() {
  if (state.view === "records") return renderRecords();
  if (state.view === "users") return renderUsers();
  renderSettings();
}

function matchesSearch(values, query) {
  if (!query) return true;
  const normalized = query.trim().toLowerCase();
  return values.some((value) => String(value || "").toLowerCase().includes(normalized));
}

function filteredRecords() {
  const filters = state.recordFilters;
  return state.records.filter((record) => {
    if (filters.status !== "all" && record.status !== filters.status) return false;
    if (filters.public !== "all" && String(Number(Boolean(record.isPublic))) !== filters.public) return false;
    return matchesSearch([
      record.prompt,
      record.userName,
      record.userEmail,
      record.userId,
      record.ipAddress,
      record.userAgent,
      record.status,
      record.errorMessage
    ], filters.q);
  });
}

function filteredUsers() {
  const filters = state.userFilters;
  return state.users.filter((user) => {
    if (filters.role !== "all" && user.role !== filters.role) return false;
    if (filters.status !== "all" && user.status !== filters.status) return false;
    return matchesSearch([user.name, user.email, user.role, user.status, user.id], filters.q);
  });
}

function focusFilterInput(id) {
  const input = $(`#${id}`);
  if (!input) return;
  input.focus();
  const end = input.value.length;
  input.setSelectionRange?.(end, end);
}

function pruneSelections() {
  const recordIds = new Set(state.records.map((record) => record.id));
  const userIds = new Set(state.users.map((user) => user.id));
  [...state.selectedRecords].forEach((id) => {
    if (!recordIds.has(id)) state.selectedRecords.delete(id);
  });
  [...state.selectedUsers].forEach((id) => {
    if (!userIds.has(id) || id === state.user?.id) state.selectedUsers.delete(id);
  });
}

function setAllVisibleRecords(records, checked) {
  records.forEach((record) => {
    if (checked) state.selectedRecords.add(record.id);
    else state.selectedRecords.delete(record.id);
  });
}

function setAllVisibleUsers(users, checked) {
  users.forEach((user) => {
    if (user.id === state.user?.id) return;
    if (checked) state.selectedUsers.add(user.id);
    else state.selectedUsers.delete(user.id);
  });
}

function renderRecords(focusTarget = "") {
  const records = filteredRecords();
  const selectedVisibleCount = records.filter((record) => state.selectedRecords.has(record.id)).length;
  const allVisibleSelected = Boolean(records.length && selectedVisibleCount === records.length);
  $("#panel").innerHTML = `
    <div class="card">
      <h2>生图记录</h2>
      <div class="admin-filters">
        <label>搜索<input id="recordSearch" value="${escapeHtml(state.recordFilters.q)}" placeholder="提示词 / 用户 / IP / 浏览器"></label>
        <label>状态
          <select id="recordStatusFilter">
            <option value="all" ${state.recordFilters.status === "all" ? "selected" : ""}>全部状态</option>
            <option value="pending" ${state.recordFilters.status === "pending" ? "selected" : ""}>等待中</option>
            <option value="running" ${state.recordFilters.status === "running" ? "selected" : ""}>生成中</option>
            <option value="completed" ${state.recordFilters.status === "completed" ? "selected" : ""}>已完成</option>
            <option value="failed" ${state.recordFilters.status === "failed" ? "selected" : ""}>失败</option>
          </select>
        </label>
        <label>公开
          <select id="recordPublicFilter">
            <option value="all" ${state.recordFilters.public === "all" ? "selected" : ""}>全部</option>
            <option value="1" ${state.recordFilters.public === "1" ? "selected" : ""}>公开</option>
            <option value="0" ${state.recordFilters.public === "0" ? "selected" : ""}>不公开</option>
          </select>
        </label>
        <div class="filter-count">共 ${state.records.length} 条，当前 ${records.length} 条</div>
      </div>
      <div class="bulk-bar">
        <span>已选择 ${state.selectedRecords.size} 条</span>
        <button class="tiny danger" id="bulkDeleteRecords" type="button" ${state.selectedRecords.size ? "" : "disabled"}>批量删除</button>
        <button class="tiny secondary" id="clearRecordSelection" type="button" ${state.selectedRecords.size ? "" : "disabled"}>清空选择</button>
      </div>
      <div class="table-wrap">
        ${records.length ? `
          <table>
            <thead>
              <tr>
                <th class="select-col"><input id="selectAllRecords" type="checkbox" ${allVisibleSelected ? "checked" : ""} aria-label="选择当前筛选的全部记录"></th>
                <th>图片</th>
                <th>用户</th>
                <th>提示词</th>
                <th>IP / UA</th>
                <th>公开</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${records.map((record) => `
                <tr>
                  <td class="select-col"><input class="record-select" type="checkbox" data-record-id="${escapeHtml(record.id)}" ${state.selectedRecords.has(record.id) ? "checked" : ""} aria-label="选择记录"></td>
                  <td>${record.imageUrl ? `<a href="${escapeHtml(record.imageUrl)}" target="_blank"><img class="thumb" src="${escapeHtml(record.imageUrl)}" alt=""></a>` : `<div class="thumb"></div>`}</td>
                  <td><strong>${escapeHtml(record.userName || record.userEmail || "未知用户")}</strong><br><span class="muted">${escapeHtml(record.userEmail || record.userId)}</span></td>
                  <td class="prompt-cell">
                    <button class="prompt-toggle" type="button" aria-expanded="false">${escapeHtml(record.prompt)}</button>
                    ${record.errorMessage ? `<br><span class="muted">错误：${escapeHtml(record.errorMessage)}</span>` : ""}
                  </td>
                  <td><strong>${escapeHtml(record.ipAddress || "-")}</strong><br><span class="muted">${escapeHtml(record.userAgent || "-")}</span></td>
                  <td>${record.isPublic ? "是" : "否"}</td>
                  <td><span class="status ${record.status === "failed" ? "failed" : ""}">${escapeHtml(record.status)}</span></td>
                  <td>${fmt(record.createdAt)}</td>
                  <td><button class="tiny danger delete-record" type="button" data-record-id="${escapeHtml(record.id)}">删除</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : `<div class="empty">${state.records.length ? "没有符合筛选条件的记录" : "暂无生图记录"}</div>`}
      </div>
    </div>
  `;
  $("#recordSearch").addEventListener("input", (event) => {
    state.recordFilters.q = event.target.value;
    renderRecords("recordSearch");
  });
  $("#recordStatusFilter").addEventListener("change", (event) => {
    state.recordFilters.status = event.target.value;
    renderRecords();
  });
  $("#recordPublicFilter").addEventListener("change", (event) => {
    state.recordFilters.public = event.target.value;
    renderRecords();
  });
  $("#selectAllRecords")?.addEventListener("change", (event) => {
    setAllVisibleRecords(records, event.target.checked);
    renderRecords();
  });
  $("#bulkDeleteRecords").addEventListener("click", bulkDeleteRecords);
  $("#clearRecordSelection").addEventListener("click", () => {
    state.selectedRecords.clear();
    renderRecords();
  });
  $$(".record-select").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) state.selectedRecords.add(input.dataset.recordId);
      else state.selectedRecords.delete(input.dataset.recordId);
      renderRecords();
    });
  });
  $$(".prompt-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.classList.toggle("expanded");
      button.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  });
  $$(".delete-record").forEach((button) => {
    button.addEventListener("click", () => deleteRecord(button.dataset.recordId));
  });
  if (focusTarget) focusFilterInput(focusTarget);
}

function renderUsers(focusTarget = "") {
  const users = filteredUsers();
  const selectableUsers = users.filter((user) => user.id !== state.user?.id);
  const selectedVisibleCount = selectableUsers.filter((user) => state.selectedUsers.has(user.id)).length;
  const allVisibleSelected = Boolean(selectableUsers.length && selectedVisibleCount === selectableUsers.length);
  $("#panel").innerHTML = `
    <div class="card">
      <h2>用户管理</h2>
      <div class="admin-filters">
        <label>搜索<input id="userSearch" value="${escapeHtml(state.userFilters.q)}" placeholder="昵称 / 邮箱 / 用户 ID"></label>
        <label>角色
          <select id="userRoleFilter">
            <option value="all" ${state.userFilters.role === "all" ? "selected" : ""}>全部角色</option>
            <option value="admin" ${state.userFilters.role === "admin" ? "selected" : ""}>管理员</option>
            <option value="user" ${state.userFilters.role === "user" ? "selected" : ""}>用户</option>
          </select>
        </label>
        <label>状态
          <select id="userStatusFilter">
            <option value="all" ${state.userFilters.status === "all" ? "selected" : ""}>全部状态</option>
            <option value="active" ${state.userFilters.status === "active" ? "selected" : ""}>启用</option>
            <option value="disabled" ${state.userFilters.status === "disabled" ? "selected" : ""}>停用</option>
          </select>
        </label>
        <div class="filter-count">共 ${state.users.length} 人，当前 ${users.length} 人</div>
      </div>
      <div class="bulk-bar">
        <span>已选择 ${state.selectedUsers.size} 人</span>
        <button class="tiny" id="bulkEnableUsers" type="button" ${state.selectedUsers.size ? "" : "disabled"}>批量启用</button>
        <button class="tiny" id="bulkDisableUsers" type="button" ${state.selectedUsers.size ? "" : "disabled"}>批量停用</button>
        <button class="tiny danger" id="bulkDeleteUsers" type="button" ${state.selectedUsers.size ? "" : "disabled"}>批量删除</button>
        <button class="tiny secondary" id="clearUserSelection" type="button" ${state.selectedUsers.size ? "" : "disabled"}>清空选择</button>
      </div>
      <div class="table-wrap">
        ${users.length ? `<table>
          <thead>
            <tr>
              <th class="select-col"><input id="selectAllUsers" type="checkbox" ${allVisibleSelected ? "checked" : ""} aria-label="选择当前筛选的全部用户"></th>
              <th>用户</th>
              <th>角色</th>
              <th>状态</th>
              <th>积分</th>
              <th>增减积分</th>
              <th>注册时间</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${users.map((user) => `
              <tr data-user-id="${escapeHtml(user.id)}">
                <td class="select-col"><input class="user-select" type="checkbox" data-user-id="${escapeHtml(user.id)}" ${state.selectedUsers.has(user.id) ? "checked" : ""} ${user.id === state.user.id ? "disabled" : ""} aria-label="选择用户"></td>
                <td><strong>${escapeHtml(user.name || user.email)}</strong><br><span class="muted">${escapeHtml(user.email)}</span></td>
                <td>
                  <select class="role-input" ${user.id === state.user.id ? "disabled" : ""}>
                    <option value="user" ${user.role === "user" ? "selected" : ""}>用户</option>
                    <option value="admin" ${user.role === "admin" ? "selected" : ""}>管理员</option>
                  </select>
                </td>
                <td>
                  <select class="status-input" ${user.id === state.user.id ? "disabled" : ""}>
                    <option value="active" ${user.status === "active" ? "selected" : ""}>启用</option>
                    <option value="disabled" ${user.status === "disabled" ? "selected" : ""}>停用</option>
                  </select>
                </td>
                <td><input class="credits-input" type="number" min="0" value="${Number(user.credits || 0)}"></td>
                <td><input class="credit-delta-input" type="number" step="1" value="0"></td>
                <td>${fmt(user.createdAt)}</td>
                <td>
                  <div class="row-actions">
                    <button class="tiny save-user" type="button">保存</button>
                    <button class="tiny danger delete-user" type="button" ${user.id === state.user.id ? "disabled" : ""}>删除</button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>` : `<div class="empty">${state.users.length ? "没有符合筛选条件的用户" : "暂无用户"}</div>`}
      </div>
    </div>
  `;
  $("#userSearch").addEventListener("input", (event) => {
    state.userFilters.q = event.target.value;
    renderUsers("userSearch");
  });
  $("#userRoleFilter").addEventListener("change", (event) => {
    state.userFilters.role = event.target.value;
    renderUsers();
  });
  $("#userStatusFilter").addEventListener("change", (event) => {
    state.userFilters.status = event.target.value;
    renderUsers();
  });
  $("#selectAllUsers")?.addEventListener("change", (event) => {
    setAllVisibleUsers(users, event.target.checked);
    renderUsers();
  });
  $("#bulkEnableUsers").addEventListener("click", () => bulkUpdateUsers("active"));
  $("#bulkDisableUsers").addEventListener("click", () => bulkUpdateUsers("disabled"));
  $("#bulkDeleteUsers").addEventListener("click", bulkDeleteUsers);
  $("#clearUserSelection").addEventListener("click", () => {
    state.selectedUsers.clear();
    renderUsers();
  });
  $$(".user-select").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) state.selectedUsers.add(input.dataset.userId);
      else state.selectedUsers.delete(input.dataset.userId);
      renderUsers();
    });
  });
  $$(".save-user").forEach((button) => {
    button.addEventListener("click", () => saveUser(button.closest("tr")));
  });
  $$(".delete-user").forEach((button) => {
    button.addEventListener("click", () => deleteUser(button.closest("tr")));
  });
  if (focusTarget) focusFilterInput(focusTarget);
}

function renderSettings() {
  const settings = state.settings || {};
  $("#panel").innerHTML = `
    <div class="grid">
      <section class="card">
        <h2>接口设置</h2>
        <form id="settingsForm" class="form">
          <label>OpenAI API Key<input id="apiKeyInput" type="password" placeholder="${escapeHtml(settings.apiKeyMask || "不修改则留空")}"></label>
        <label>API 地址<input id="apiBaseUrlInput" value="${escapeHtml(settings.apiBaseUrl || "")}" placeholder="AI API base URL"></label>
          <label>模型<input id="modelInput" value="${escapeHtml(settings.model || "GPT-IMAGE-2")}"></label>
          <label>注册送积分<input id="defaultCreditsInput" type="number" min="0" value="${Number(settings.defaultCredits ?? 10)}"></label>
          <label>每张图消耗积分<input id="generationCreditCostInput" type="number" min="0" value="${Number(settings.generationCreditCost ?? 1)}"></label>
          <label>单次最大张数<input id="maxImagesInput" type="number" min="1" max="4" value="${Number(settings.maxImagesPerRequest ?? 1)}"></label>
          <label><input id="allowRegistrationInput" type="checkbox" ${settings.allowRegistration ? "checked" : ""}> 开放注册</label>
          <label><input id="requireApprovalInput" type="checkbox" ${settings.requireApproval ? "checked" : ""}> 新用户需要后台启用</label>
          <button class="primary" type="submit">保存设置</button>
          <button id="clearKeyBtn" class="secondary" type="button">清除 API Key</button>
        </form>
      </section>
      <section class="card">
        <h2>说明</h2>
        <p class="muted">前台生图会按“每张图消耗积分”扣除积分；用户每天可在前台签到领取 1 积分。用户积分可在用户管理中直接设置，也可以用增减积分输入框做临时加减。</p>
      </section>
    </div>
  `;
  $("#settingsForm").addEventListener("submit", saveSettings);
  $("#clearKeyBtn").addEventListener("click", clearKey);
}

async function loadPanel() {
  if (state.view === "records") {
    const data = await api("/api/admin/generations?limit=200");
    state.records = data.records || [];
  } else if (state.view === "users") {
    const data = await api("/api/admin/users");
    state.users = data.users || [];
  } else {
    state.settings = await api("/api/admin/settings");
  }
  pruneSelections();
}

async function login(event) {
  event.preventDefault();
  try {
    await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: $("#emailInput").value,
        password: $("#passwordInput").value
      })
    });
    await bootstrap();
  } catch (error) {
    toast(error.message);
  }
}

async function logout() {
  await api("/api/auth/logout", { method: "POST" }).catch(() => null);
  state.user = null;
  renderLogin();
}

async function saveUser(row) {
  try {
    await api(`/api/admin/users/${row.dataset.userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        role: $(".role-input", row).value,
        status: $(".status-input", row).value,
        credits: Number($(".credits-input", row).value || 0),
        creditDelta: Number($(".credit-delta-input", row).value || 0)
      })
    });
    toast("用户已保存");
    await loadPanel();
    renderUsers();
  } catch (error) {
    toast(error.message);
  }
}

async function deleteUser(row) {
  const name = $("strong", row)?.textContent || "该用户";
  if (!confirm(`确定删除 ${name} 吗？该用户的生图记录和图片文件也会一起删除。`)) return;
  try {
    await api(`/api/admin/users/${row.dataset.userId}`, { method: "DELETE" });
    state.selectedUsers.delete(row.dataset.userId);
    toast("用户已删除");
    await loadPanel();
    renderUsers();
  } catch (error) {
    toast(error.message);
  }
}

async function deleteRecord(id) {
  if (!confirm("确定删除这条生图记录吗？对应图片文件也会一起删除。")) return;
  try {
    await api(`/api/admin/generations/${id}`, { method: "DELETE" });
    state.selectedRecords.delete(id);
    toast("生图记录已删除");
    await loadPanel();
    renderRecords();
  } catch (error) {
    toast(error.message);
  }
}

async function bulkDeleteRecords() {
  const ids = [...state.selectedRecords];
  if (!ids.length) return;
  const confirmed = await confirmInline({
    title: "批量删除生图记录",
    message: `将删除选中的 ${ids.length} 条生图记录，对应图片文件也会一起删除。`,
    confirmText: "删除记录"
  });
  if (!confirmed) return;
  try {
    await Promise.all(ids.map((id) => api(`/api/admin/generations/${encodeURIComponent(id)}`, { method: "DELETE" })));
    state.selectedRecords.clear();
    toast("已批量删除生图记录");
    await loadPanel();
    renderRecords();
  } catch (error) {
    toast(error.message);
    await loadPanel();
    renderRecords();
  }
}

async function bulkDeleteUsers() {
  const ids = [...state.selectedUsers].filter((id) => id !== state.user?.id);
  if (!ids.length) return;
  const confirmed = await confirmInline({
    title: "批量删除用户",
    message: `将删除选中的 ${ids.length} 个用户，这些用户的生图记录和图片文件也会一起删除。`,
    confirmText: "删除用户"
  });
  if (!confirmed) return;
  try {
    await Promise.all(ids.map((id) => api(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" })));
    state.selectedUsers.clear();
    toast("已批量删除用户");
    await loadPanel();
    renderUsers();
  } catch (error) {
    toast(error.message);
    await loadPanel();
    renderUsers();
  }
}

async function bulkUpdateUsers(status) {
  const ids = [...state.selectedUsers].filter((id) => id !== state.user?.id);
  if (!ids.length) return;
  const label = status === "active" ? "启用" : "停用";
  if (!confirm(`确定批量${label}选中的 ${ids.length} 个用户吗？`)) return;
  try {
    await Promise.all(ids.map((id) => api(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    })));
    toast(`已批量${label}用户`);
    await loadPanel();
    renderUsers();
  } catch (error) {
    toast(error.message);
    await loadPanel();
    renderUsers();
  }
}

async function saveSettings(event) {
  event.preventDefault();
  try {
    state.settings = await api("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({
        openaiApiKey: $("#apiKeyInput").value.trim(),
        apiBaseUrl: $("#apiBaseUrlInput").value.trim(),
        model: $("#modelInput").value.trim(),
        defaultCredits: Number($("#defaultCreditsInput").value || 0),
        generationCreditCost: Number($("#generationCreditCostInput").value || 0),
        maxImagesPerRequest: Number($("#maxImagesInput").value || 1),
        allowRegistration: $("#allowRegistrationInput").checked,
        requireApproval: $("#requireApprovalInput").checked
      })
    });
    toast("设置已保存");
    renderSettings();
  } catch (error) {
    toast(error.message);
  }
}

async function clearKey() {
  try {
    state.settings = await api("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ clearApiKey: true })
    });
    toast("API Key 已清除");
    renderSettings();
  } catch (error) {
    toast(error.message);
  }
}

async function bootstrap() {
  try {
    const data = await api("/api/auth/me");
    state.user = data.user;
    state.firstRun = data.firstRun;
    if (!state.user) return renderLogin();
    if (state.user.role !== "admin") return renderDenied();
    await loadPanel();
    renderAdmin();
  } catch (error) {
    toast(error.message);
    renderLogin();
  }
}

$("#logoutBtn").addEventListener("click", logout);
bootstrap();
