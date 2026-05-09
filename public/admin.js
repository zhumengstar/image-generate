const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  user: null,
  firstRun: false,
  view: "records",
  settings: null,
  modelOptions: {
    image: [],
    polish: []
  },
  users: [],
  records: [],
  recordFilters: { q: "", status: "all", public: "all" },
  userFilters: { q: "", role: "all", status: "all" },
  recordSort: { key: "createdAt", dir: "desc" },
  userSort: { key: "role", dir: "asc" },
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

function modelFieldConfig(kind) {
  if (kind === "polish") {
    return {
      input: "#promptPolishModelInput",
      button: "#loadPolishModelsBtn",
      result: "#polishModelResult",
      endpoint: "/api/admin/settings/models/polish",
      label: "娑﹁壊妯″瀷"
    };
  }
  return {
    input: "#modelInput",
    button: "#loadImageModelsBtn",
    result: "#imageModelResult",
    endpoint: "/api/admin/settings/models/image",
    label: "Image 妯″瀷"
  };
}

function renderModelOptions(kind, models = []) {
  const config = modelFieldConfig(kind);
  const select = $(config.input);
  if (!select) return;
  const currentValue = String(select.value || "").trim();
  const uniqueModels = [...new Set((models || []).map((model) => String(model || "").trim()).filter(Boolean))];
  const options = currentValue && !uniqueModels.includes(currentValue)
    ? [currentValue, ...uniqueModels]
    : uniqueModels;
  state.modelOptions[kind] = uniqueModels;
  if (!options.length) return;
  select.innerHTML = options.map((model) => `<option value="${escapeHtml(model)}">${escapeHtml(model)}</option>`).join("");
  select.value = currentValue || options[0];
}

function refreshModelOptionsFromState() {
  renderModelOptions("image", state.modelOptions.image || []);
  renderModelOptions("polish", state.modelOptions.polish || []);
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

function openRecordImagePreview(record) {
  if (!record?.imageUrl) return;
  const layer = document.createElement("div");
  layer.className = "image-preview-layer";
  layer.innerHTML = `
    <section class="image-preview-dialog" role="dialog" aria-modal="true" aria-label="图片预览">
      <button class="preview-close" type="button" aria-label="关闭"><i class="ri-close-line"></i></button>
      <img src="${escapeHtml(record.imageUrl)}" alt="${escapeHtml(record.prompt || "图片预览")}">
      <div class="preview-meta">
        <p>${escapeHtml(record.prompt || "")}</p>
      </div>
    </section>
  `;

  const close = () => {
    document.removeEventListener("keydown", onKeydown);
    layer.remove();
  };
  const onKeydown = (event) => {
    if (event.key === "Escape") close();
  };

  layer.addEventListener("click", (event) => {
    if (event.target === layer) close();
  });
  $(".preview-close", layer).addEventListener("click", close);
  document.addEventListener("keydown", onKeydown);
  document.body.appendChild(layer);
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

function compareValues(left, right, dir = "asc") {
  const direction = dir === "desc" ? -1 : 1;
  const leftValue = left ?? "";
  const rightValue = right ?? "";
  let result;

  if (typeof leftValue === "number" || typeof rightValue === "number") {
    result = Number(leftValue || 0) - Number(rightValue || 0);
  } else {
    result = String(leftValue).localeCompare(String(rightValue), "zh-CN", {
      numeric: true,
      sensitivity: "base"
    });
  }

  return result * direction;
}

function sortButton(label, key, sortState) {
  const active = sortState.key === key;
  const arrow = active ? (sortState.dir === "asc" ? "↑" : "↓") : "↕";
  return `<button class="sort-button ${active ? "active" : ""}" type="button" data-sort="${escapeHtml(key)}" aria-label="按${escapeHtml(label)}排序">${escapeHtml(label)} <span>${arrow}</span></button>`;
}

function setSort(target, key) {
  const sortState = target === "records" ? state.recordSort : state.userSort;
  if (sortState.key === key) {
    sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
  } else {
    sortState.key = key;
    sortState.dir = key === "createdAt" ? "desc" : "asc";
  }
  if (target === "records") renderRecords();
  else renderUsers();
}

function recordSortValue(record, key) {
  const values = {
    user: record.userName || record.userEmail || record.userId || "",
    prompt: record.prompt || "",
    ip: record.ipAddress || record.userAgent || "",
    public: record.isPublic ? 1 : 0,
    status: record.status || "",
    createdAt: record.createdAt ? new Date(record.createdAt).getTime() : 0
  };
  return values[key] ?? "";
}

function userSortValue(user, key) {
  const roleRank = user.role === "admin" ? 0 : 1;
  const statusRank = user.status === "active" ? 0 : 1;
  const values = {
    user: user.name || user.email || "",
    role: roleRank,
    status: statusRank,
    credits: Number(user.credits || 0),
    usedCredits: Number(user.usedCredits || 0),
    createdAt: user.createdAt ? new Date(user.createdAt).getTime() : 0
  };
  return values[key] ?? "";
}

function filteredRecords() {
  const filters = state.recordFilters;
  const records = state.records.filter((record) => {
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
  return records.sort((left, right) => {
    const primary = compareValues(
      recordSortValue(left, state.recordSort.key),
      recordSortValue(right, state.recordSort.key),
      state.recordSort.dir
    );
    return primary || compareValues(recordSortValue(left, "createdAt"), recordSortValue(right, "createdAt"), "desc");
  });
}

function filteredUsers() {
  const filters = state.userFilters;
  const users = state.users.filter((user) => {
    if (filters.role !== "all" && user.role !== filters.role) return false;
    if (filters.status !== "all" && user.status !== filters.status) return false;
    return matchesSearch([user.name, user.email, user.role, user.status, user.id], filters.q);
  });
  return users.sort((left, right) => {
    const primary = compareValues(
      userSortValue(left, state.userSort.key),
      userSortValue(right, state.userSort.key),
      state.userSort.dir
    );
    return primary || compareValues(userSortValue(left, "createdAt"), userSortValue(right, "createdAt"), "desc");
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
          <table class="records-table">
            <thead>
              <tr>
                <th class="select-col"><input id="selectAllRecords" type="checkbox" ${allVisibleSelected ? "checked" : ""} aria-label="选择当前筛选的全部记录"></th>
                <th>图片</th>
                <th>${sortButton("用户", "user", state.recordSort)}</th>
                <th>${sortButton("提示词", "prompt", state.recordSort)}</th>
                <th>${sortButton("IP / UA", "ip", state.recordSort)}</th>
                <th>${sortButton("公开", "public", state.recordSort)}</th>
                <th>${sortButton("状态", "status", state.recordSort)}</th>
                <th>${sortButton("时间", "createdAt", state.recordSort)}</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${records.map((record) => `
                <tr>
                  <td class="select-col"><input class="record-select" type="checkbox" data-record-id="${escapeHtml(record.id)}" ${state.selectedRecords.has(record.id) ? "checked" : ""} aria-label="选择记录"></td>
                  <td>${record.imageUrl ? `<button class="thumb-button" type="button" data-preview-record="${escapeHtml(record.id)}" aria-label="预览图片"><img class="thumb" src="${escapeHtml(record.imageUrl)}" alt=""></button>` : `<div class="thumb"></div>`}</td>
                  <td class="user-cell"><strong>${escapeHtml(record.userName || record.userEmail || "未知用户")}</strong><br><span class="muted">${escapeHtml(record.userEmail || record.userId)}</span></td>
                  <td class="prompt-cell">
                    <button class="prompt-toggle" type="button" aria-expanded="false">${escapeHtml(record.prompt)}</button>
                    ${record.errorMessage ? `<br><span class="muted">错误：${escapeHtml(record.errorMessage)}</span>` : ""}
                  </td>
                  <td class="meta-cell"><strong>${escapeHtml(record.ipAddress || "-")}</strong><span>${escapeHtml(record.userAgent || "-")}</span></td>
                  <td class="center-cell">${record.isPublic ? "是" : "否"}</td>
                  <td><span class="status ${record.status === "failed" ? "failed" : ""}">${escapeHtml(record.status)}</span></td>
                  <td>${fmt(record.createdAt)}</td>
                  <td><button class="tiny danger delete-record action-button" type="button" data-record-id="${escapeHtml(record.id)}">删除</button></td>
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
  $$("[data-sort]", $("#panel")).forEach((button) => {
    button.addEventListener("click", () => setSort("records", button.dataset.sort));
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
  $$("[data-preview-record]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = state.records.find((item) => String(item.id) === button.dataset.previewRecord);
      openRecordImagePreview(record);
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
              <th>${sortButton("用户", "user", state.userSort)}</th>
              <th>${sortButton("角色", "role", state.userSort)}</th>
              <th>${sortButton("状态", "status", state.userSort)}</th>
              <th>${sortButton("积分", "credits", state.userSort)}</th>
              <th>${sortButton("使用积分量", "usedCredits", state.userSort)}</th>
              <th>${sortButton("注册时间", "createdAt", state.userSort)}</th>
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
                <td><strong>${Number(user.usedCredits || 0)}</strong></td>
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
  $$("[data-sort]", $("#panel")).forEach((button) => {
    button.addEventListener("click", () => setSort("users", button.dataset.sort));
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
    <div class="settings-layout">
      <section class="card settings-card">
        <div class="settings-title">
          <div>
            <span class="eyebrow">API Console</span>
            <h2>接口设置</h2>
            <p>统一配置图片生成接口、提示词 AI 润色接口、积分规则和账号策略。</p>
          </div>
          <div class="settings-status">
            <span class="settings-badge ${settings.hasApiKey ? "" : "warning"}">${settings.hasApiKey ? "图片接口已配置" : "图片接口未配置"}</span>
            <span class="settings-badge ${settings.promptPolishKeyMask && settings.promptPolishBaseUrl ? "" : "warning"}">${settings.promptPolishKeyMask && settings.promptPolishBaseUrl ? "润色接口已配置" : "润色接口未配置"}</span>
          </div>
        </div>
        <form id="settingsForm" class="settings-form">
          <div class="settings-section-head">
            <i class="ri-image-add-line"></i>
            <div>
              <h3>Image 图片生成接口</h3>
              <p>用于首页生成、图片编辑和重新生成。</p>
            </div>
          </div>
          <div class="settings-group api-group">
            <label>Image API Key<input id="apiKeyInput" type="password" placeholder="${escapeHtml(settings.apiKeyMask ? `当前：${settings.apiKeyMask}` : "粘贴图片生成接口 Key")}"></label>
            <label>Image API 地址<input id="apiBaseUrlInput" value="${escapeHtml(settings.apiBaseUrl || "")}" placeholder="https://api.example.com 或 https://api.example.com/v1"></label>
            <label class="model-field">
              <span>Image 模型</span>
              <div class="model-picker">
                <select id="modelInput">
                  <option value="${escapeHtml(settings.model || "GPT-IMAGE-2")}">${escapeHtml(settings.model || "GPT-IMAGE-2")}</option>
                </select>
                <i class="ri-arrow-down-s-line"></i>
              </div>
            </label>
            <div class="settings-test-row">
              <div class="settings-action-group">
                <button id="testImageApiBtn" class="secondary" type="button"><i class="ri-pulse-line"></i>测试接口</button>
                <button id="loadImageModelsBtn" class="secondary accent" type="button"><i class="ri-refresh-line"></i>拉取模型</button>
              </div>
              <div class="settings-result-group">
                <span id="imageApiTestResult">会发起一次最小生图请求，不会保存到图库。</span>
                <span id="imageModelResult">可从接口拉取全部 Image 模型并选择。</span>
              </div>
            </div>
          </div>

          <div class="settings-section-head">
            <i class="ri-sparkling-2-line"></i>
            <div>
              <h3>大模型 AI 润色接口</h3>
              <p>用于生成按钮旁边的提示词润色，可和图片接口使用不同服务商。</p>
            </div>
          </div>
          <div class="settings-group api-group">
            <label>大模型 API Key<input id="promptPolishApiKeyInput" type="password" placeholder="${escapeHtml(settings.promptPolishKeyMask ? `当前：${settings.promptPolishKeyMask}` : "粘贴 AI 润色接口 Key")}"></label>
            <label>大模型 API 地址<input id="promptPolishBaseUrlInput" value="${escapeHtml(settings.promptPolishBaseUrl || "")}" placeholder="https://cliproxy.example.com 或 https://api.example.com/v1"></label>
            <label class="model-field">
              <span>大模型模型</span>
              <div class="model-picker">
                <select id="promptPolishModelInput">
                  <option value="${escapeHtml(settings.promptPolishModel || "gpt-5.5")}">${escapeHtml(settings.promptPolishModel || "gpt-5.5")}</option>
                </select>
                <i class="ri-arrow-down-s-line"></i>
              </div>
            </label>
            <div class="settings-test-row">
              <div class="settings-action-group">
                <button id="testPolishApiBtn" class="secondary" type="button"><i class="ri-pulse-line"></i>测试接口</button>
                <button id="loadPolishModelsBtn" class="secondary accent" type="button"><i class="ri-refresh-line"></i>拉取模型</button>
              </div>
              <div class="settings-result-group">
                <span id="polishApiTestResult">会发起一次提示词润色请求。</span>
                <span id="polishModelResult">可从接口拉取全部大模型并选择。</span>
              </div>
            </div>
          </div>

          <div class="settings-group compact-fields">
            <h3>积分与生成限制</h3>
            <label>注册送积分<input id="defaultCreditsInput" type="number" min="0" value="${Number(settings.defaultCredits ?? 10)}"></label>
            <label>每张图消耗积分<input id="generationCreditCostInput" type="number" min="0" value="${Number(settings.generationCreditCost ?? 1)}"></label>
            <label>单次最大张数<input id="maxImagesInput" type="number" min="1" max="4" value="${Number(settings.maxImagesPerRequest ?? 1)}"></label>
          </div>
          <div class="settings-group">
            <h3>账号策略</h3>
            <label class="switch-row">
              <input id="allowRegistrationInput" type="checkbox" ${settings.allowRegistration ? "checked" : ""}>
              <span></span>
              <strong>开放注册</strong>
              <small>允许新用户自行注册账号。</small>
            </label>
            <label class="switch-row">
              <input id="requireApprovalInput" type="checkbox" ${settings.requireApproval ? "checked" : ""}>
              <span></span>
              <strong>新用户需要后台启用</strong>
              <small>注册后先停用，由管理员审核启用。</small>
            </label>
          </div>
          <div class="settings-actions">
            <button class="primary" type="submit">保存设置</button>
            <button id="clearKeyBtn" class="secondary" type="button">清除 Image Key</button>
            <button id="clearPolishKeyBtn" class="secondary" type="button">清除润色 Key</button>
          </div>
        </form>
      </section>
      <section class="card settings-help">
        <div class="settings-help-head">
          <span class="eyebrow">Overview</span>
          <h2>配置说明</h2>
        </div>
        <div class="settings-summary">
          <div>
            <span>Image 模型</span>
            <strong>${escapeHtml(settings.model || "GPT-IMAGE-2")}</strong>
          </div>
          <div>
            <span>润色模型</span>
            <strong>${escapeHtml(settings.promptPolishModel || "gpt-5.5")}</strong>
          </div>
          <div>
            <span>每图积分</span>
            <strong>${Number(settings.generationCreditCost ?? 1)}</strong>
          </div>
        </div>
        <div class="help-list">
          <p><strong>图片接口</strong><span>负责生图和编辑图。API 地址支持填写服务商根地址、/v1、/images/generations 或 /images/edits。</span></p>
          <p><strong>大模型接口</strong><span>负责“润色”按钮。API 地址支持服务商根地址、/v1 或 /chat/completions。</span></p>
          <p><strong>Key 保存规则</strong><span>输入框留空表示保留当前 Key；点击清除按钮才会删除对应 Key。</span></p>
          <p><strong>积分扣除</strong><span>前台生图会按“每张图消耗积分”扣除积分，失败会自动退回。</span></p>
          <p><strong>每日签到</strong><span>用户每天可在前台签到领取 1 积分。</span></p>
        </div>
      </section>
    </div>
  `;
  $("#settingsForm").addEventListener("submit", saveSettings);
  $("#clearKeyBtn").addEventListener("click", clearKey);
  $("#clearPolishKeyBtn").addEventListener("click", clearPolishKey);
  $("#testImageApiBtn").addEventListener("click", () => testAdminApi("image"));
  $("#testPolishApiBtn").addEventListener("click", () => testAdminApi("polish"));
  $("#loadImageModelsBtn").addEventListener("click", () => loadProviderModels("image"));
  $("#loadPolishModelsBtn").addEventListener("click", () => loadProviderModels("polish"));
  refreshModelOptionsFromState();
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
    state.modelOptions.image = state.settings.imageModels || [];
    state.modelOptions.polish = state.settings.polishModels || [];
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
        credits: Number($(".credits-input", row).value || 0)
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
        promptPolishApiKey: $("#promptPolishApiKeyInput").value.trim(),
        promptPolishBaseUrl: $("#promptPolishBaseUrlInput").value.trim(),
        promptPolishModel: $("#promptPolishModelInput").value.trim(),
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

function readSettingsForm() {
  return {
    openaiApiKey: $("#apiKeyInput").value.trim(),
    apiBaseUrl: $("#apiBaseUrlInput").value.trim(),
    model: $("#modelInput").value.trim(),
    promptPolishApiKey: $("#promptPolishApiKeyInput").value.trim(),
    promptPolishBaseUrl: $("#promptPolishBaseUrlInput").value.trim(),
    promptPolishModel: $("#promptPolishModelInput").value.trim(),
    defaultCredits: Number($("#defaultCreditsInput").value || 0),
    generationCreditCost: Number($("#generationCreditCostInput").value || 0),
    maxImagesPerRequest: Number($("#maxImagesInput").value || 1),
    allowRegistration: $("#allowRegistrationInput").checked,
    requireApproval: $("#requireApprovalInput").checked
  };
}

async function loadProviderModels(kind) {
  const config = modelFieldConfig(kind);
  const button = $(config.button);
  const result = $(config.result);
  const originalHtml = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<i class="ri-loader-4-line"></i>加载中...';
  result.className = "testing";
  result.textContent = "正在拉取模型列表...";
  try {
    const data = await api(config.endpoint, {
      method: "POST",
      body: JSON.stringify(readSettingsForm())
    });
    if (data.settings) {
      state.settings = data.settings;
      state.modelOptions.image = data.settings.imageModels || state.modelOptions.image || [];
      state.modelOptions.polish = data.settings.polishModels || state.modelOptions.polish || [];
    }
    renderModelOptions(kind, data.models || []);
    const count = Array.isArray(data.models) ? data.models.length : 0;
    result.className = "success";
    result.textContent = `已拉取 ${count} 个模型${data.endpoint ? ` · ${data.endpoint}` : ""}`;
    toast(result.textContent);
  } catch (error) {
    result.className = "error";
    result.textContent = `拉取失败：${error.message}`;
    toast(error.message);
  } finally {
    button.disabled = false;
    button.innerHTML = originalHtml;
  }
}

async function testAdminApi(kind) {
  const isImage = kind === "image";
  const button = isImage ? $("#testImageApiBtn") : $("#testPolishApiBtn");
  const result = isImage ? $("#imageApiTestResult") : $("#polishApiTestResult");
  const originalText = button.innerHTML;
  button.disabled = true;
  button.innerHTML = `<i class="ri-loader-4-line"></i>测试中...`;
  result.className = "testing";
  result.textContent = isImage ? "正在测试 Image 接口..." : "正在测试润色接口...";
  try {
    const data = await api(isImage ? "/api/admin/settings/test-image" : "/api/admin/settings/test-polish", {
      method: "POST",
      body: JSON.stringify(readSettingsForm())
    });
    const seconds = data.elapsedMs ? `${(data.elapsedMs / 1000).toFixed(1)}s` : "";
    result.className = "success";
    result.textContent = isImage
      ? `Image 接口测试通过 ${seconds}`
      : `润色接口测试通过 ${seconds}`;
    toast(result.textContent);
  } catch (error) {
    result.className = "error";
    result.textContent = `测试失败：${error.message}`;
    toast(error.message);
  } finally {
    button.disabled = false;
    button.innerHTML = originalText;
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

async function clearPolishKey() {
  try {
    state.settings = await api("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ clearPromptPolishKey: true })
    });
    toast("润色 Key 已清除");
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
