// Referencias principales de la interfaz y estado de la sesión actual.
const viewContainer = document.querySelector("#view-container");
const breadcrumbTitle = document.querySelector("#breadcrumb-title");
const toast = document.querySelector("#toast");
let activeRole = "admin";
const readAlerts = new Set();
let alertFilter = "all";
let alertSearch = "";
let liveAlerts = [];
let liveAlertSequence = 0;
let activeView = "dashboard";
const teamStateKey = "agrosmart-team-state";
const teamChannel = "agrosmart-team-realtime";
const teamClientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const realtimeChannel = "BroadcastChannel" in window ? new BroadcastChannel(teamChannel) : null;
// Perfiles disponibles y pantalla inicial asociada a cada rol.
const roleProfiles = {
  admin: {
    name: "Mariana Ríos",
    initials: "MR",
    label: "Administradora de Finca",
    home: "dashboard",
  },
  superAdmin: {
    name: "Andrés Gómez",
    initials: "AG",
    label: "SuperAdmin",
    home: "superadmin",
  },
  usuario: {
    name: "Carlos Méndez",
    initials: "CM",
    label: "Trabajador de Campo",
    home: "field-user",
  },
};
// Datos locales usados por las vistas de administración y sus formularios.
let managedUsers = [
  {
    id: 1,
    name: "Andrés Gómez",
    email: "andres@agrosmart.co",
    password: "Agro2024!",
    role: "SuperAdmin",
    roleKey: "superAdmin",
    status: "Activo",
    initials: "AG",
  },
  {
    id: 2,
    name: "Mariana Ríos",
    email: "mariana@fincaelporvenir.co",
    password: "Finca2024!",
    role: "Administrador de Finca",
    roleKey: "admin",
    status: "Activo",
    initials: "MR",
  },
  {
    id: 3,
    name: "Carlos Méndez",
    email: "carlos@fincaelporvenir.co",
    password: "Campo2024!",
    role: "Trabajador de Campo",
    roleKey: "usuario",
    status: "Activo",
    initials: "CM",
  },
];
let managedCrops = [
  {
    id: 1,
    name: "Café arábica · Caturra",
    lot: "Lote Norte 03",
    area: "2.4 ha",
    stage: "Floración",
  },
  {
    id: 2,
    name: "Maíz amarillo · ICA V-305",
    lot: "Lote Sur 01",
    area: "1.8 ha",
    stage: "Desarrollo",
  },
  {
    id: 3,
    name: "Aguacate Hass",
    lot: "Lote Este 02",
    area: "3.1 ha",
    stage: "Cuajado",
  },
];
// Cosechas registradas desde la operación de la finca.
let managedHarvests = [
  {
    id: 1,
    date: "22 Sep",
    crop: "Tomate chonto",
    lot: "Invernadero 01",
    quantity: "420 kg",
    quality: "Premium",
  },
  {
    id: 2,
    date: "14 Sep",
    crop: "Aguacate Hass",
    lot: "Este 02",
    quantity: "1.2 t",
    quality: "Exportación",
  },
];
// Existencias de insumos mostradas en las vistas de bodega.
let managedInventory = [
  { id: 1, name: "Fertilizante NPK 15-15-15", category: "Fertilizantes", stock: "124 kg", status: "En stock", updated: "Hoy, 08:10" },
  { id: 2, name: "Biofungicida Trichoderma", category: "Protección", stock: "18 L", status: "Sin stock", updated: "Ayer" },
  { id: 3, name: "Combustible maquinaria", category: "Operación", stock: "240 L", status: "En stock", updated: "20 Sep" },
];
// Tareas operativas que pueden asignarse y cambiar de estado.
let managedTasks = [
  { id: 1, text: "Riego Lote Norte 03", person: "Carlos Méndez", status: "Pendiente", icon: "circle", tone: "harvest" },
  { id: 2, text: "Inspección de plagas", person: "Andrea Ruiz", status: "Pendiente", icon: "circle", tone: "harvest" },
  { id: 3, text: "Aplicar fertilizante", person: "Luis Gómez", status: "Pendiente", icon: "circle", tone: "harvest" },
];
// Bodegas disponibles y responsables de cada ubicación.
let managedWarehouses = [
  { id: 1, name: "Bodega principal", location: "Finca El Porvenir", responsible: "Mariana Ríos", status: "Operativa" },
  { id: 2, name: "Almacén de herramientas", location: "Lote Norte 03", responsible: "Carlos Méndez", status: "Operativa" },
];
// Personas que participan en las actividades de campo.
let managedTeam = [
  { id: 1, name: "Carlos Méndez", role: "Supervisor de campo", phone: "300 555 0142", status: "offline", lastSeen: "Sin actividad" },
  { id: 2, name: "Andrea Ruiz", role: "Técnica agrícola", phone: "300 555 0186", status: "offline", lastSeen: "Sin actividad" },
  { id: 3, name: "Luis Gómez", role: "Operario de cultivo", phone: "300 555 0129", status: "offline", lastSeen: "Sin actividad" },
];
// Ventas registradas para el seguimiento comercial.
let managedSales = [
  { id: 1, date: "20 Sep", buyer: "Cooperativa Andina", product: "Café arábica", quantity: "680 kg", total: "$9.2M", status: "Pagada" },
  { id: 2, date: "12 Sep", buyer: "Frutas del Valle", product: "Aguacate Hass", quantity: "1.2 t", total: "$7.8M", status: "Despachada" },
  { id: 3, date: "05 Sep", buyer: "Mercado Central", product: "Tomate chonto", quantity: "420 kg", total: "$1.4M", status: "Pendiente" },
];
// Historial local de cambios y acciones relevantes.
let managedAudits = [
  { id: 1, user: "Mariana Ríos", action: "Actualizó el lote Norte 03", date: "Hoy, 09:32" },
  { id: 2, user: "Carlos Méndez", action: "Registró actividad de riego", date: "Hoy, 06:42" },
  { id: 3, user: "AgroSmart", action: "Sincronizó datos de sensores", date: "Ayer, 18:20" },
  { id: 4, user: "Mariana Ríos", action: "Creó una nueva tarea", date: "Ayer, 14:10" },
];
let managedCalendarEvents = [
  { id: 1, day: 4, label: "Riego · Norte", tone: "sowing" },
  { id: 2, day: 9, label: "Fertilizar", tone: "growing" },
  { id: 3, day: 15, label: "Cosecha", tone: "harvest" },
  { id: 4, day: 22, label: "Inspección", tone: "growing" },
];

// Recupera equipo y tareas compartidos entre pestañas del mismo dispositivo.
function loadTeamState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(teamStateKey));
    if (Array.isArray(savedState?.team)) managedTeam = savedState.team;
    if (Array.isArray(savedState?.tasks)) managedTasks = savedState.tasks;
    if (Array.isArray(savedState?.calendar)) managedCalendarEvents = savedState.calendar;
  } catch {
    localStorage.removeItem(teamStateKey);
  }
}

// Publica cambios inmediatamente y conserva una copia local para el respaldo.
function publishTeamState() {
  const state = {
    team: managedTeam,
    tasks: managedTasks,
    calendar: managedCalendarEvents,
    source: teamClientId,
  };
  localStorage.setItem(teamStateKey, JSON.stringify(state));
  realtimeChannel?.postMessage({ type: "team-state", ...state });
}

// Aplica cambios recibidos por BroadcastChannel o por el evento de almacenamiento.
function receiveTeamState(state) {
  if (!state || state.source === teamClientId) return;
  if (Array.isArray(state.team)) managedTeam = state.team;
  if (Array.isArray(state.tasks)) managedTasks = state.tasks;
  if (Array.isArray(state.calendar)) managedCalendarEvents = state.calendar;
  if (activeView === "dashboard") updateDashboardTeamSummary();
  if (activeView === "team" || activeView === "tasks") updateTeamView(activeView);
  if (activeView === "alerts") renderView("alerts");
  if (activeView === "calendar") renderView("calendar");
  showToast("Equipo actualizado en tiempo real");
}

// Actualiza la presencia del trabajador activo y la anuncia al resto de sesiones.
function updateTeamPresence(status = "online") {
  const profile = roleProfiles[activeRole];
  const member = managedTeam.find((person) => person.name === profile?.name);
  if (!member) return;
  member.status = status;
  member.lastSeen = status === "online" ? "En línea ahora" : "Última conexión ahora";
  publishTeamState();
  if (activeView === "dashboard") updateDashboardTeamSummary();
  if (activeView === "team") updateTeamView("team");
}

realtimeChannel?.addEventListener("message", (event) => receiveTeamState(event.data));
window.addEventListener("storage", (event) => {
  if (event.key !== teamStateKey || !event.newValue) return;
  try {
    receiveTeamState(JSON.parse(event.newValue));
  } catch {
    // Ignora valores incompletos escritos por otra pestaña.
  }
});

// Utilidades para construir iconos y paneles reutilizables en las vistas.
const icon = (name) => `<i data-lucide="${name}"></i>`;
const surface = (title, content, action = "") =>
  `<section class="surface"><div class="surface-header"><h2>${title}</h2>${action}</div>${content}</section>`;

// Devuelve el nombre del mes actual con formato legible para el calendario.
function currentCalendarMonthLabel() {
  const label = new Date().toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Construye una cuadrícula real y marca siempre la fecha del sistema como today.
function renderCalendarGrid() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentDay = today.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const weekdays = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  const headers = weekdays.map((day) => `<div class="day-name">${day}</div>`).join("");
  const days = Array.from({ length: cellCount }, (_, index) => {
    const dayNumber = index - firstWeekday + 1;
    const isPreviousMonth = dayNumber < 1;
    const isNextMonth = dayNumber > daysInMonth;
    const visibleDay = isPreviousMonth
      ? previousMonthDays + dayNumber
      : isNextMonth
        ? dayNumber - daysInMonth
        : dayNumber;
    const eventMarkup = managedCalendarEvents
      .filter(
        (event) =>
          event.day === dayNumber &&
          (event.year === undefined || event.year === year) &&
          (event.month === undefined || event.month === month) &&
          !isPreviousMonth &&
          !isNextMonth,
      )
      .map(
        (event) =>
          `<div class="event ${event.tone}"><span>${event.label}</span><button type="button" class="calendar-event-delete" data-action="delete-calendar-event" data-id="${event.id}" title="Eliminar actividad" aria-label="Eliminar actividad">${icon("x")}</button></div>`,
      )
      .join("");
    const classes = [
      "day",
      isPreviousMonth || isNextMonth ? "muted" : "",
      dayNumber === currentDay ? "today" : "",
    ]
      .filter(Boolean)
      .join(" ");
    return `<div class="${classes}"><span class="day-number">${visibleDay}</span>${eventMarkup}</div>`;
  }).join("");
  return `${headers}${days}`;
}

// Cada vista devuelve el HTML de una pantalla y se actualiza desde renderView.
const views = {
  "users-management": {
    title: "Usuarios",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">SuperAdmin · Control de accesos</p><h1>Usuarios del sistema</h1><p class="page-subtitle">Administra administradores, superadministradores y trabajadores de campo.</p></div><button class="primary-btn" data-action="new-user">${icon("user-plus")} Nuevo usuario</button></div><div class="filter-bar">${icon("search")}<input class="filter-search" placeholder="Buscar usuario por nombre o correo..."><button class="filter-chip active">Todos · ${managedUsers.length}</button><button class="filter-chip">SuperAdmin</button><button class="filter-chip">Administradores</button><button class="filter-chip">Campo</button></div>${surface("Directorio de usuarios", `<div class="management-list">${managedUsers.map((user) => `<div class="management-row"><span class="role-avatar ${user.role === "SuperAdmin" ? "super-avatar" : user.role === "Administrador de Finca" ? "admin-avatar" : "field-avatar"}">${user.initials}</span><div class="management-main"><strong>${user.name}</strong><small>${user.email}</small></div><span class="role-badge">${user.role}</span><button class="edit-btn" data-action="edit-user" data-id="${user.id}" title="Editar usuario">${icon("pencil")}</button><button class="delete-btn" data-action="delete-user" data-id="${user.id}" title="Eliminar usuario">${icon("trash-2")}</button></div>`).join("")}</div>`, `<span class="small-note">${managedUsers.length} registrados</span>`)}</div>`,
  },
  "crops-management": {
    title: "Catálogo de cultivos",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">SuperAdmin · Catálogo maestro</p><h1>Cultivos registrados</h1><p class="page-subtitle">Administra cultivos, variedades, lotes y sus parámetros de siembra.</p></div><button class="primary-btn" data-action="toast">${icon("plus")} Nuevo cultivo</button></div><div class="filter-bar">${icon("search")}<input class="filter-search" placeholder="Buscar cultivo, variedad o lote..."><button class="filter-chip active">Todos · ${managedCrops.length}</button><button class="filter-chip">En desarrollo</button><button class="filter-chip">Próximos a cosecha</button></div>${surface("Catálogo de cultivos", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Cultivo / variedad</th><th>Lote</th><th>Área</th><th>Etapa</th><th>Acción</th></tr></thead><tbody>${managedCrops.map((crop) => `<tr><td><strong>${crop.name}</strong></td><td>${crop.lot}</td><td>${crop.area}</td><td><span class="stage develop">${crop.stage}</span></td><td><button class="delete-btn" data-action="delete-crop" data-id="${crop.id}" title="Eliminar cultivo">${icon("trash-2")}</button></td></tr>`).join("")}</tbody></table></div>`)}</div><div class="danger-note">${icon("triangle-alert")} Al eliminar un cultivo también se retira del catálogo y de los reportes globales.</div></div>`,
  },
  management: {
    title: "Gestión global",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">SuperAdmin · Administración global</p><h1>Usuarios y cultivos</h1><p class="page-subtitle">Administra los accesos del sistema y los cultivos registrados en AgroSmart.</p></div><button class="primary-btn" data-action="toast">${icon("plus")} Crear registro</button></div><div class="management-grid">${surface("Usuarios y administradores", `<div class="management-list">${managedUsers.map((user) => `<div class="management-row"><span class="role-avatar ${user.role === "SuperAdmin" ? "super-avatar" : user.role === "Administrador de Finca" ? "admin-avatar" : "field-avatar"}">${user.initials}</span><div class="management-main"><strong>${user.name}</strong><small>${user.email}</small></div><span class="role-badge">${user.role}</span><button class="delete-btn" data-action="delete-user" data-id="${user.id}" title="Eliminar usuario">${icon("trash-2")}</button></div>`).join("")}</div>`, '<span class="small-note">' + managedUsers.length + " registrados</span>")}${surface("Cultivos registrados", `<div class="management-list">${managedCrops.map((crop) => `<div class="management-row"><span class="crop-orb">${icon("leaf")}</span><div class="management-main"><strong>${crop.name}</strong><small>${crop.lot} · ${crop.area}</small></div><span class="stage develop">${crop.stage}</span><button class="delete-btn" data-action="delete-crop" data-id="${crop.id}" title="Eliminar cultivo">${icon("trash-2")}</button></div>`).join("")}</div>`, '<span class="small-note">' + managedCrops.length + " activos</span>")}</div><div class="danger-note">${icon("triangle-alert")} Eliminar un usuario o cultivo es una acción permanente y requiere confirmación.</div></div>`,
  },
  superadmin: {
    title: "Panel global",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Control global · Super administrador</p><h1>Buenos días, Andrés <span style="font-size:22px">✦</span></h1><p class="page-subtitle">Resumen consolidado de AgroSmart y sus fincas conectadas.</p></div><button class="primary-btn" data-action="toast">${icon("plus")} Invitar usuario</button></div><div class="kpi-grid"><div class="kpi green"><div class="kpi-icon">${icon("landmark")}</div><span class="kpi-label">Fincas activas</span><strong>48</strong><div class="kpi-foot">↑ 6 este trimestre</div></div><div class="kpi blue"><div class="kpi-icon">${icon("users")}</div><span class="kpi-label">Usuarios registrados</span><strong>286</strong><div class="kpi-foot">34 conectados ahora</div></div><div class="kpi gold"><div class="kpi-icon">${icon("wifi")}</div><span class="kpi-label">Sincronización global</span><strong>94%</strong><div class="kpi-foot">12 dispositivos pendientes</div></div></div><div class="content-grid"><div>${surface("Actividad de la plataforma", `<div class="metric-line"><span><strong>Finca El Porvenir</strong> registró una nueva cosecha</span><span>Hace 8 min</span></div><div class="metric-line"><span><strong>Finca La Esperanza</strong> conectó 4 sensores IoT</span><span>Hace 32 min</span></div><div class="metric-line"><span><strong>Mariana Ríos</strong> actualizó un catálogo de cultivos</span><span>Hace 1 h</span></div><div class="metric-line"><span><strong>Finca San Miguel</strong> quedó sin conexión</span><span style="color:var(--red)">Hace 2 h</span></div>`, '<a href="#" data-view="audit">Ver auditoría →</a>')}</div><div>${surface("Estado de integraciones", `<div class="metric-line"><span>${icon("cloud-sun")} Servicio de clima</span><strong style="color:var(--green)">Operativo</strong></div><div class="metric-line"><span>${icon("radio-tower")} Telemetría IoT</span><strong style="color:var(--green)">Operativo</strong></div><div class="metric-line"><span>${icon("map-pin")} Geolocalización</span><strong style="color:var(--amber)">Degradado</strong></div>`, '<a href="#" data-view="settings">Configurar</a>')}</div></div><div class="content-grid" style="margin-top:20px"><div>${surface("Usuarios por rol", `<div class="metric-line"><span>Administradores de finca</span><strong>62</strong></div><div class="metric-line"><span>Trabajadores de campo</span><strong>216</strong></div><div class="metric-line"><span>Super administradores</span><strong>8</strong></div>`)}</div><div>${surface("Catálogos maestros", `<div class="metric-line"><span>Tipos de cultivo</span><strong>24</strong></div><div class="metric-line"><span>Variedades activas</span><strong>86</strong></div><div class="metric-line"><span>Distancias recomendadas</span><strong>38</strong></div>`, '<a href="#" data-view="settings">Gestionar</a>')}</div></div></div>`,
  },
  dashboard: {
    title: "Resumen",
    render:
      () => `<div class="page"><div class="page-heading"><div><p class="eyebrow">Martes, 24 de septiembre de 2024</p><h1>Buenos días, Mariana <span style="font-size:22px">☀</span></h1><p class="page-subtitle">Aquí tienes lo más importante de tu finca para hoy.</p></div><div class="page-actions"><button class="secondary-btn" data-action="export-dashboard">${icon("download")} Exportar</button><button class="primary-btn" data-view="new-crop">${icon("plus")} Nuevo cultivo</button></div></div>
      <div class="kpi-grid"><div class="kpi green"><div class="kpi-icon">${icon("leaf")}</div><span class="kpi-label">Cultivos activos</span><strong>12</strong><div class="kpi-foot">↑ 2 este mes · 86% saludables</div></div><div class="kpi blue"><div class="kpi-icon">${icon("bell-ring")}</div><span class="kpi-label">Alertas activas</span><strong>04</strong><div class="kpi-foot">2 requieren atención hoy</div></div><div class="kpi gold"><div class="kpi-icon">${icon("calendar-check-2")}</div><span class="kpi-label">Próxima cosecha</span><strong>18 <small style="font-size:15px;letter-spacing:0">días</small></strong><div class="kpi-foot">Café · Lote Norte 03</div></div></div>
      <div class="content-grid"><div>${surface("Alertas recientes", `<div class="alert-list"><div class="alert-row"><div class="alert-mark red"></div><div class="alert-copy"><strong>Humedad crítica en Lote Norte 03</strong><p>Sensor H-024 · Lectura de 24% en suelo</p><span class="type-pill red">Alta · Humedad</span></div><span class="alert-time">Hace 12 min</span></div><div class="alert-row"><div class="alert-mark amber"></div><div class="alert-copy"><strong>Posible brote de roya</strong><p>Reportado por Carlos M. · Café arábica</p><span class="type-pill amber">Media · Plaga</span></div><span class="alert-time">Hace 1 h</span></div><div class="alert-row"><div class="alert-mark green"></div><div class="alert-copy"><strong>Lluvia esperada en las próximas 24 h</strong><p>Pronóstico actualizado para la finca</p><span class="type-pill blue">Info · Clima</span></div><span class="alert-time">Hace 3 h</span></div></div>`, '<a href="#" data-view="alerts">Ver todas →</a>')}</div><div>${surface("Estado de la finca", `<div class="mini-chart"><div class="bar" style="height:42%"><span>Lun</span></div><div class="bar" style="height:65%"><span>Mar</span></div><div class="bar active" style="height:82%"><span>Mié</span></div><div class="bar" style="height:57%"><span>Jue</span></div><div class="bar" style="height:73%"><span>Vie</span></div><div class="bar" style="height:47%"><span>Sáb</span></div><div class="bar" style="height:35%"><span>Dom</span></div></div><div class="metric-line"><span>Humedad promedio</span><strong>68%</strong></div><div class="metric-line"><span>Riego completado</span><strong style="color:var(--green)">92%</strong></div>`, '<span class="small-note">Esta semana</span>')}</div></div>
      <div class="content-grid" style="margin-top:20px"><div>${surface("Cultivos en seguimiento", `<div class="crop-list"><div class="crop-item"><div class="crop-orb">${icon("coffee")}</div><div><strong>Café arábica · Lote Norte 03</strong><small>Floración · 2.4 ha</small><div class="progress-track"><span style="width:68%"></span></div></div><span class="crop-pct">68%</span></div><div class="crop-item"><div class="crop-orb corn">${icon("wheat")}</div><div><strong>Maíz amarillo · Lote Sur 01</strong><small>Desarrollo · 1.8 ha</small><div class="progress-track"><span style="width:42%"></span></div></div><span class="crop-pct">42%</span></div><div class="crop-item"><div class="crop-orb coffee">${icon("sprout")}</div><div><strong>Aguacate Hass · Lote Este 02</strong><small>Cuajado · 3.1 ha</small><div class="progress-track"><span style="width:81%"></span></div></div><span class="crop-pct">81%</span></div></div>`, '<a href="#" data-view="crops">Ver cultivos →</a>')}</div><div>${surface("Equipo en campo", `<div class="metric-line"><span>${icon("users-round")} Personal activo</span><strong id="team-active-count">0 / ${managedTeam.length}</strong></div><div class="metric-line"><span>${icon("check-check")} Tareas de hoy</span><strong id="team-tasks-count">0 / ${managedTasks.length}</strong></div><div class="metric-line"><span>${icon("clock-3")} Sin asignar</span><strong id="team-unassigned-count" style="color:var(--amber)">0</strong></div>`, '<a href="#" data-view="team">Gestionar</a>')}</div></div>
    </div>`,
  },
  alerts: {
    title: "Alertas",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Centro de atención</p><h1>Alertas y eventos</h1><p class="page-subtitle">Monitorea el estado de tus cultivos y actúa a tiempo.</p></div><button class="secondary-btn" data-action="toast">${icon("check-check")} Marcar todas resueltas</button></div><div class="filter-bar">${icon("search")}<input class="filter-search" placeholder="Buscar alertas por cultivo, lote o sensor..."><button class="filter-chip active" data-alert-filter="all">Todas · 12</button><button class="filter-chip" data-alert-filter="active">Activas · 4</button><button class="filter-chip" data-alert-filter="resolved">Resueltas · 8</button><button class="filter-chip" data-action="focus-alert-search">${icon("sliders-horizontal")} Filtros</button></div>${surface("Alertas activas", `<div class="alert-list"><div class="alert-row"><div class="alert-mark red"></div><div class="alert-copy"><strong>Humedad crítica en Lote Norte 03</strong><p>El cultivo necesita riego urgente. Sensor H-024 · 24% de humedad.</p><span class="type-pill red">Alta · Humedad</span></div><span class="alert-time">09:42</span></div><div class="alert-row"><div class="alert-mark red"></div><div class="alert-copy"><strong>Temperatura elevada en invernadero 02</strong><p>Temperatura de 33°C. Revisar ventilación y sombra.</p><span class="type-pill red">Alta · Clima</span></div><span class="alert-time">08:15</span></div><div class="alert-row"><div class="alert-mark amber"></div><div class="alert-copy"><strong>Posible brote de roya</strong><p>Incidencia reportada en 6 plantas de café por Carlos M.</p><span class="type-pill amber">Media · Plaga</span></div><span class="alert-time">Ayer</span></div><div class="alert-row"><div class="alert-mark amber"></div><div class="alert-copy"><strong>Aplicación de fertilizante pendiente</strong><p>Lote Sur 01 · Actividad programada para hoy.</p><span class="type-pill amber">Media · Tarea</span></div><span class="alert-time">Ayer</span></div></div>`)}</div>`,
  },
  crops: {
    title: "Cultivos",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Producción agrícola</p><h1>Mis cultivos</h1><p class="page-subtitle">12 cultivos activos distribuidos en 8 lotes.</p></div><button class="primary-btn" data-view="new-crop">${icon("plus")} Registrar cultivo</button></div><div class="tabs"><button class="tab active">Todos (12)</button><button class="tab">En desarrollo (6)</button><button class="tab">Próximos a cosecha (3)</button><button class="tab">Finalizados (3)</button></div>${surface("Vista general", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Cultivo / variedad</th><th>Lote</th><th>Área</th><th>Etapa fenológica</th><th>Progreso</th><th></th></tr></thead><tbody><tr><td><strong>Café arábica</strong><small style="display:block;color:var(--muted);margin-top:4px">Caturra</small></td><td>Norte 03</td><td>2.4 ha</td><td><span class="stage develop">Floración</span></td><td>68%</td><td>${icon("arrow-up-right")}</td></tr><tr><td><strong>Maíz amarillo</strong><small style="display:block;color:var(--muted);margin-top:4px">ICA V-305</small></td><td>Sur 01</td><td>1.8 ha</td><td><span class="stage seed">Desarrollo</span></td><td>42%</td><td>${icon("arrow-up-right")}</td></tr><tr><td><strong>Aguacate Hass</strong><small style="display:block;color:var(--muted);margin-top:4px">Hass</small></td><td>Este 02</td><td>3.1 ha</td><td><span class="stage harvest">Cuajado</span></td><td>81%</td><td>${icon("arrow-up-right")}</td></tr><tr><td><strong>Tomate chonto</strong><small style="display:block;color:var(--muted);margin-top:4px">Santa Clara</small></td><td>Invernadero 01</td><td>0.6 ha</td><td><span class="stage harvest">Cosecha</span></td><td>93%</td><td>${icon("arrow-up-right")}</td></tr></tbody></table></div>`)}</div>`,
  },
  "new-crop": {
    title: "Nuevo cultivo",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Planificación</p><h1>Registrar nuevo cultivo</h1><p class="page-subtitle">Completa los datos y AgroSmart calculará la densidad recomendada.</p></div><span class="type-pill blue">Borrador local</span></div><div class="content-grid"><div>${surface("Información del cultivo", `<div style="padding:0 21px 21px"><div class="settings-grid"><label class="form-field">Tipo de cultivo<select><option>Café</option><option>Maíz</option><option>Aguacate</option></select></label><label class="form-field">Variedad<select><option>Caturra</option><option>Castillo</option><option>Colombia</option></select></label><label class="form-field">Lote / ubicación<select><option>Lote Norte 04</option><option>Lote Sur 02</option></select></label><label class="form-field">Fecha de siembra<input type="date" value="2024-09-24"></label><label class="form-field">Área a cultivar (ha)<input id="area-input" type="number" value="1.5" step="0.1"></label><label class="form-field">Sistema de riego<select><option>Goteo</option><option>Aspersión</option><option>Manual</option></select></label></div><div class="calc-card"><div class="calc-icon">${icon("calculator")}</div><div><small>DENSIDAD RECOMENDADA</small><strong id="density-value">2,000 plantas / ha</strong><p>Distancia sugerida: 2 m entre plantas · 2.5 m entre surcos</p></div></div><button class="primary-btn" data-action="toast">${icon("save")} Guardar cultivo localmente</button></div>`, "")}</div><div>${surface("Resumen del registro", `<div class="metric-line"><span>Tipo</span><strong>Café · Caturra</strong></div><div class="metric-line"><span>Área total</span><strong id="area-summary">1.5 ha</strong></div><div class="metric-line"><span>Plantas estimadas</span><strong id="plant-summary">3,000</strong></div><div class="metric-line"><span>Primera cosecha estimada</span><strong>Sep 2026</strong></div>`, "")}${surface("Campos estandarizados", `<div class="empty-state" style="padding:23px">${icon("badge-check")}<strong>Catálogos actualizados</strong><span style="font-size:10px">Variedades y distancias sincronizadas</span></div>`)}</div></div></div>`,
  },
  detail: {
    title: "Detalle de cultivo",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Cultivos / Café arábica</p><h1>Detalle del cultivo</h1></div><button class="secondary-btn" data-view="crops">${icon("arrow-left")} Volver a cultivos</button></div><div class="detail-hero"><div><span class="stage">En desarrollo</span><h2>Café arábica · Caturra</h2><p>Lote Norte 03 · 2.4 hectáreas · 3,840 plantas</p></div><div class="detail-kpis"><div><strong>68%</strong><span>Progreso</span></div><div><strong>18 días</strong><span>Para cosecha</span></div><div><strong>24°C</strong><span>Temperatura</span></div></div></div><div class="surface" style="margin-top:20px"> <div class="surface-header"><h2>Línea de tiempo fenológica</h2><span class="small-note">Siembra: 12 Ene 2024</span></div><div class="timeline"><div class="timeline-step"><div class="timeline-dot"></div><strong>Siembra</strong><small>12 Ene</small></div><div class="timeline-step"><div class="timeline-dot"></div><strong>Germinación</strong><small>04 Feb</small></div><div class="timeline-step current"><div class="timeline-dot"></div><strong>Floración</strong><small>Actual · Día 186</small></div><div class="timeline-step future"><div class="timeline-dot"></div><strong>Fructificación</strong><small>Oct 2024</small></div><div class="timeline-step future"><div class="timeline-dot"></div><strong>Cosecha</strong><small>Nov 2024</small></div></div></div><div class="content-grid" style="margin-top:20px"><div>${surface("Últimas actividades", `<div class="metric-line"><span>Riego por goteo · Lote Norte 03</span><strong>Hoy, 06:40</strong></div><div class="metric-line"><span>Aplicación de compost orgánico</span><strong>Ayer</strong></div><div class="metric-line"><span>Inspección de plagas</span><strong>22 Sep</strong></div>`)}</div><div>${surface("Datos del lote", `<div class="metric-line"><span>pH del suelo</span><strong>6.2</strong></div><div class="metric-line"><span>Humedad actual</span><strong style="color:var(--red)">24%</strong></div><div class="metric-line"><span>Responsable</span><strong>Carlos Méndez</strong></div>`)}</div></div></div>`,
  },
  calendar: {
    title: "Calendario",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Planificación de finca</p><h1>Calendario agrícola</h1><p class="page-subtitle">${currentCalendarMonthLabel()} · ${managedCalendarEvents.length} actividades programadas</p></div><button class="primary-btn" data-action="new-calendar-event">${icon("plus")} Nueva actividad</button></div>${surface(
        currentCalendarMonthLabel(),
        `<div class="calendar-grid">${renderCalendarGrid()}</div>`,
      )}</div>`,
  },
  supplies: {
    title: "Insumos",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Operación · Existencias</p><h1>Insumos</h1><p class="page-subtitle">Edita cantidades, categorías y estados de los insumos.</p></div><button class="primary-btn" data-action="toast">${icon("plus")} Registrar insumo</button></div>${surface("Inventario de insumos", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Insumo</th><th>Categoría</th><th>Existencia</th><th>Estado</th><th>Actualización</th><th></th></tr></thead><tbody></tbody></table></div>`)}</div>`,
  },
  inventory: {
    title: "Bodega e insumos",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Operación</p><h1>Bodega e insumos</h1><p class="page-subtitle">Control de existencias en tiempo real, incluso sin conexión.</p></div><button class="primary-btn" data-action="toast">${icon("plus")} Registrar entrada</button></div>${surface("Inventario actual", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Insumo</th><th>Categoría</th><th>Existencia</th><th>Estado</th><th>Última actualización</th></tr></thead><tbody><tr><td><strong>Fertilizante NPK 15-15-15</strong></td><td>Fertilizantes</td><td>124 kg</td><td><span class="stage seed">En stock</span></td><td>Hoy, 08:10</td></tr><tr><td><strong>Biofungicida Trichoderma</strong></td><td>Protección</td><td>18 L</td><td><span class="stage harvest">Stock bajo</span></td><td>Ayer</td></tr><tr><td><strong>Combustible maquinaria</strong></td><td>Operación</td><td>240 L</td><td><span class="stage seed">En stock</span></td><td>20 Sep</td></tr></tbody></table></div>`)}</div>`,
  },
  team: {
    title: "Equipo",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Personas en campo</p><h1>Equipo y tareas</h1><p class="page-subtitle">10 personas · 18 tareas activas hoy.</p></div><button class="primary-btn" data-action="toast">${icon("plus")} Asignar tarea</button></div>${surface("Tareas de hoy", `<div class="metric-line"><span>${icon("check-circle-2")} Riego Lote Norte 03 <small style="color:var(--muted)"> · Carlos Méndez</small></span><span class="stage seed">Completada</span></div><div class="metric-line"><span>${icon("circle")} Inspección de plagas <small style="color:var(--muted)"> · Andrea Ruiz</small></span><span class="stage harvest">Pendiente</span></div><div class="metric-line"><span>${icon("circle")} Aplicar fertilizante <small style="color:var(--muted)"> · Luis Gómez</small></span><span class="stage develop">En curso</span></div>`)}</div>`,
  },
  tasks: {
    title: "Tareas",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Operación · Seguimiento</p><h1>Tareas</h1><p class="page-subtitle">Edita responsables, actividades y estados de ejecución.</p></div><button class="primary-btn" data-action="toast">${icon("plus")} Asignar tarea</button></div>${surface("Tareas activas", `<div class="task-list"></div>`)}</div>`,
  },
  harvest: {
    title: "Cosecha",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Resultados de producción</p><h1>Cosecha y ventas</h1><p class="page-subtitle">Seguimiento de rendimiento, calidad y comercialización.</p></div><button class="primary-btn" data-action="toast">${icon("plus")} Registrar cosecha</button></div><div class="kpi-grid"><div class="kpi green"><span class="kpi-label">Producido este mes</span><strong>2.8 t</strong><div class="kpi-foot">↑ 14% vs. mes anterior</div></div><div class="kpi blue"><span class="kpi-label">Ventas acumuladas</span><strong>$18.4M</strong><div class="kpi-foot">4 compradores activos</div></div><div class="kpi gold"><span class="kpi-label">Calidad promedio</span><strong>86%</strong><div class="kpi-foot">Clasificación premium</div></div></div>${surface("Últimas cosechas", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Fecha</th><th>Cultivo</th><th>Lote</th><th>Cantidad</th><th>Calidad</th></tr></thead><tbody><tr><td>22 Sep</td><td><strong>Tomate chonto</strong></td><td>Invernadero 01</td><td>420 kg</td><td><span class="stage harvest">Premium</span></td></tr><tr><td>14 Sep</td><td><strong>Aguacate Hass</strong></td><td>Este 02</td><td>1.2 t</td><td><span class="stage seed">Exportación</span></td></tr></tbody></table></div>`)}</div>`,
  },
  sales: {
    title: "Ventas",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Comercialización</p><h1>Ventas</h1><p class="page-subtitle">Controla compradores, ingresos y salida de producto.</p></div><button class="primary-btn" data-action="toast">${icon("plus")} Registrar venta</button></div><div class="kpi-grid"><div class="kpi blue"><span class="kpi-label">Ventas acumuladas</span><strong>$18.4M</strong><div class="kpi-foot">4 compradores activos</div></div><div class="kpi green"><span class="kpi-label">Producto vendido</span><strong>2.1 t</strong><div class="kpi-foot">76% de la cosecha disponible</div></div><div class="kpi gold"><span class="kpi-label">Precio promedio</span><strong>$8.7k</strong><div class="kpi-foot">Por kilogramo vendido</div></div></div>${surface("Ventas recientes", `<div class="table-wrap"><table class="data-table"><thead><tr><th>Fecha</th><th>Comprador</th><th>Producto</th><th>Cantidad</th><th>Total</th><th>Estado</th></tr></thead><tbody><tr><td>20 Sep</td><td><strong>Cooperativa Andina</strong></td><td>Café arábica</td><td>680 kg</td><td>$9.2M</td><td><span class="stage seed">Pagada</span></td></tr><tr><td>12 Sep</td><td><strong>Frutas del Valle</strong></td><td>Aguacate Hass</td><td>1.2 t</td><td>$7.8M</td><td><span class="stage harvest">Despachada</span></td></tr><tr><td>05 Sep</td><td><strong>Mercado Central</strong></td><td>Tomate chonto</td><td>420 kg</td><td>$1.4M</td><td><span class="stage develop">Pendiente</span></td></tr></tbody></table></div>`)}</div>`,
  },
  audit: {
    title: "Auditoría",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Trazabilidad del sistema</p><h1>Registro de auditoría</h1><p class="page-subtitle">Historial de cambios y actividades de tu finca.</p></div><button class="secondary-btn" data-action="export-audit">${icon("download")} Exportar registro</button></div>${surface("Actividad reciente", `<div class="metric-line"><span><strong>Mariana Ríos</strong> actualizó el lote Norte 03</span><span>Hoy, 09:32</span></div><div class="metric-line"><span><strong>Carlos Méndez</strong> registró actividad de riego</span><span>Hoy, 06:42</span></div><div class="metric-line"><span><strong>AgroSmart</strong> sincronizó datos de sensores</span><span>Ayer, 18:20</span></div><div class="metric-line"><span><strong>Mariana Ríos</strong> creó una nueva tarea</span><span>Ayer, 14:10</span></div>`)}</div>`,
  },
  settings: {
    title: "Configuración",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Preferencias de AgroSmart</p><h1>Configuración</h1><p class="page-subtitle">Conexiones, catálogos y preferencias de tu espacio de trabajo.</p></div></div><div class="settings-grid">${surface("Integraciones", `<div class="setting-row"><div class="setting-icon">${icon("cloud-sun")}</div><div><strong>Clima y pronóstico</strong><small>Weather API · Actualizado hace 2 h</small></div><div class="toggle on"><span></span></div></div><div class="setting-row"><div class="setting-icon">${icon("radio-tower")}</div><div><strong>Sensores IoT</strong><small>24 sensores conectados</small></div><div class="toggle on"><span></span></div></div>`, "")}${surface("Catálogos", `<div class="setting-row"><div class="setting-icon">${icon("book-open")}</div><div><strong>Cultivos y variedades</strong><small>24 tipos · 86 variedades</small></div>${icon("chevron-right")}</div><div class="setting-row"><div class="setting-icon">${icon("ruler")}</div><div><strong>Distancias de siembra</strong><small>Última actualización: 10 Sep 2024</small></div>${icon("chevron-right")}</div>`, "")}</div></div>`,
  },
  login: {
    title: "Acceso",
    render: () =>
      `<div class="page" style="min-height:calc(100vh - 71px);display:grid;place-items:center"><div style="width:min(940px,100%);display:grid;grid-template-columns:1fr 1fr;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(16,55,29,.12)"><div style="padding:44px;background:linear-gradient(145deg,#0b2416,#1b7040);color:white;position:relative;overflow:hidden"><div style="position:relative;z-index:1"><div class="brand" style="padding:0 0 70px">${icon("sprout")} agro<span class="brand-accent">smart</span></div><p class="eyebrow" style="color:#94e6aa">GESTIÓN AGROPECUARIA</p><h2 style="font-size:34px;letter-spacing:-1.8px;line-height:1.12;margin:8px 0 14px">Tu finca, incluso cuando no hay señal.</h2><p style="font-size:12px;line-height:1.7;color:#b9dec1;max-width:300px">Una operación más clara, productiva y conectada con el campo.</p><div style="display:flex;gap:8px;margin-top:38px"><span class="type-pill" style="background:rgba(255,255,255,.12);color:#d9f4df">Offline-first</span><span class="type-pill" style="background:rgba(255,255,255,.12);color:#d9f4df">Seguro</span></div></div></div><div style="padding:44px 48px"><p class="eyebrow">Bienvenido de nuevo</p><h1 style="font-size:26px;margin-bottom:8px">Inicia sesión</h1><p class="page-subtitle" style="margin-bottom:27px">Elige cómo quieres entrar a AgroSmart.</p><div style="display:grid;gap:9px;margin-bottom:22px"><button class="secondary-btn" style="justify-content:flex-start;border-color:#bfe4c7;background:#f2fbf3" data-role="admin">${icon("briefcase-business")} <span style="flex:1;text-align:left"><strong>Administrador de finca</strong><small style="display:block;color:var(--muted);font-size:9px;margin-top:3px">Gestión y operación completa</small></span>${icon("check")}</button><button class="secondary-btn" style="justify-content:flex-start" data-role="field">${icon("hard-hat")} <span style="flex:1;text-align:left"><strong>Trabajador de campo</strong><small style="display:block;color:var(--muted);font-size:9px;margin-top:3px">Tareas y actividades asignadas</small></span></button></div><label class="form-field">Correo electrónico<input type="email" placeholder="maria@fincaelporvenir.co"></label><label class="form-field" style="margin-top:13px">Contraseña<input type="password" value="••••••••"></label><button class="primary-btn" style="width:100%;justify-content:center;margin-top:21px" data-view="dashboard">${icon("arrow-right")} Continuar</button><p style="text-align:center;color:var(--muted);font-size:10px;margin-top:20px">Acceso detectado · <strong style="color:var(--green)">Administrador</strong></p></div></div></div>`,
  },
  "field-user": {
    title: "Vista de campo",
    render: () =>
      `<div class="page"><div class="page-heading"><div><p class="eyebrow">Previsualización de rol · usuario</p><h1>Vista de trabajador de campo</h1><p class="page-subtitle">Experiencia mobile-first para operar con conectividad limitada.</p></div><button class="secondary-btn" data-action="toggle-connection">${icon("wifi-off")} Simular sin conexión</button></div><div class="mobile-preview"><div class="phone"><div class="phone-notch"></div><div class="mobile-head"><div class="mobile-head-row"><span style="font-weight:800;font-size:14px">agro<span style="color:#76df93">smart</span></span><button class="mobile-icon">${icon("bell")}</button></div><h2>Hola, Carlos 👋</h2><p>Martes, 24 de septiembre · Finca El Porvenir</p></div><div class="mobile-body"><span class="mobile-sync">${icon("cloud-check")} Todo sincronizado</span><div class="mobile-stats"><div class="mobile-stat"><strong>04</strong><span>Tareas para hoy</span></div><div class="mobile-stat"><strong style="color:var(--red)">02</strong><span>Alertas nuevas</span></div></div><div class="mobile-section-title"><strong>Mis tareas de hoy</strong><a>Ver calendario</a></div><div class="task"><div class="task-icon">${icon("droplets")}</div><div><strong>Revisar riego · Norte 03</strong><small>Verificar humedad de suelo</small></div><time>06:30</time></div><div class="task"><div class="task-icon" style="background:#fff3db;color:#b37a18">${icon("bug")}</div><div><strong>Inspección de plagas</strong><small>Café arábica · 2.4 ha</small></div><time>09:00</time></div><div class="mobile-section-title"><strong>Acciones rápidas</strong></div><div class="mobile-quick"><button class="quick-btn" data-action="toast">${icon("clipboard-pen-line")} Registrar actividad</button><button class="quick-btn" data-action="toast">${icon("triangle-alert")} Reportar incidencia</button></div></div><div class="bottom-nav"><button class="active">${icon("house")}Inicio</button><button>${icon("calendar-days")}Tareas</button><button>${icon("leaf")}Cultivos</button><button>${icon("user-round")}Perfil</button></div></div></div></div>`,
  },
};

// Renderiza la pantalla solicitada y conecta sus controles dinámicos.
function renderView(view = "dashboard") {
  const current = views[view] || views.dashboard;
  activeView = view;
  breadcrumbTitle.textContent = current.title;
  viewContainer.innerHTML = current.render();
  if (view === "harvest") updateHarvestView();
  if (view === "dashboard") updateDashboardTeamSummary();
  if (view === "alerts") updateAlertsView();
  if (view === "inventory" || view === "supplies") updateInventoryView(view);
  if (view === "team" || view === "tasks") updateTeamView(view);
  if (view === "sales") updateSalesView();
  if (view === "audit") updateAuditView();
  if (view === "crops") bindCropTabs();
  if (!canManageUsers()) {
    viewContainer
      .querySelectorAll(
        '[data-action="delete-user"],[data-action="edit-user"],[data-action="delete-crop"],[data-action="new-user"]',
      )
      .forEach((control) => control.remove());
    viewContainer.querySelectorAll(".management-row").forEach((row) => {
      if (!row.querySelector(".permission-note"))
        row.insertAdjacentHTML(
          "beforeend",
          '<span class="permission-note">Solo lectura</span>',
        );
    });
  }
  document.querySelectorAll("[data-view]").forEach((el) =>
    el.addEventListener("click", (event) => {
      event.preventDefault();
      renderView(el.dataset.view);
    }),
  );
  document
    .querySelectorAll('[data-action="toast"]')
    .forEach((el) => el.addEventListener("click", () => showToast()));
  document
    .querySelectorAll('[data-action="new-calendar-event"]')
    .forEach((el) => el.addEventListener("click", openCalendarModal));
  document
    .querySelectorAll('[data-action="delete-calendar-event"]')
    .forEach((el) =>
      el.addEventListener("click", () => deleteCalendarEvent(Number(el.dataset.id))),
    );
  document
    .querySelectorAll('[data-action="export-dashboard"]')
    .forEach((el) => el.addEventListener("click", exportDashboard));
  document
    .querySelectorAll('[data-action="export-audit"]')
    .forEach((el) => el.addEventListener("click", exportAudit));
  document
    .querySelectorAll('[data-action="toggle-connection"]')
    .forEach((el) => el.addEventListener("click", toggleConnection));
  document
    .querySelectorAll('[data-action="delete-user"]')
    .forEach((el) =>
      el.addEventListener("click", () =>
        deleteManagedUser(Number(el.dataset.id)),
      ),
    );
  document
    .querySelectorAll('[data-action="delete-crop"]')
    .forEach((el) =>
      el.addEventListener("click", () =>
        deleteManagedCrop(Number(el.dataset.id)),
      ),
    );
  document
    .querySelectorAll('[data-action="new-user"]')
    .forEach((el) => el.addEventListener("click", () => openUserModal()));
  document
    .querySelectorAll('[data-action="new-harvest"]')
    .forEach((el) => el.addEventListener("click", openHarvestModal));
  document
    .querySelectorAll('[data-action="new-sale"]')
    .forEach((el) => el.addEventListener("click", () => openRecordEditModal("sales")));
  document
    .querySelectorAll('[data-action="new-audit"]')
    .forEach((el) => el.addEventListener("click", () => openRecordEditModal("audit")));
  document
    .querySelectorAll('[data-action="mark-all-alerts"]')
    .forEach((el) => el.addEventListener("click", markAllAlertsRead));
  document
    .querySelectorAll('[data-action="mark-alert"]')
    .forEach((el) =>
      el.addEventListener("click", () => markAlertRead(el.dataset.alertId)),
    );
  document
    .querySelectorAll('[data-action="mark-alert-unread"]')
    .forEach((el) =>
      el.addEventListener("click", () => markAlertUnread(el.dataset.alertId)),
    );
  document
    .querySelectorAll("[data-alert-filter]")
    .forEach((el) =>
      el.addEventListener("click", () => filterAlerts(el.dataset.alertFilter)),
    );
  document
    .querySelectorAll('[data-action="focus-alert-search"]')
    .forEach((el) =>
      el.addEventListener("click", () => {
        const search = viewContainer.querySelector(".filter-search");
        search?.focus();
        showToast("Usa la búsqueda para filtrar las alertas");
      }),
    );
  viewContainer
    .querySelector(".filter-search")
    ?.addEventListener("input", (event) => filterAlerts(undefined, event.target.value));
  document
    .querySelectorAll('[data-action="edit-inventory"]')
    .forEach((el) =>
      el.addEventListener("click", () => editInventoryItem(Number(el.dataset.id))),
    );
  document
    .querySelectorAll('[data-action="edit-warehouse"]')
    .forEach((el) =>
      el.addEventListener("click", () => editWarehouse(Number(el.dataset.id))),
    );
  document
    .querySelectorAll('[data-action="edit-task"]')
    .forEach((el) =>
      el.addEventListener("click", () => editTask(Number(el.dataset.id))),
    );
  document
    .querySelectorAll('[data-action="complete-task"]')
    .forEach((el) =>
      el.addEventListener("click", () => updateTaskStatus(Number(el.dataset.id), "Completada")),
    );
  document
    .querySelectorAll('[data-action="pending-task"]')
    .forEach((el) =>
      el.addEventListener("click", () => updateTaskStatus(Number(el.dataset.id), "Pendiente")),
    );
  document
    .querySelectorAll('[data-action="edit-team"]')
    .forEach((el) =>
      el.addEventListener("click", () => editTeamMember(Number(el.dataset.id))),
    );
  document
    .querySelectorAll('[data-action="edit-sale"]')
    .forEach((el) =>
      el.addEventListener("click", () => openRecordEditModal("sales", Number(el.dataset.id))),
    );
  document
    .querySelectorAll('[data-action="edit-audit"]')
    .forEach((el) =>
      el.addEventListener("click", () => openRecordEditModal("audit", Number(el.dataset.id))),
    );
  document
    .querySelectorAll('[data-action="delete-record"]')
    .forEach((el) =>
      el.addEventListener("click", () =>
        deleteEditableRecord(el.dataset.type, Number(el.dataset.id)),
      ),
    );
  document
    .querySelectorAll('[data-action="edit-user"]')
    .forEach((el) =>
      el.addEventListener("click", () => openUserModal(Number(el.dataset.id))),
    );
  const areaInput = document.querySelector("#area-input");
  if (areaInput) {
    areaInput.value = "";
    document
      .querySelectorAll('.form-field select, .form-field input[type="date"]')
      .forEach((field) => {
        field.value = "";
      });
    document.querySelector("#density-value").textContent = "Completa el área";
    document.querySelector("#area-summary").textContent = "Sin registrar";
    document.querySelector("#plant-summary").textContent = "Sin calcular";
    areaInput.addEventListener("input", (event) => {
      const plants = Math.round(Number(event.target.value || 0) * 2000);
      document.querySelector("#density-value").textContent =
        event.target.value ? "2,000 plantas / ha" : "Completa el área";
      document.querySelector("#area-summary").textContent =
        event.target.value ? `${event.target.value} ha` : "Sin registrar";
      document.querySelector("#plant-summary").textContent =
        event.target.value ? plants.toLocaleString("es-CO") : "Sin calcular";
    });
  }
  document.querySelectorAll(".filter-chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-chip")
        .forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
    }),
  );
  document.querySelectorAll(".tab").forEach((tab) =>
    tab.addEventListener("click", () => filterCrops(tab.dataset.filter)),
  );
  document
    .querySelectorAll(".nav-item")
    .forEach((item) =>
      item.classList.toggle("active", item.dataset.view === view),
    );
  lucide.createIcons();
}
// Actualiza los indicadores del equipo en el resumen sin recargar la página.
function updateDashboardTeamSummary() {
  const activeCount = managedTeam.filter((person) => person.status === "online").length;
  const completedCount = managedTasks.filter((task) => task.status === "Completada").length;
  const unassignedCount = managedTasks.filter((task) => !task.person || task.person === "Sin asignar").length;
  const activeLabel = document.querySelector("#team-active-count");
  const tasksLabel = document.querySelector("#team-tasks-count");
  const unassignedLabel = document.querySelector("#team-unassigned-count");
  if (activeLabel) activeLabel.textContent = `${String(activeCount).padStart(2, "0")} / ${managedTeam.length}`;
  if (tasksLabel) tasksLabel.textContent = `${completedCount} / ${managedTasks.length}`;
  if (unassignedLabel) unassignedLabel.textContent = String(unassignedCount).padStart(2, "0");
}

// Abre el formulario con la fecha actual como valor inicial.
function openCalendarModal() {
  const today = new Date();
  const date = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  document.querySelector("#calendar-form").reset();
  document.querySelector("#calendar-date-input").value = date;
  const modal = document.querySelector("#calendar-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  lucide.createIcons();
  focusFirstField("calendar-modal");
}

// Cierra el formulario de actividades y restaura su estado accesible.
function closeCalendarModal() {
  const modal = document.querySelector("#calendar-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

// Guarda una actividad, la coloca en la fecha elegida y la sincroniza.
function saveCalendarEvent(event) {
  event.preventDefault();
  const dateValue = document.querySelector("#calendar-date-input").value;
  const selectedDate = new Date(`${dateValue}T00:00:00`);
  managedCalendarEvents.push({
    id: Date.now(),
    day: selectedDate.getDate(),
    month: selectedDate.getMonth(),
    year: selectedDate.getFullYear(),
    label: document.querySelector("#calendar-label-input").value.trim(),
    tone: document.querySelector("#calendar-tone-input").value,
  });
  publishTeamState();
  closeCalendarModal();
  renderView("calendar");
  showToast("Actividad sincronizada en tiempo real");
}

// Elimina una actividad y notifica el cambio a las demás sesiones.
function deleteCalendarEvent(id) {
  const calendarEvent = managedCalendarEvents.find((event) => event.id === id);
  if (!calendarEvent || !confirm(`¿Eliminar la actividad "${calendarEvent.label}"?`)) return;
  managedCalendarEvents = managedCalendarEvents.filter((event) => event.id !== id);
  publishTeamState();
  renderView("calendar");
  showToast("Actividad eliminada y sincronizada");
}
// Conecta filtros y pestañas de la pantalla de cultivos.
function bindCropTabs() {
  const rows = [...viewContainer.querySelectorAll(".data-table tbody tr")];
  const categories = ["development", "development", "upcoming", "finished"];
  rows.forEach((row, index) => {
    row.dataset.cropStatus = categories[index] || "development";
  });
  const filters = ["all", "development", "upcoming", "finished"];
  const labels = ["Todos", "En desarrollo", "Próximos a cosecha", "Finalizados"];
  const counts = {
    all: rows.length,
    development: rows.filter((row) => row.dataset.cropStatus === "development").length,
    upcoming: rows.filter((row) => row.dataset.cropStatus === "upcoming").length,
    finished: rows.filter((row) => row.dataset.cropStatus === "finished").length,
  };
  viewContainer.querySelectorAll(".tab").forEach((tab, index) => {
    const filter = filters[index];
    tab.dataset.filter = filter;
    tab.textContent = `${labels[index]} (${counts[filter]})`;
  });
  const subtitle = viewContainer.querySelector(".page-subtitle");
  if (subtitle) subtitle.textContent = `${counts.all} cultivos registrados en tu finca.`;
}
function filterCrops(filter) {
  const selected = filter || "all";
  viewContainer.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.filter === selected);
  });
  viewContainer.querySelectorAll(".data-table tbody tr").forEach((row) => {
    row.hidden = selected !== "all" && row.dataset.cropStatus !== selected;
  });
}
// Muestra una confirmación breve para operaciones locales.
function showToast(message) {
  const label = toast.querySelector("span");
  if (label) label.textContent = message || "Actividad guardada localmente";
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
// Genera una descarga CSV sin depender de un servidor externo.
function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
// Descarga el resumen principal en formato CSV.
function exportDashboard() {
  downloadCsv("agrosmart-resumen.csv", [
    ["Indicador", "Valor", "Detalle"],
    ["Cultivos activos", "12", "86% saludables"],
    ["Alertas activas", "04", "2 requieren atención hoy"],
    ["Próxima cosecha", "18 días", "Café · Lote Norte 03"],
  ]);
  showToast("Resumen exportado correctamente");
}
// Descarga el historial de auditoría en formato CSV.
function exportAudit() {
  downloadCsv("agrosmart-auditoria.csv", [
    ["Usuario", "Actividad", "Fecha"],
    ["Mariana Ríos", "Actualizó el lote Norte 03", "Hoy, 09:32"],
    ["Carlos Méndez", "Registró actividad de riego", "Hoy, 06:42"],
    ["AgroSmart", "Sincronizó datos de sensores", "Ayer, 18:20"],
    ["Mariana Ríos", "Creó una nueva tarea", "Ayer, 14:10"],
  ]);
  showToast("Registro exportado correctamente");
}
// Permite cerrar cualquier modal abierto con la tecla Escape.
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll(".modal-backdrop.open").forEach((modal) => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
});
function focusFirstField(modalId) {
  const field = document.querySelector(`#${modalId} input:not([type="hidden"]), #${modalId} select`);
  field?.focus();
}
// Oculta las alertas de tareas que ya fueron completadas.
function removeCompletedTaskAlerts() {
  viewContainer.querySelectorAll(".alert-row").forEach((row) => {
    const isFertilizationAlert = row.textContent.includes("Aplicación de fertilizante pendiente");
    const fertilizationTask = managedTasks.find((task) => task.id === 3);
    if (isFertilizationAlert && fertilizationTask?.status === "Completada") row.remove();
  });
}

// Calcula el estado visible de las alertas y enlaza sus acciones.
function updateAlertsView() {
  const alertList = viewContainer.querySelector(".alert-list");
  removeCompletedTaskAlerts();
  liveAlerts = liveAlerts.filter(
    (alert) =>
      alert.category !== "Tarea" ||
      managedTasks.find((task) => task.id === 3)?.status !== "Completada",
  );
  liveAlerts.forEach((alert) => {
    if (alertList && !alertList.querySelector(`[data-live-alert-id="${alert.id}"]`)) {
      alertList.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert-row live-alert" data-live-alert-id="${alert.id}"><div class="alert-mark ${alert.tone}"></div><div class="alert-copy"><strong>${alert.title}</strong><p>${alert.description}</p><span class="type-pill ${alert.type}">${alert.priority} · ${alert.category}</span></div><span class="alert-time">Ahora</span></div>`,
      );
    }
  });
  if (alertList && !alertList.querySelector('[data-alert-type="planting-window"]')) {
    alertList.insertAdjacentHTML(
      "beforeend",
      `<div class="alert-row" data-alert-type="planting-window"><div class="alert-mark green"></div><div class="alert-copy"><strong>Ventana de siembra disponible</strong><p>Estas fechas son adecuadas para cultivar café y maíz. Verifica humedad, suelo y pronóstico antes de sembrar.</p><span class="type-pill blue">Info · Siembra</span></div><span class="alert-time">Hoy</span></div>`,
    );
  }
  const rows = [...viewContainer.querySelectorAll(".alert-row")];
  rows.forEach((row) => {
    if (row.dataset.alertId) return;
    const title = row.querySelector(".alert-copy strong")?.textContent?.trim();
    row.dataset.alertId = row.dataset.liveAlertId
      ? `live-${row.dataset.liveAlertId}`
      : row.dataset.alertType || `static-${title}`;
  });
  const markAllButton = viewContainer.querySelector(
    '[data-action="toast"].secondary-btn',
  );
  if (markAllButton) {
    markAllButton.dataset.action = "mark-all-alerts";
    markAllButton.innerHTML = `${icon("check-check")} Marcar todas como leídas`;
  }
  rows.forEach((row) => {
    row.querySelector(".alert-actions")?.remove();
    const alertId = row.dataset.alertId;
    row.classList.toggle("read", readAlerts.has(alertId));
    row.insertAdjacentHTML(
      "beforeend",
      `<span class="alert-actions"><button class="alert-read-control" data-action="mark-alert" data-alert-id="${alertId}" ${readAlerts.has(alertId) ? "disabled" : ""}>Marcar leída</button><button class="alert-read-control" data-action="mark-alert-unread" data-alert-id="${alertId}" ${readAlerts.has(alertId) ? "" : "disabled"}>Marcar no leída</button></span>`,
    );
  });
  updateAlertFilterLabels(rows);
  updateNotificationState(rows);
  filterAlerts(alertFilter, alertSearch);
}
// Actualiza los contadores de alertas según su estado actual.
function updateAlertFilterLabels(rows) {
  const total = rows.length;
  const resolved = rows.filter((row) => readAlerts.has(row.dataset.alertId)).length;
  const active = total - resolved;
  const labels = {
    all: `Todas · ${total}`,
    active: `Activas · ${active}`,
    resolved: `Resueltas · ${resolved}`,
  };
  viewContainer.querySelectorAll("[data-alert-filter]").forEach((button) => {
    const label = labels[button.dataset.alertFilter];
    if (label) button.textContent = label;
  });
}
// Filtra alertas por estado y por texto introducido en el buscador.
function filterAlerts(filter, searchTerm) {
  if (filter) alertFilter = filter;
  if (searchTerm !== undefined) alertSearch = searchTerm.trim();
  const selectedFilter = alertFilter;
  const search = alertSearch;
  const searchInput = viewContainer.querySelector(".filter-search");
  if (searchInput && searchInput.value !== search) searchInput.value = search;
  viewContainer.querySelectorAll("[data-alert-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.alertFilter === selectedFilter);
  });
  viewContainer.querySelectorAll(".alert-row").forEach((row) => {
    const isResolved = readAlerts.has(row.dataset.alertId);
    const matchesStatus =
      selectedFilter === "all" ||
      (selectedFilter === "active" && !isResolved) ||
      (selectedFilter === "resolved" && isResolved);
    const matchesSearch = row.textContent.toLowerCase().includes(search.toLowerCase());
    row.hidden = !matchesStatus || !matchesSearch;
  });
}
// Sincroniza los indicadores de alertas no leídas en la navegación.
function updateNotificationState(rows = null) {
  const currentRows = Array.isArray(rows)
    ? rows
    : [...viewContainer.querySelectorAll(".alert-row")];
  const totalAlerts = currentRows.length || 4 + liveAlerts.length;
  const unreadCount = currentRows.length
    ? currentRows.filter((row) => !readAlerts.has(row.dataset.alertId)).length
    : Math.max(totalAlerts - readAlerts.size, 0);
  document.querySelectorAll(".notification-btn em").forEach((indicator) => {
    indicator.hidden = unreadCount === 0;
  });
  document.querySelectorAll(".nav-count").forEach((counter) => {
    counter.textContent = unreadCount;
    counter.hidden = unreadCount === 0;
  });
}
// Simula la recepción periódica de avisos desde sensores de la finca.
function receiveLiveAlert() {
  if (!localStorage.getItem("agrosmart-role")) return;
  const alerts = [
    {
      title: "Humedad baja en Lote Sur 01",
      description: "El sensor H-031 registró 29% de humedad en el suelo.",
      priority: "Alta",
      category: "Humedad",
      tone: "red",
      type: "red",
    },
    {
      title: "Lluvia detectada en la finca",
      description: "Se recomienda pausar el riego durante los próximos 45 minutos.",
      priority: "Info",
      category: "Clima",
      tone: "green",
      type: "blue",
    },
    {
      title: "Revisión de fertilización pendiente",
      description: "La actividad del Lote Norte 03 venció hace 15 minutos.",
      priority: "Media",
      category: "Tarea",
      tone: "amber",
      type: "amber",
    },
  ];
  const alert = { ...alerts[liveAlertSequence % alerts.length], id: ++liveAlertSequence };
  if (alert.category === "Tarea" && managedTasks.find((task) => task.id === 3)?.status === "Completada") return;
  liveAlerts.unshift(alert);
  updateNotificationState();
  if (!document.querySelector(".app-shell")?.classList.contains("app-hidden")) {
    if (document.querySelector("#breadcrumb-title")?.textContent === "Alertas") {
      renderView("alerts");
    } else {
      showToast("Nueva alerta recibida");
    }
  }
}
setInterval(receiveLiveAlert, 20000);
// Pinta los registros de inventario según la vista seleccionada.
function updateInventoryView(view) {
  const body = viewContainer.querySelector(".data-table tbody");
  if (!body) return;
  if (view === "inventory") {
    viewContainer.querySelector("h1").textContent = "Bodega";
    viewContainer.querySelector(".page-subtitle").textContent =
      "Administra las ubicaciones y responsables de almacenamiento.";
    viewContainer.querySelector(".surface-header h2").textContent =
      "Ubicaciones de bodega";
    viewContainer.querySelector(".data-table thead").innerHTML =
      "<tr><th>Bodega</th><th>Ubicación</th><th>Responsable</th><th>Estado</th><th></th></tr>";
    body.innerHTML = managedWarehouses
      .map(
        (warehouse) =>
          `<tr><td><strong>${warehouse.name}</strong></td><td>${warehouse.location}</td><td>${warehouse.responsible}</td><td><span class="stage seed">${warehouse.status}</span></td><td><button class="edit-btn" data-action="edit-warehouse" data-id="${warehouse.id}" title="Editar bodega">${icon("pencil")}</button><button class="delete-btn" data-action="delete-record" data-type="warehouse" data-id="${warehouse.id}" title="Eliminar bodega">${icon("trash-2")}</button></td></tr>`,
      )
      .join("");
    return;
  }
  body.innerHTML = managedInventory
    .map(
      (item) =>
        `<tr><td><strong>${item.name}</strong></td><td>${item.category}</td><td>${item.stock}</td><td><span class="stage ${item.status === "Sin stock" ? "harvest" : "seed"}">${item.status}</span></td><td>${item.updated}</td><td><button class="edit-btn" data-action="edit-inventory" data-id="${item.id}" title="Editar insumo">${icon("pencil")}</button><button class="delete-btn" data-action="delete-record" data-type="supplies" data-id="${item.id}" title="Eliminar insumo">${icon("trash-2")}</button></td></tr>`,
    )
    .join("");
}
// Pinta tareas y miembros del equipo con sus acciones de edición.
function updateTeamView(view) {
  const surfaceElement = viewContainer.querySelector(".surface");
  if (!surfaceElement) return;
  if (view === "team") {
    viewContainer.querySelector("h1").textContent = "Equipo";
    viewContainer.querySelector(".page-subtitle").textContent =
      "Consulta y edita la información de las personas en campo.";
    surfaceElement.querySelector(".surface-header h2").textContent =
      "Personas en campo";
    surfaceElement.querySelectorAll(".metric-line").forEach((row) => row.remove());
    surfaceElement.insertAdjacentHTML(
      "beforeend",
      managedTeam
        .map(
          (person) => {
            const isOnline = person.status === "online";
            const presenceLabel = isOnline ? "En línea ahora" : person.lastSeen || "Sin actividad";
            return `<div class="metric-line"><span>${icon("user-round")} <strong>${person.name}</strong> <small style="color:var(--muted)"> · ${person.role} · ${person.phone}</small><span class="team-presence ${isOnline ? "online" : "offline"}"><span class="status-dot ${isOnline ? "synced" : "red"}"></span>${presenceLabel}</span></span><span><button class="edit-btn" data-action="edit-team" data-id="${person.id}" title="Editar integrante">${icon("pencil")}</button><button class="delete-btn" data-action="delete-record" data-type="team" data-id="${person.id}" title="Eliminar integrante">${icon("trash-2")}</button></span></div>`;
          },
        )
        .join(""),
    );
    return;
  }
  surfaceElement.querySelector(".surface-header h2").textContent = "Tareas activas";
  const taskList = surfaceElement.querySelector(".task-list");
  if (taskList) {
    taskList.innerHTML = managedTasks
      .map(
        (task) =>
          `<div class="metric-line"><span>${icon(task.status === "Completada" ? "check-circle-2" : "circle")} ${task.text} <small style="color:var(--muted)"> · ${task.person}</small></span><span class="task-actions"><span class="stage ${task.tone}">${task.status === "Completada" ? icon("check") : ""}${task.status}</span><button class="task-status-btn task-complete-btn${task.status === "Completada" ? " selected" : ""}" data-action="complete-task" data-id="${task.id}" title="Completar tarea" aria-label="Completar tarea">${icon("check")}</button><button class="task-status-btn task-pending-btn${task.status === "Pendiente" ? " selected" : ""}" data-action="pending-task" data-id="${task.id}" title="Devolver a pendiente" aria-label="Devolver a pendiente">${icon("x")}</button><button class="edit-btn" data-action="edit-task" data-id="${task.id}" title="Editar tarea">${icon("pencil")}</button><button class="delete-btn" data-action="delete-record" data-type="tasks" data-id="${task.id}" title="Eliminar tarea">${icon("trash-2")}</button></span></div>`,
      )
      .join("");
    return;
  }
  surfaceElement.querySelectorAll(".metric-line").forEach((row) => row.remove());
  surfaceElement.insertAdjacentHTML(
    "beforeend",
    managedTasks
    .map(
      (task) =>
        `<div class="metric-line"><span>${icon(task.status === "Completada" ? "check-circle-2" : "circle")} ${task.text} <small style="color:var(--muted)"> · ${task.person}</small></span><span class="task-actions"><span class="stage ${task.tone}">${task.status === "Completada" ? icon("check") : ""}${task.status}</span><button class="task-status-btn task-complete-btn${task.status === "Completada" ? " selected" : ""}" data-action="complete-task" data-id="${task.id}" title="Completar tarea" aria-label="Completar tarea">${icon("check")}</button><button class="task-status-btn task-pending-btn${task.status === "Pendiente" ? " selected" : ""}" data-action="pending-task" data-id="${task.id}" title="Devolver a pendiente" aria-label="Devolver a pendiente">${icon("x")}</button><button class="edit-btn" data-action="edit-task" data-id="${task.id}" title="Editar tarea">${icon("pencil")}</button><button class="delete-btn" data-action="delete-record" data-type="tasks" data-id="${task.id}" title="Eliminar tarea">${icon("trash-2")}</button></span></div>`,
    )
    .join(""),
  );
}

// Actualiza la tabla de ventas y añade sus acciones de edición.
function updateSalesView() {
  const action = viewContainer.querySelector(".page-heading .primary-btn");
  const header = viewContainer.querySelector(".data-table thead tr");
  const body = viewContainer.querySelector(".data-table tbody");
  if (action) {
    action.dataset.action = "new-sale";
    action.innerHTML = `${icon("plus")} Registrar venta`;
  }
  if (header && !header.querySelector(".sales-actions-header")) {
    header.insertAdjacentHTML("beforeend", '<th class="sales-actions-header">Acciones</th>');
  }
  if (!body) return;
  body.innerHTML = managedSales
    .map(
      (sale) =>
        `<tr><td>${sale.date}</td><td><strong>${sale.buyer}</strong></td><td>${sale.product}</td><td>${sale.quantity}</td><td>${sale.total}</td><td><span class="stage ${sale.status === "Pagada" ? "seed" : sale.status === "Pendiente" ? "develop" : "harvest"}">${sale.status}</span></td><td><button class="edit-btn" data-action="edit-sale" data-id="${sale.id}" title="Editar venta">${icon("pencil")}</button><button class="delete-btn" data-action="delete-record" data-type="sales" data-id="${sale.id}" title="Eliminar venta">${icon("trash-2")}</button></td></tr>`,
    )
    .join("");
}
// Renderiza el historial de auditoría con sus acciones disponibles.
function updateAuditView() {
  const heading = viewContainer.querySelector(".page-heading");
  const surfaceElement = viewContainer.querySelector(".surface");
  if (heading && !heading.querySelector('[data-action="new-audit"]')) {
    heading.insertAdjacentHTML(
      "beforeend",
      `<button class="primary-btn" data-action="new-audit">${icon("plus")} Nueva auditoría</button>`,
    );
  }
  if (!surfaceElement) return;
  surfaceElement.querySelectorAll(".metric-line").forEach((row) => row.remove());
  surfaceElement.insertAdjacentHTML(
    "beforeend",
    managedAudits
      .map(
        (audit) =>
          `<div class="metric-line"><span><strong>${audit.user}</strong> ${audit.action}</span><span>${audit.date} <button class="edit-btn" data-action="edit-audit" data-id="${audit.id}" title="Editar auditoría">${icon("pencil")}</button><button class="delete-btn" data-action="delete-record" data-type="audit" data-id="${audit.id}" title="Eliminar auditoría">${icon("trash-2")}</button></span></div>`,
      )
      .join(""),
  );
}
// Abre el editor de un insumo seleccionado.
function editInventoryItem(id) {
  openRecordEditModal("supplies", id);
}
// Abre el editor de una bodega seleccionada.
function editWarehouse(id) {
  openRecordEditModal("warehouse", id);
}
// Abre el editor de una tarea seleccionada.
function editTask(id) {
  openRecordEditModal("tasks", id);
}

// Cambia rápidamente el estado de una tarea desde su fila.
function updateTaskStatus(id, status) {
  const task = managedTasks.find((item) => item.id === id);
  if (!task || task.status === status) return;
  task.status = status;
  task.tone = status === "Completada" ? "seed" : "harvest";
  publishTeamState();
  updateDashboardTeamSummary();
  renderView(activeView === "team" || activeView === "tasks" ? activeView : "tasks");
  showToast(status === "Completada" ? "Tarea completada" : "Tarea pendiente nuevamente");
}
// Abre el editor de un integrante del equipo.
function editTeamMember(id) {
  openRecordEditModal("team", id);
}
// Abre el formulario reutilizable para editar o crear registros.
function openRecordEditModal(type, id = null) {
  const collections = {
    warehouse: managedWarehouses,
    supplies: managedInventory,
    team: managedTeam,
    tasks: managedTasks,
    sales: managedSales,
    audit: managedAudits,
  };
  const record = collections[type]?.find((item) => item.id === id);
  if (id && !record) return;
  const fields = {
    warehouse: [
      ["name", "Nombre de la bodega"],
      ["location", "Ubicación"],
      ["responsible", "Responsable"],
      ["status", "Estado"],
    ],
    supplies: [
      ["name", "Insumo"],
      ["category", "Categoría"],
      ["stock", "Existencia"],
      ["status", "Estado"],
    ],
    team: [
      ["name", "Nombre completo"],
      ["role", "Cargo"],
      ["phone", "Teléfono"],
    ],
    tasks: [
      ["text", "Actividad"],
      ["person", "Responsable"],
      ["status", "Estado"],
    ],
    sales: [
      ["date", "Fecha"],
      ["buyer", "Comprador"],
      ["product", "Producto"],
      ["quantity", "Cantidad"],
      ["total", "Total"],
      ["status", "Estado"],
    ],
    audit: [
      ["user", "Usuario"],
      ["action", "Actividad"],
      ["date", "Fecha"],
    ],
  }[type];
  const form = document.querySelector("#record-edit-form");
  form.dataset.type = type;
  form.dataset.id = id;
  form.innerHTML = `${fields.map(([key, label]) => `<label class="modal-field">${label}${type === "tasks" && key === "status" ? '<select data-edit-field="status" required><option>Pendiente</option><option>En curso</option><option>Completada</option></select>' : type === "supplies" && key === "status" ? '<select data-edit-field="status" required><option>En stock</option><option>Sin stock</option></select>' : type === "sales" && key === "status" ? '<select data-edit-field="status" required><option>Pendiente</option><option>Pagada</option><option>Despachada</option></select>' : `<input data-edit-field="${key}" required />`}</label>`).join("")}<div class="modal-actions"><button type="button" class="secondary-btn" data-action="close-record-edit">Cancelar</button><button type="submit" class="primary-btn">Guardar cambios</button></div>`;
  fields.forEach(([key]) => {
    form.querySelector(`[data-edit-field="${key}"]`).value = record?.[key] || "";
  });
  const modal = document.querySelector("#record-edit-modal");
  document.querySelector("#record-edit-title").textContent =
    type === "warehouse" ? "Editar bodega" : type === "supplies" ? "Editar insumo" : type === "team" ? "Editar integrante" : type === "tasks" ? "Editar tarea" : type === "sales" ? (record ? "Editar venta" : "Nueva venta") : record ? "Editar auditoría" : "Nueva auditoría";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  lucide.createIcons();
  focusFirstField("record-edit-modal");
}
// Cierra el modal genérico de edición.
function closeRecordEditModal() {
  const modal = document.querySelector("#record-edit-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
// Persiste los cambios del modal en la colección local correspondiente.
function saveRecordEdit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const type = form.dataset.type;
  const id = Number(form.dataset.id);
  const collections = {
    warehouse: managedWarehouses,
    supplies: managedInventory,
    team: managedTeam,
    tasks: managedTasks,
    sales: managedSales,
    audit: managedAudits,
  };
  const collection = collections[type];
  const record = collection?.find((item) => item.id === id);
  const values = {};
  form.querySelectorAll("[data-edit-field]").forEach((field) => {
    values[field.dataset.editField] = field.value.trim();
  });
  if (!record) collection.push({ id: Date.now(), ...values });
  else Object.assign(record, values);
  if (type === "tasks") {
    const task = record || collection.at(-1);
    task.tone = task.status === "Completada" ? "seed" : task.status === "Pendiente" ? "harvest" : "develop";
  }
  if (type === "supplies" && record) record.updated = "Ahora";
  if (type === "team" || type === "tasks") publishTeamState();
  closeRecordEditModal();
  const view = type === "warehouse" ? "inventory" : type === "supplies" ? "supplies" : type;
  renderView(view);
  showToast(record ? "Cambios guardados" : "Registro creado");
}
// Elimina un registro operativo después de pedir confirmación.
function deleteEditableRecord(type, id) {
  const collections = {
    warehouse: managedWarehouses,
    supplies: managedInventory,
    team: managedTeam,
    tasks: managedTasks,
    sales: managedSales,
    audit: managedAudits,
  };
  const collection = collections[type];
  const record = collection?.find((item) => item.id === id);
  const label = record?.name || record?.text || record?.buyer || record?.action || "este registro";
  if (!record || !confirm(`¿Eliminar este registro: ${label}?`)) return;
  const index = collection.indexOf(record);
  collection.splice(index, 1);
  if (type === "team" || type === "tasks") publishTeamState();
  const view = type === "warehouse" ? "inventory" : type === "supplies" ? "supplies" : type;
  renderView(view);
  showToast("Registro eliminado");
}
// Mantiene la lectura de alertas en memoria durante la sesión.
function markAlertRead(alertId) {
  readAlerts.add(alertId);
  renderView("alerts");
  showToast("Alerta marcada como leída");
}
// Devuelve una alerta al estado no leído.
function markAlertUnread(alertId) {
  readAlerts.delete(alertId);
  renderView("alerts");
  showToast("Alerta marcada como no leída");
}
// Marca todas las alertas visibles como atendidas.
function markAllAlertsRead() {
  document
    .querySelectorAll(".alert-row")
    .forEach((row) => readAlerts.add(row.dataset.alertId));
  renderView("alerts");
  showToast("Todas las alertas fueron marcadas como leídas");
}
// Adapta la vista de cosecha a los registros almacenados localmente.
function updateHarvestView() {
  const action = viewContainer.querySelector('[data-action="toast"]');
  const body = viewContainer.querySelector(".data-table tbody");
  if (!action || !body) return;
  viewContainer.querySelector("h1").textContent = "Cosecha";
  viewContainer.querySelector(".page-subtitle").textContent =
    "Registra y consulta la producción recolectada en tu finca.";
  viewContainer.querySelector(".kpi.blue")?.remove();
  action.dataset.action = "new-harvest";
  action.innerHTML = `${icon("plus")} Registrar cosecha`;
  body.innerHTML = managedHarvests.length
    ? managedHarvests
        .map(
          (harvest) =>
            `<tr><td>${harvest.date}</td><td><strong>${harvest.crop}</strong></td><td>${harvest.lot}</td><td>${harvest.quantity}</td><td><span class="stage ${harvest.quality === "Premium" ? "harvest" : "seed"}">${harvest.quality}</span></td><td><button class="delete-btn" data-action="delete-harvest" data-id="${harvest.id}" title="Eliminar cosecha">${icon("trash-2")}</button></td></tr>`,
        )
        .join("")
    : '<tr><td colspan="6" class="empty-state">Aún no hay cosechas registradas.</td></tr>';
  viewContainer
    .querySelectorAll('[data-action="delete-harvest"]')
    .forEach((button) =>
      button.addEventListener("click", () =>
        deleteManagedHarvest(Number(button.dataset.id)),
      ),
    );
}
// Abre el formulario para registrar una nueva cosecha.
function openHarvestModal() {
  const form = document.querySelector("#harvest-form");
  form.reset();
  const modal = document.querySelector("#harvest-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  lucide.createIcons();
  focusFirstField("harvest-modal");
}
// Oculta el modal de registro de cosechas.
function closeHarvestModal() {
  const modal = document.querySelector("#harvest-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
// Valida y agrega una cosecha al conjunto de datos local.
function saveHarvest(event) {
  event.preventDefault();
  const dateValue = document.querySelector("#harvest-date-input").value;
  const date = new Date(`${dateValue}T00:00:00`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
  managedHarvests.unshift({
    id: Date.now(),
    date,
    crop: document.querySelector("#harvest-crop-input").value.trim(),
    lot: document.querySelector("#harvest-lot-input").value.trim(),
    quantity: document.querySelector("#harvest-quantity-input").value.trim(),
    quality: document.querySelector("#harvest-quality-input").value,
  });
  closeHarvestModal();
  renderView("harvest");
  showToast("Cosecha registrada");
}
// Elimina una cosecha después de solicitar confirmación.
function deleteManagedHarvest(id) {
  const harvest = managedHarvests.find((item) => item.id === id);
  if (!harvest || !confirm(`¿Eliminar la cosecha de ${harvest.crop}?`)) return;
  managedHarvests = managedHarvests.filter((item) => item.id !== id);
  renderView("harvest");
  showToast("Cosecha eliminada");
}
// Cambia la simulación visual entre conexión y modo offline.
function toggleConnection() {
  const button = document.querySelector(".connection-btn");
  const dot = button.querySelector(".status-dot");
  const label = button.querySelector(".connection-label");
  const offline = button.classList.toggle("offline");
  button.classList.remove("pending");
  dot.className = `status-dot ${offline ? "red" : "synced"}`;
  label.textContent = offline ? "Sin conexión" : "Sincronizado";
  showToast(offline ? "Modo sin conexión activado" : "Conexión restablecida");
}
// Conecta el selector de usuario y actualiza el contexto visual.
function bindRoleControls() {
  document
    .querySelectorAll('[data-action="toggle-role-menu"]')
    .forEach((button) => button.addEventListener("click", toggleRoleMenu));
  document
    .querySelector('[data-action="close-role-menu"]')
    ?.addEventListener("click", closeRoleMenu);
  document
    .querySelectorAll(".role-option")
    .forEach((option) =>
      option.addEventListener("click", () => switchRole(option.dataset.role)),
    );
  document
    .querySelectorAll("[data-role]")
    .forEach((option) =>
      option.addEventListener("click", () => switchRole(option.dataset.role)),
    );
}
// Define si el perfil actual tiene permisos de administración global.
function canManageUsers() {
  return activeRole === "superAdmin";
}
// Vincula los botones y el formulario del modal de usuarios.
function bindUserModalControls() {
  document
    .querySelectorAll('[data-action="close-user-modal"]')
    .forEach((button) => button.addEventListener("click", closeUserModal));
  document
    .querySelector('[data-action="toggle-password"]')
    .addEventListener("click", togglePasswordVisibility);
  document.querySelector("#user-form").addEventListener("submit", saveUser);
  document.querySelector("#user-modal").addEventListener("click", (event) => {
    if (event.target.id === "user-modal") closeUserModal();
  });
}
// Vincula los botones y el formulario del modal de cosechas.
function bindHarvestModalControls() {
  document
    .querySelectorAll('[data-action="close-harvest-modal"]')
    .forEach((button) => button.addEventListener("click", closeHarvestModal));
  document
    .querySelector("#harvest-form")
    .addEventListener("submit", saveHarvest);
  document.querySelector("#harvest-modal").addEventListener("click", (event) => {
    if (event.target.id === "harvest-modal") closeHarvestModal();
  });
}
// Vincula el formulario para programar actividades en fechas específicas.
function bindCalendarModalControls() {
  document
    .querySelectorAll('[data-action="close-calendar-modal"]')
    .forEach((button) => button.addEventListener("click", closeCalendarModal));
  document
    .querySelector("#calendar-form")
    .addEventListener("submit", saveCalendarEvent);
  document.querySelector("#calendar-modal").addEventListener("click", (event) => {
    if (event.target.id === "calendar-modal") closeCalendarModal();
  });
}
// Vincula el formulario genérico usado por los registros operativos.
function bindRecordEditControls() {
  document
    .querySelectorAll('[data-action="close-record-edit"]')
    .forEach((button) => button.addEventListener("click", closeRecordEditModal));
  document
    .querySelector("#record-edit-form")
    .addEventListener("submit", saveRecordEdit);
  document.querySelector("#record-edit-modal").addEventListener("click", (event) => {
    if (event.target.id === "record-edit-modal") closeRecordEditModal();
  });
}
// Alterna la visibilidad de la contraseña en el formulario de usuario.
function togglePasswordVisibility() {
  const input = document.querySelector("#user-password-input");
  const button = document.querySelector('[data-action="toggle-password"]');
  const visible = input.type === "text";
  input.type = visible ? "password" : "text";
  button.title = visible ? "Mostrar contraseña" : "Ocultar contraseña";
  button.innerHTML = `<i data-lucide="${visible ? "eye" : "eye-off"}"></i>`;
  lucide.createIcons();
}
// Convierte la clave interna de un rol en su etiqueta visible.
function roleLabel(role) {
  return role === "superAdmin"
    ? "SuperAdmin"
    : role === "admin"
      ? "Administrador de Finca"
      : "Trabajador de Campo";
}
// Abre el formulario de usuarios en modo creación o edición.
function openUserModal(id = null) {
  const user = managedUsers.find((item) => item.id === id);
  document.querySelector("#user-modal-title").textContent = user
    ? "Editar usuario"
    : "Nuevo usuario";
  document.querySelector("#user-name-input").value = user?.name || "";
  document.querySelector("#user-email-input").value = user?.email || "";
  document.querySelector("#user-password-input").value = user?.password || "";
  document.querySelector("#user-password-input").type = "password";
  document.querySelector('[data-action="toggle-password"]').innerHTML =
    '<i data-lucide="eye"></i>';
  document.querySelector("#user-role-input").value = user?.roleKey || "admin";
  document.querySelector("#user-status-input").value = user?.status || "Activo";
  document.querySelector("#user-form").dataset.editingId = id || "";
  const modal = document.querySelector("#user-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  lucide.createIcons();
  focusFirstField("user-modal");
}
// Cierra el modal de usuarios y restaura su estado accesible.
function closeUserModal() {
  const modal = document.querySelector("#user-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
// Valida y guarda un usuario en el directorio local.
function saveUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const roleKey = document.querySelector("#user-role-input").value;
  const name = document.querySelector("#user-name-input").value.trim();
  const email = document.querySelector("#user-email-input").value.trim();
  const password = document.querySelector("#user-password-input").value;
  const status = document.querySelector("#user-status-input").value;
  const editingId = Number(form.dataset.editingId);
  if (!name || !email || password.length < 6) return;
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const record = {
    name,
    email,
    password,
    role: roleLabel(roleKey),
    roleKey,
    status,
    initials,
  };
  if (editingId)
    managedUsers = managedUsers.map((user) =>
      user.id === editingId ? { ...user, ...record } : user,
    );
  else managedUsers.push({ id: Date.now(), ...record });
  closeUserModal();
  renderView("users-management");
  showToast(editingId ? "Usuario actualizado" : "Usuario creado");
}
// Recupera la pantalla de administración activa para volver a ella.
function returnToManagementView() {
  return (
    document.querySelector(".nav-item.active")?.dataset.view || "management"
  );
}
function deleteManagedUser(id) {
  const user = managedUsers.find((item) => item.id === id);
  if (!user || !confirm(`¿Eliminar a ${user.name} y revocar su acceso?`))
    return;
  managedUsers = managedUsers.filter((item) => item.id !== id);
  renderView(returnToManagementView());
  showToast("Usuario eliminado");
}
// Elimina un cultivo del catálogo después de pedir confirmación.
function deleteManagedCrop(id) {
  const crop = managedCrops.find((item) => item.id === id);
  if (!crop || !confirm(`¿Eliminar el cultivo ${crop.name}?`)) return;
  managedCrops = managedCrops.filter((item) => item.id !== id);
  renderView(returnToManagementView());
  showToast("Cultivo eliminado");
}
// Sincroniza nombre, avatar y textos del usuario activo.
function updateUserChrome(profile) {
  document.querySelector("#sidebar-avatar").textContent = profile.initials;
  document.querySelector("#top-avatar").textContent = profile.initials;
  document.querySelector("#sidebar-user-name").textContent = profile.name;
  document.querySelector("#sidebar-user-role").textContent = profile.label;
  document
    .querySelectorAll(".role-option")
    .forEach((option) =>
      option.classList.toggle("active", option.dataset.role === activeRole),
    );
  document
    .querySelectorAll(
      '[data-view="management"],[data-view="users-management"],[data-view="crops-management"]',
    )
    .forEach((item) => item.classList.toggle("role-hidden", !canManageUsers()));
}
// Inicia la sesión local y muestra la pantalla inicial del rol elegido.
function startSession(role) {
  const profile = roleProfiles[role] || roleProfiles.admin;
  activeRole = role;
  localStorage.setItem("agrosmart-role", role);
  const appScreen = document.querySelector("#app-screen");
  appScreen.classList.remove("app-hidden");
  appScreen.setAttribute("aria-hidden", "false");
  document.body.dataset.screen = "app";
  updateUserChrome(profile);
  renderView(profile.home);
  showToast();
}
// Cierra la sesión local y devuelve al acceso.
function logout() {
  updateTeamPresence("offline");
  localStorage.removeItem("agrosmart-role");
  window.location.href = "login.html";
}
// Abre o cierra el menú de cambio de perfil.
function toggleRoleMenu() {
  const menu = document.querySelector("#role-switcher-menu");
  menu.classList.toggle("open");
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("open")));
}
function closeRoleMenu() {
  const menu = document.querySelector("#role-switcher-menu");
  menu.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");
}
// Cambia de perfil sin recargar la aplicación.
function switchRole(role) {
  if (role === "field") role = "usuario";
  const profile = roleProfiles[role];
  if (!profile) return;
  activeRole = role;
  localStorage.setItem("agrosmart-role", role);
  document.querySelector("#sidebar-avatar").textContent = profile.initials;
  document.querySelector("#top-avatar").textContent = profile.initials;
  document.querySelector("#sidebar-user-name").textContent = profile.name;
  document.querySelector("#sidebar-user-role").textContent = profile.label;
  document
    .querySelectorAll(".role-option")
    .forEach((option) =>
      option.classList.toggle("active", option.dataset.role === role),
    );
  closeRoleMenu();
  renderView(profile.home);
  showToast();
}
document
  .querySelectorAll(".nav-item")
  .forEach((item) =>
    item.addEventListener("click", () => renderView(item.dataset.view)),
  );
document
  .querySelector(".connection-btn")
  .addEventListener("click", toggleConnection);
document
  .querySelector(".notification-btn")
  ?.addEventListener("click", () => renderView("alerts"));
// El botón de cerrar sesión vive fuera de #view-container: se vincula una sola vez.
document
  .querySelectorAll('[data-action="logout"]')
  .forEach((el) => el.addEventListener("click", logout));
// Cierra el menú de perfil cuando se hace clic fuera de él.
document.addEventListener("click", (event) => {
  const menu = document.querySelector("#role-switcher-menu");
  if (
    menu?.classList.contains("open") &&
    !event.target.closest("#role-switcher-menu") &&
    !event.target.closest('[data-action="toggle-role-menu"]')
  )
    closeRoleMenu();
});
// Recupera datos compartidos, rol y tema para conservar la experiencia offline.
loadTeamState();
const storedRole = localStorage.getItem("agrosmart-role");
if (storedRole && roleProfiles[storedRole]) activeRole = storedRole;
const initialProfile = roleProfiles[activeRole];
updateUserChrome(initialProfile);
bindRoleControls();
bindUserModalControls();
bindHarvestModalControls();
bindCalendarModalControls();
bindRecordEditControls();
renderView(initialProfile.home);
updateNotificationState();
if (localStorage.getItem("agrosmart-theme") === "dark")
  document.body.classList.add("dark");
updateThemeButton();
document
  .querySelectorAll('[data-action="toggle-theme"]')
  .forEach((button) => button.addEventListener("click", toggleTheme));
lucide.createIcons();
const routeRole = new URLSearchParams(location.search).get("role");
if (routeRole && roleProfiles[routeRole]) {
  startSession(routeRole);
}
updateTeamPresence("online");
setInterval(() => updateTeamPresence("online"), 15000);
// Alterna el tema y lo comparte con la pantalla de inicio.
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("agrosmart-theme", isDark ? "dark" : "light");
  updateThemeButton();
  showToast(isDark ? "Modo oscuro activado" : "Modo claro activado");
}
// Actualiza el icono del control de tema después de cada cambio.
function updateThemeButton() {
  const isDark = document.body.classList.contains("dark");
  document.querySelectorAll('[data-action="toggle-theme"]').forEach((button) => {
    button.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}"></i>`;
    button.title = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  });
  lucide.createIcons();
}
