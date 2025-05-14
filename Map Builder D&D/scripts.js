const gridContainer = document.getElementById('grid-container');
const surfaceTool = document.getElementById('surface-tool');
const wallsTool = document.getElementById('walls-tool');
const envTool = document.getElementById('env-tool');
const deleteBtn = document.getElementById('delete-btn');

let currentTool = '';
let removeMode = false;
let zoomLevel = 1;

// --- EDGE DATA STRUCTURE ---
let edgeMap = {}; // { "x,y,dir": { wall: true, door: true/false, window: true/false } }
let cellMap = {}; // { "x,y": { floor: "type", object: "type" } }

// --- Provide default implementations for patching ---
function setEdgeBase(x, y, dir, type) {
  const key = edgeKey(x, y, dir);
  if (!edgeMap[key]) edgeMap[key] = {};
  if (type === 'wall') {
    edgeMap[key].wall = true;
    // Do not touch door/window
  } else if (type === 'door') {
    edgeMap[key].wall = true; // Always keep wall!
    edgeMap[key].door = true;
    edgeMap[key].window = false;
  } else if (type === 'window') {
    edgeMap[key].wall = true; // Always keep wall!
    edgeMap[key].window = true;
    edgeMap[key].door = false;
  } else if (type === null) {
    // Remove all
    delete edgeMap[key];
  }
  // Remove empty objects
  if (
    edgeMap[key] &&
    !edgeMap[key].wall &&
    !edgeMap[key].door &&
    !edgeMap[key].window
  ) {
    delete edgeMap[key];
  }
}

// --- Find nearest edge of a cell to the mouse click ---
function getNearestEdge(cell, event) {
  const rect = cell.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const w = rect.width;
  const h = rect.height;
  const dTop = y;
  const dBottom = h - y;
  const dLeft = x;
  const dRight = w - x;
  const min = Math.min(dTop, dBottom, dLeft, dRight);
  if (min === dTop) return 'top';
  if (min === dBottom) return 'bottom';
  if (min === dLeft) return 'left';
  return 'right';
}

function onCellClickBase(cell, event) {
  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);

  if (removeMode) {
    // If clicked on an object, remove only that object
    if (event.target !== cell && event.target.className && event.target.className.startsWith('object-')) {
      cell.removeChild(event.target);
      if (cell.children.length === 0) {
        if (cellMap[`${x},${y}`]) delete cellMap[`${x},${y}`].object;
      }
      return;
    }
    // Otherwise, remove floor and edges for this cell
    cell.className = 'grid-cell';
    if (cellMap[`${x},${y}`]) delete cellMap[`${x},${y}`].floor;
    ['top','bottom','left','right'].forEach(dir => setEdge(x, y, dir, null));
    renderBorders();
    return;
  }
  if (!currentTool) return;

  const floorTypes = [
    'floor', 'shaded', 'floor-boardwalk', 'floor-water',
    'floor-lava', 'floor-zamlana', 'floor-grass'
  ];
  if (floorTypes.includes(currentTool)) {
    cell.className = 'grid-cell ' + currentTool;
    cellMap[`${x},${y}`] = { ...cellMap[`${x},${y}`], floor: currentTool };
    renderBorders();
    return;
  }

  // Walls, doors, windows: place on nearest edge
  if (['wall', 'door', 'window'].includes(currentTool)) {
    const dir = getNearestEdge(cell, event);
    const edge = getEdge(x, y, dir);
    if (currentTool === 'wall') {
      setEdge(x, y, dir, 'wall');
      renderBorders();
    } else if (currentTool === 'door') {
      if (edge.wall) {
        setEdge(x, y, dir, 'door');
        renderBorders();
      }
    } else if (currentTool === 'window') {
      if (edge.wall) {
        setEdge(x, y, dir, 'window');
        renderBorders();
      }
    }
    return;
  }

  // Place environment object
  const objectTypes = [
    'object-chest', 'object-crate', 'object-table', 'object-chair', 'object-bench',
    'object-barrel', 'object-barstool', 'object-column',
    'object-torch-left', 'object-torch-right', 'object-torch-top', 'object-torch-bottom',
    'object-tree', 'object-rock'
  ];
  if (objectTypes.includes(currentTool)) {
    Array.from(cell.children).forEach(child => {
      if (child.className && child.className.startsWith('object-')) child.remove();
    });
    const obj = document.createElement('div');
    obj.className = currentTool;
    if (currentTool === 'object-column') {
      obj.style.position = 'absolute';
      obj.style.left = '50%';
      obj.style.top = '50%';
      obj.style.transform = 'translate(-50%, -50%)';
    } else if (currentTool.startsWith('object-torch-')) {
      obj.style.position = 'absolute';
      obj.style.zIndex = 3;
      if (currentTool === 'object-torch-left') {
        obj.style.left = '-3px';
        obj.style.top = '50%';
        obj.style.transform = 'translateY(-50%)';
      } else if (currentTool === 'object-torch-right') {
        obj.style.right = '-3px';
        obj.style.top = '50%';
        obj.style.transform = 'translateY(-50%)';
      } else if (currentTool === 'object-torch-top') {
        obj.style.top = '-3px';
        obj.style.left = '50%';
        obj.style.transform = 'translateX(-50%)';
      } else if (currentTool === 'object-torch-bottom') {
        obj.style.bottom = '-3px';
        obj.style.left = '50%';
        obj.style.transform = 'translateX(-50%)';
      }
    } else {
      obj.style.position = 'absolute';
      const rect = cell.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;
      obj.style.left = `${cx}px`;
      obj.style.top = `${cy}px`;
      obj.style.transform = 'translate(-50%, -50%)';
      // Save position
      cellMap[`${x},${y}`] = { ...cellMap[`${x},${y}`], object: currentTool, objPos: { left: cx, top: cy } };
    }
    obj.addEventListener('click', function(e) {
      if (removeMode) {
        cell.removeChild(obj);
        if (cell.children.length === 0 && cellMap[`${x},${y}`]) delete cellMap[`${x},${y}`].object;
        e.stopPropagation();
      }
    });
    cell.appendChild(obj);
    cellMap[`${x},${y}`] = { ...cellMap[`${x},${y}`], object: currentTool };
    renderBorders();
    return;
  }
}

// --- Make sure these are defined globally for patching ---
let setEdge = setEdgeBase;
let onCellClick = onCellClickBase;

// --- TOOL SELECTION ---
function updateDeleteBtn() {
  deleteBtn.classList.toggle('active-delete', removeMode);
}
function toggleRemoveMode() {
  removeMode = !removeMode;
  if (removeMode) {
    surfaceTool.selectedIndex = 0;
    wallsTool.selectedIndex = 0;
    envTool.selectedIndex = 0;
    currentTool = '';
  }
  updateDeleteBtn();
}
surfaceTool.addEventListener('change', function() {
  currentTool = this.value;
  if (this.selectedIndex !== 0) {
    wallsTool.selectedIndex = 0;
    envTool.selectedIndex = 0;
  }
  removeMode = false;
  updateDeleteBtn();
});
wallsTool.addEventListener('change', function() {
  currentTool = this.value;
  if (this.selectedIndex !== 0) {
    surfaceTool.selectedIndex = 0;
    envTool.selectedIndex = 0;
  }
  removeMode = false;
  updateDeleteBtn();
});
envTool.addEventListener('change', function() {
  currentTool = this.value;
  if (this.selectedIndex !== 0) {
    surfaceTool.selectedIndex = 0;
    wallsTool.selectedIndex = 0;
  }
  removeMode = false;
  updateDeleteBtn();
});

// --- GRID CREATION ---
// If isNew is true, reset edgeMap/cellMap, else preserve them (for loading)
function createGrid(isNew = false) {
  gridContainer.innerHTML = '';
  if (isNew) {
    edgeMap = {};
    cellMap = {};
  }

  const width = Math.max(1, parseInt(document.getElementById('width').value));
  const height = Math.max(1, parseInt(document.getElementById('height').value));

  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.style.setProperty('--grid-width', width);
  grid.style.setProperty('--grid-height', height);
  grid.style.position = 'relative';
  grid.style.width = `${width * 32}px`;
  grid.style.height = `${height * 32}px`;

  // Render cells
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.style.gridColumn = x + 1;
      cell.style.gridRow = y + 1;
      cell.addEventListener('click', (e) => onCellClick(cell, e));
      grid.appendChild(cell);
    }
  }

  gridContainer.appendChild(grid);

  // Restore cell states if present
  if (cellMap && Object.keys(cellMap).length > 0) {
    for (const key in cellMap) {
      const [x, y] = key.split(',').map(Number);
      const cell = grid.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
      if (!cell) continue;
      if (cellMap[key].floor) cell.className = 'grid-cell ' + cellMap[key].floor;
      if (cellMap[key].object) {
        const obj = document.createElement('div');
        obj.className = cellMap[key].object;
        obj.style.position = 'absolute';
        // Restore position if saved
        if (cellMap[key].objPos && typeof cellMap[key].objPos.left === 'number' && typeof cellMap[key].objPos.top === 'number') {
          obj.style.left = `${cellMap[key].objPos.left}px`;
          obj.style.top = `${cellMap[key].objPos.top}px`;
          obj.style.transform = 'translate(-50%, -50%)';
        } else {
          // Default: center
          obj.style.left = '50%';
          obj.style.top = '50%';
          obj.style.transform = 'translate(-50%, -50%)';
        }
        obj.addEventListener('click', function(e) {
          if (removeMode) {
            cell.removeChild(obj);
            if (cell.children.length === 0 && cellMap[`${x},${y}`]) delete cellMap[`${x},${y}`].object;
            e.stopPropagation();
          }
        });
        cell.appendChild(obj);
      }
    }
  }

  renderBorders();
}

// --- EDGE HELPERS ---
function edgeKey(x, y, dir) { return `${x},${y},${dir}`; }
function getEdge(x, y, dir) { return edgeMap[edgeKey(x, y, dir)] || {}; }

// --- RENDER BORDERS (WALLS/DOORS/WINDOWS) ---
function renderBorders() {
  document.querySelectorAll('.grid-border').forEach(el => el.remove());
  const grid = gridContainer.querySelector('.grid');
  if (!grid) return;

  for (const key in edgeMap) {
    const [x, y, dir] = key.split(',').map((v, i) => i < 2 ? parseInt(v) : v);
    const edge = edgeMap[key];

    // Wall
    if (edge.wall) {
      const wall = document.createElement('div');
      wall.className = 'grid-border wall-border';
      if (dir === 'top') {
        wall.classList.add('horizontal-border');
        wall.style.left = `${x * 32}px`;
        wall.style.top = `${y * 32 - 2}px`;
        wall.style.width = '32px';
        wall.style.height = '4px';
      } else if (dir === 'bottom') {
        wall.classList.add('horizontal-border');
        wall.style.left = `${x * 32}px`;
        wall.style.top = `${(y + 1) * 32 - 2}px`;
        wall.style.width = '32px';
        wall.style.height = '4px';
      } else if (dir === 'left') {
        wall.classList.add('vertical-border');
        wall.style.left = `${x * 32 - 2}px`;
        wall.style.top = `${y * 32}px`;
        wall.style.width = '4px';
        wall.style.height = '32px';
      } else if (dir === 'right') {
        wall.classList.add('vertical-border');
        wall.style.left = `${(x + 1) * 32 - 2}px`;
        wall.style.top = `${y * 32}px`;
        wall.style.width = '4px';
        wall.style.height = '32px';
      }
      wall.dataset.x = x;
      wall.dataset.y = y;
      wall.dataset.dir = dir;
      wall.addEventListener('click', (e) => {
        if (removeMode) {
          setEdge(x, y, dir, null);
          renderBorders();
        }
      });
      grid.appendChild(wall);
    }

    // Door (centered, on top of wall)
    if (edge.door) {
      const door = document.createElement('div');
      door.className = 'grid-border door-border';
      if (dir === 'top') {
        door.classList.add('horizontal-border');
        door.style.left = `${x * 32 + 7}px`;
        door.style.top = `${y * 32 - 2}px`;
        door.style.width = '18px';
        door.style.height = '4px';
      } else if (dir === 'bottom') {
        door.classList.add('horizontal-border');
        door.style.left = `${x * 32 + 7}px`;
        door.style.top = `${(y + 1) * 32 - 2}px`;
        door.style.width = '18px';
        door.style.height = '4px';
      } else if (dir === 'left') {
        door.classList.add('vertical-border');
        door.style.left = `${x * 32 - 2}px`;
        door.style.top = `${y * 32 + 7}px`;
        door.style.width = '4px';
        door.style.height = '18px';
      } else if (dir === 'right') {
        door.classList.add('vertical-border');
        door.style.left = `${(x + 1) * 32 - 2}px`;
        door.style.top = `${y * 32 + 7}px`;
        door.style.width = '4px';
        door.style.height = '18px';
      }
      door.dataset.x = x;
      door.dataset.y = y;
      door.dataset.dir = dir;
      door.addEventListener('click', (e) => {
        if (removeMode) {
          edgeMap[edgeKey(x, y, dir)].door = false;
          renderBorders();
        }
      });
      grid.appendChild(door);
    }

    // Window (centered, on top of wall)
    if (edge.window) {
      const windowDiv = document.createElement('div');
      windowDiv.className = 'grid-border window-border';
      if (dir === 'top') {
        windowDiv.classList.add('horizontal-border');
        windowDiv.style.left = `${x * 32 + 9}px`;
        windowDiv.style.top = `${y * 32 - 2}px`;
        windowDiv.style.width = '14px';
        windowDiv.style.height = '4px';
      } else if (dir === 'bottom') {
        windowDiv.classList.add('horizontal-border');
        windowDiv.style.left = `${x * 32 + 9}px`;
        windowDiv.style.top = `${(y + 1) * 32 - 2}px`;
        windowDiv.style.width = '14px';
        windowDiv.style.height = '4px';
      } else if (dir === 'left') {
        windowDiv.classList.add('vertical-border');
        windowDiv.style.left = `${x * 32 - 2}px`;
        windowDiv.style.top = `${y * 32 + 9}px`;
        windowDiv.style.width = '4px';
        windowDiv.style.height = '14px';
      } else if (dir === 'right') {
        windowDiv.classList.add('vertical-border');
        windowDiv.style.left = `${(x + 1) * 32 - 2}px`;
        windowDiv.style.top = `${y * 32 + 9}px`;
        windowDiv.style.width = '4px';
        windowDiv.style.height = '14px';
      }
      windowDiv.dataset.x = x;
      windowDiv.dataset.y = y;
      windowDiv.dataset.dir = dir;
      windowDiv.addEventListener('click', (e) => {
        if (removeMode) {
          edgeMap[edgeKey(x, y, dir)].window = false;
          renderBorders();
        }
      });
      grid.appendChild(windowDiv);
    }
  }
}

// --- ZOOM ---
function zoomIn() {
  zoomLevel = Math.min(zoomLevel + 0.2, 2.5);
  gridContainer.style.transform = `scale(${zoomLevel})`;
}
function zoomOut() {
  zoomLevel = Math.max(zoomLevel - 0.2, 0.4);
  gridContainer.style.transform = `scale(${zoomLevel})`;
}

// --- SAVE & LOAD ---
function saveGrid() {
  const data = {
    edgeMap,
    cellMap,
    width: document.getElementById('width').value,
    height: document.getElementById('height').value
  };
  localStorage.setItem('dndMapGrid', JSON.stringify(data));
}

function loadGrid() {
  const data = JSON.parse(localStorage.getItem('dndMapGrid'));
  if (!data) return;
  edgeMap = data.edgeMap || {};
  cellMap = data.cellMap || {};
  document.getElementById('width').value = data.width || 12;
  document.getElementById('height').value = data.height || 12;
  gridContainer.innerHTML = '';
  createGrid(false);
}

// --- CLEAR FIELD BUTTON ---
const clearBtn = document.getElementById('clear-btn');
if (clearBtn) {
  clearBtn.addEventListener('click', function() {
    edgeMap = {};
    cellMap = {};
    // Очистить все клетки до дефолта
    const grid = gridContainer.querySelector('.grid');
    if (grid) {
      grid.querySelectorAll('.grid-cell').forEach(cell => {
        cell.className = 'grid-cell';
        while (cell.firstChild) cell.removeChild(cell.firstChild);
      });
    }
    renderBorders();
    autosave();
  });
}

// --- AUTOSAVE PATCHING (robust) ---
function patchAutosave() {
  // Patch setEdge
  if (!setEdge._isPatched) {
    const origSetEdge = setEdgeBase;
    setEdge = function(x, y, dir, type) {
      origSetEdge(x, y, dir, type);
      autosave();
    };
    setEdge._isPatched = true;
  }
  // Patch onCellClick
  if (!onCellClick._isPatched) {
    const origOnCellClick = onCellClickBase;
    onCellClick = function(cell, event) {
      origOnCellClick(cell, event);
      autosave();
    };
    onCellClick._isPatched = true;
  }
}
function autosave() {
  saveGrid();
}
patchAutosave();

// --- INIT ---
window.addEventListener('load', function() {
  patchAutosave();
  if (localStorage.getItem('dndMapGrid')) {
    loadGrid();
  } else {
    createGrid(true);
  }
});