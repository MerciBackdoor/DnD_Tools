const field = document.getElementById("field");
const setupForm = document.getElementById("setupForm");
const unitForm = document.getElementById("unitForm");
const deleteBtn = document.getElementById("deleteBtn");
const clearBtn = document.getElementById("clearBtn");

let grid = { width: 10, height: 10, cellSize: 40 };
const units = [];
let deleteMode = false;

function saveState() {
  const state = {
    grid: { width: grid.width, height: grid.height },
    units: units.map(u => ({
      name: u.el.getAttribute("data-name"),
      color: u.el.style.backgroundColor,
      size: u.size,
      x: u.x,
      y: u.y
    }))
  };
  localStorage.setItem("fieldState", JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem("fieldState");
  if (!saved) return false;

  const state = JSON.parse(saved);
  grid.width = state.grid.width;
  grid.height = state.grid.height;

  document.getElementById("width").value = grid.width;
  document.getElementById("height").value = grid.height;

  setupField();

  for (const udata of state.units) {
    if (
      udata.x < 0 || udata.y < 0 ||
      udata.x + udata.size > grid.width ||
      udata.y + udata.size > grid.height
    ) continue;

    if (!canEnter(udata.x, udata.y, udata.size)) continue;

    const unit = document.createElement("div");
    unit.className = "unit";
    unit.style.width = `${udata.size * grid.cellSize}px`;
    unit.style.height = `${udata.size * grid.cellSize}px`;
    unit.style.left = `${udata.x * grid.cellSize}px`;
    unit.style.top = `${udata.y * grid.cellSize}px`;
    unit.style.backgroundColor = udata.color;
    unit.setAttribute("data-name", udata.name);

    field.appendChild(unit);
    const obj = { el: unit, x: udata.x, y: udata.y, size: udata.size };
    units.push(obj);
    enableDragging(obj);
  }
  return true;
}

function setupField() {
  field.innerHTML = '';
  field.style.width = `${grid.width * grid.cellSize}px`;
  field.style.height = `${grid.height * grid.cellSize}px`;

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.width = `${grid.cellSize}px`;
      cell.style.height = `${grid.cellSize}px`;
      cell.style.left = `${x * grid.cellSize}px`;
      cell.style.top = `${y * grid.cellSize}px`;
      field.appendChild(cell);
    }
  }
}

setupForm.onsubmit = (e) => {
  e.preventDefault();
  grid.width = Math.min(999, Math.max(1, parseInt(document.getElementById("width").value)));
  grid.height = Math.min(999, Math.max(1, parseInt(document.getElementById("height").value)));

  // При изменении размера поля очищаем старые юниты
  for (const u of units) {
    if (u.el.parentElement) u.el.parentElement.removeChild(u.el);
  }
  units.length = 0;

  setupField();
  saveState();
};

unitForm.onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById("unitName").value.trim();
  const color = document.getElementById("unitColor").value;
  const size = parseInt(document.getElementById("unitSize").value);
  const x = parseInt(document.getElementById("unitX").value);
  const y = parseInt(document.getElementById("unitY").value);

  if (x < 0 || y < 0 || x + size > grid.width || y + size > grid.height) {
    alert("Юнит выходит за границы.");
    return;
  }

  if (!canEnter(x, y, size)) {
    alert("Недопустимое размещение: пересечение с другим юнитом.");
    return;
  }

  const unit = document.createElement("div");
  unit.className = "unit";
  unit.style.width = `${size * grid.cellSize}px`;
  unit.style.height = `${size * grid.cellSize}px`;
  unit.style.left = `${x * grid.cellSize}px`;
  unit.style.top = `${y * grid.cellSize}px`;
  unit.style.backgroundColor = color;
  unit.setAttribute("data-name", name);

  field.appendChild(unit);
  const obj = { el: unit, x, y, size };
  units.push(obj);
  enableDragging(obj);

  saveState();
};

function canEnter(x, y, size, currentUnit = null) {
  for (let u of units) {
    if (u === currentUnit) continue;
    const overlap = !(x + size <= u.x || u.x + u.size <= x || y + size <= u.y || u.y + u.size <= y);
    const diff = Math.abs(u.size - size);
    if (overlap && diff <= 1) return false;
  }
  return true;
}

function enableDragging(unitObj) {
  const unit = unitObj.el;
  let dragging = false;

  unit.addEventListener("mousedown", (e) => {
    if (deleteMode) {
      if (confirm(`Удалить юнит "${unit.getAttribute("data-name")}"?`)) {
        field.removeChild(unit);
        const index = units.indexOf(unitObj);
        if (index !== -1) units.splice(index, 1);
        saveState();
      }
      return;
    }
    dragging = true;
    unit.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = field.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gx = Math.floor(mouseX / grid.cellSize);
    const gy = Math.floor(mouseY / grid.cellSize);

    if (
      gx >= 0 &&
      gy >= 0 &&
      gx + unitObj.size <= grid.width &&
      gy + unitObj.size <= grid.height &&
      canEnter(gx, gy, unitObj.size, unitObj)
    ) {
      unit.style.left = `${gx * grid.cellSize}px`;
      unit.style.top = `${gy * grid.cellSize}px`;
      unitObj.x = gx;
      unitObj.y = gy;
    }
  });

  document.addEventListener("mouseup", () => {
    if (dragging) {
      dragging = false;
      unit.style.cursor = "grab";
      saveState();
    }
  });
}

deleteBtn.addEventListener("click", () => {
  deleteMode = !deleteMode;
  deleteBtn.classList.toggle("active", deleteMode);
  for (let u of units) {
    u.el.classList.toggle("delete-mode", deleteMode);
  }
});

clearBtn.addEventListener("click", () => {
  if (confirm("Вы действительно хотите полностью очистить поле? Все юниты будут удалены и размер сброшен.")) {
    // Сброс размеров до 10x10
    grid.width = 10;
    grid.height = 10;
    document.getElementById("width").value = 10;
    document.getElementById("height").value = 10;

    // Удаляем все юниты
    for (const u of units) {
      if (u.el.parentElement) u.el.parentElement.removeChild(u.el);
    }
    units.length = 0;

    setupField();
    deleteMode = false;
    deleteBtn.classList.remove("active");

    saveState();
  }
});

// При загрузке страницы пытаемся загрузить сохранённое состояние
if (!loadState()) {
  // Если сохранения нет, создаём поле по умолчанию
  setupField();
}
