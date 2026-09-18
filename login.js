// Controles del acceso y estado del rol seleccionado.
const roleButtons = [...document.querySelectorAll(".auth-role")];
const themeButtons = [...document.querySelectorAll('[data-action="toggle-theme"]')];
let selectedRole = "admin";

// Mantiene el icono y la ayuda del botón sincronizados con el tema activo.
function updateThemeButton() {
  const isDark = document.body.classList.contains("dark");
  themeButtons.forEach((button) => {
    button.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}"></i>`;
    button.title = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  });
  lucide.createIcons();
}

// Guarda la preferencia para que login y aplicación usen el mismo tema.
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("agrosmart-theme", isDark ? "dark" : "light");
  updateThemeButton();
}

// Permite seleccionar el perfil que se enviará a la aplicación.
roleButtons.forEach((button) => {
  button.setAttribute("aria-pressed", String(button.dataset.authRole === selectedRole));
  button.addEventListener("click", () => {
    selectedRole = button.dataset.authRole;
    roleButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
  });
});

// Los botones de acceso y tema trabajan sin recargar la pantalla.
themeButtons.forEach((button) => button.addEventListener("click", toggleTheme));
document.querySelector('[data-action="login"]').addEventListener("click", () => {
  window.location.href = `index.html?role=${encodeURIComponent(selectedRole)}`;
});

// Restaura el tema elegido en una visita anterior.
if (localStorage.getItem("agrosmart-theme") === "dark") {
  document.body.classList.add("dark");
}
updateThemeButton();
lucide.createIcons();
