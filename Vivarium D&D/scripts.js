const fields = [
  'name', 'summary', 'ac', 'hp', 'hit_dice', 'speed',
  'str', 'dex', 'con', 'int', 'wis', 'cha',
  'saves', 'immune_damage', 'immune_conditions', 'resistances',
  'senses', 'languages', 'cr', 'proficiency_bonus',
  'traits', 'actions', 'description', 'author', 'image' // <-- added image
];

let savedEnemies = JSON.parse(localStorage.getItem('dnd_enemies') || '[]');

function saveCurrentToStorage() {
  const enemy = {};
  fields.forEach(id => {
    const val = document.getElementById(id).value;
    localStorage.setItem('dnd_' + id, val);
    enemy[id] = val;
  });
  if (enemy.name) {
    savedEnemies.push(enemy);
    localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
    renderEnemyList();
  }
}

window.onload = () => {
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const saved = localStorage.getItem('dnd_' + id);
    if (saved !== null) el.value = saved;
  });
  // Load image preview if exists
  const imgData = localStorage.getItem('dnd_image');
  if (imgData) showImagePreview(imgData);
  updateAuthor();
  renderEnemyList();
  updateSpeedSuffix(document.getElementById('speed'));
};

fields.forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('input', () => {
    localStorage.setItem('dnd_' + id, el.value);
    if (id === 'author') updateAuthor();
    if (id === 'speed') updateSpeedSuffix(el);
  });
});

// Image upload logic
const imageInput = document.getElementById('monster-image');
const imageUploadBtn = document.getElementById('image-upload-btn');
const imageDeleteBtn = document.getElementById('image-delete-btn');
const imagePreview = document.getElementById('image-preview');

imageUploadBtn.onclick = () => imageInput.click();

imageInput.onchange = function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    document.getElementById('image').value = dataUrl;
    localStorage.setItem('dnd_image', dataUrl);
    showImagePreview(dataUrl);
  };
  reader.readAsDataURL(file);
};

imageDeleteBtn.onclick = function() {
  document.getElementById('image').value = '';
  localStorage.removeItem('dnd_image');
  imagePreview.innerHTML = '';
  imageDeleteBtn.style.display = 'none';
};

function showImagePreview(dataUrl) {
  if (dataUrl) {
    imagePreview.innerHTML = `<img src="${dataUrl}" alt="Изображение существа" style="max-width:180px;max-height:180px;display:block;margin:0 auto 8px auto;border-radius:8px;">`;
    imageDeleteBtn.style.display = '';
  } else {
    imagePreview.innerHTML = '';
    imageDeleteBtn.style.display = 'none';
  }
}

// Update preview if image field changes (e.g. on load)
document.getElementById('image').addEventListener('input', function() {
  showImagePreview(this.value);
});

function clearForm() {
  if (confirm('Вы уверены, что хотите очистить все поля?')) {
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
      localStorage.removeItem('dnd_' + id);
    });
    showImagePreview('');
    updateAuthor();
    updateSpeedSuffix(document.getElementById('speed'));
  }
}

function updateAuthor() {
  const author = document.getElementById('author').value;
  document.getElementById('author-output').textContent = author ? `Автор: ${author}` : '';
}

// Speed field: restrict to 4 digits and always show " футов"
function updateSpeedSuffix(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 4);
  input.value = val;
  document.getElementById('speed-suffix').textContent = ' футов';
}

function exportData() {
  const data = {};
  fields.forEach(id => {
    data[id] = document.getElementById(id).value;
  });
  downloadEnemy(data);
  saveCurrentToStorage();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      fields.forEach(id => {
        const val = data[id] || '';
        const el = document.getElementById(id);
        if (el) el.value = val;
        localStorage.setItem('dnd_' + id, val);
      });
      if (data.image) showImagePreview(data.image);
      savedEnemies.push(data);
      localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
      updateAuthor();
      renderEnemyList();
      updateSpeedSuffix(document.getElementById('speed'));
    } catch (err) {
      alert('Ошибка загрузки файла');
    }
  };
  reader.readAsText(file);
}

function renderEnemyList() {
  const list = document.getElementById('enemy-list');
  list.innerHTML = '';
  savedEnemies.forEach((enemy, index) => {
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = enemy.name || `Безымянный ${index+1}`;
    nameSpan.style.flex = '1';
    nameSpan.style.cursor = 'pointer';
    nameSpan.onclick = () => loadEnemy(enemy);

    const btnContainer = document.createElement('span');
    btnContainer.className = 'enemy-buttons';

    const viewBtn = document.createElement('button');
    viewBtn.textContent = '👁';
    viewBtn.title = 'Просмотр';
    viewBtn.onclick = (e) => {
      e.stopPropagation();
      viewEnemy(enemy);
    };

    const editBtn = document.createElement('button');
    editBtn.textContent = '⚙';
    editBtn.title = 'Редактировать';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      loadEnemy(enemy);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✖';
    deleteBtn.title = 'Удалить';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm('Удалить этого врага?')) {
        savedEnemies.splice(index, 1);
        localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
        renderEnemyList();
      }
    };

    btnContainer.appendChild(viewBtn);
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);
    li.appendChild(nameSpan);
    li.appendChild(btnContainer);
    list.appendChild(li);
  });
}

function loadEnemy(enemy) {
  fields.forEach(id => {
    const val = enemy[id] || '';
    const el = document.getElementById(id);
    if (el) el.value = val;
    localStorage.setItem('dnd_' + id, val);
  });
  showImagePreview(enemy.image || '');
  updateAuthor();
  updateSpeedSuffix(document.getElementById('speed'));
}

// Calculate D&D stat modifier
function getModifier(stat) {
  const n = parseInt(stat, 10);
  if (isNaN(n)) return '';
  const mod = Math.floor((n - 10) / 2);
  return (mod >= 0 ? `+${mod}` : `${mod}`);
}

// Markdown-like formatting: *italic*, **bold**
function formatText(text) {
  if (!text) return '';
  // Replace **bold**
  text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  // Replace *italic*
  text = text.replace(/\*(.+?)\*/g, '<i>$1</i>');
  // Replace newlines
  return text.replace(/\n/g, '<br>');
}

// View enemy in a new window
function viewEnemy(enemy) {
  const win = window.open('', '_blank', 'width=500,height=700');
  let html = `<html><head><title>${enemy.name || 'Враг'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cormorant Garamond', serif; background: #18191c; color: #e0e0e0; padding: 30px; margin:0; min-height:100vh; display:flex; flex-direction:column; }
    h2 { text-align: center; color: #e74c3c; text-shadow: 0 0 8px #000, 0 0 2px #e74c3c; font-size:2.2em; margin-bottom: 18px;}
    .block { margin-bottom: 14px; }
    .stat-row { display: flex; gap: 10px; }
    .stat-row span { flex: 1; }
    .label { font-weight: bold; }
    .desc { margin-top: 10px; font-style: italic; }
    a { color: #e74c3c; }
    .mod { color: #aaa; font-size: 1.1em; margin-left: 2px; }
    .big-num { font-size: 1.35em; font-weight: bold; color: #fff; }
    .author-line { font-size: 0.85em; color: #888; position: absolute; left: 30px; bottom: 18px; }
    .main-content { flex:1; position:relative; }
    body { position: relative; }
    .monster-image { display:block; margin: 0 auto 16px auto; max-width:220px; max-height:220px; border-radius:10px; box-shadow:0 0 8px #0008; }
  </style>
  </head><body>
  <div class="main-content">`;
  html += `<h2>${formatText(enemy.name) || 'Безымянный'}</h2>`;
  html += `<div class="block"><span class="label"></span> ${formatText(enemy.summary) || ''}</div>`;
  html += `<div class="block"><span class="label">КД:</span> <span class="big-num">${enemy.ac || ''}</span> <span class="label">ХП:</span> <span class="big-num">${enemy.hp || ''}</span> <span class="label">Кубики:</span> <span class="big-num">${enemy.hit_dice || ''}</span></div>`;
  html += `<div class="block"><span class="label">Скорость:</span> <span class="big-num">${enemy.speed ? enemy.speed + ' футов' : ''}</span></div>`;
  html += `<div class="block stat-row">
    <span><span class="label">СИЛ:</span> <span class="big-num">${enemy.str || ''}</span> <span class="mod">(${getModifier(enemy.str)})</span></span>
    <span><span class="label">ЛОВ:</span> <span class="big-num">${enemy.dex || ''}</span> <span class="mod">(${getModifier(enemy.dex)})</span></span>
    <span><span class="label">ТЕЛ:</span> <span class="big-num">${enemy.con || ''}</span> <span class="mod">(${getModifier(enemy.con)})</span></span>
  </div>`;
  html += `<div class="block stat-row">
    <span><span class="label">ИНТ:</span> <span class="big-num">${enemy.int || ''}</span> <span class="mod">(${getModifier(enemy.int)})</span></span>
    <span><span class="label">МУД:</span> <span class="big-num">${enemy.wis || ''}</span> <span class="mod">(${getModifier(enemy.wis)})</span></span>
    <span><span class="label">ХАР:</span> <span class="big-num">${enemy.cha || ''}</span> <span class="mod">(${getModifier(enemy.cha)})</span></span>
  </div>`;
  html += `<div class="block"><span class="label">Спасброски:</span> ${formatText(enemy.saves) || ''}</div>`;
  html += `<div class="block"><span class="label">Иммунитет к урону:</span> ${formatText(enemy.immune_damage) || ''}</div>`;
  html += `<div class="block"><span class="label">Иммунитет к состояниям:</span> ${formatText(enemy.immune_conditions) || ''}</div>`;
  html += `<div class="block"><span class="label">Сопротивление урону:</span> ${formatText(enemy.resistances) || ''}</div>`;
  html += `<div class="block"><span class="label">Чувства:</span> ${formatText(enemy.senses) || ''}</div>`;
  html += `<div class="block"><span class="label">Языки:</span> ${formatText(enemy.languages) || ''}</div>`;
  html += `<div class="block"><span class="label">Уровень опасности:</span> ${formatText(enemy.cr) || ''} <span class="label">Бонус мастерства:</span> <span class="big-num">${enemy.proficiency_bonus || ''}</span></div>`;
  html += `<div class="block"><span class="label">ОСОБЫЕ СВОЙСТВА:</span><br>${formatText(enemy.traits)}</div>`;
  html += `<div class="block"><span class="label">ДЕЙСТВИЯ:</span><br>${formatText(enemy.actions)}</div>`;
  html += `<div class="block desc"><span class="label">ОПИСАНИЕ:</span><br>${formatText(enemy.description) || ''}</div>`;
  // Insert image here
  if (enemy.image) {
    html += `<div class="block"><img src="${enemy.image}" class="monster-image" alt="Изображение существа"></div>`;
  }
  html += `</div>`;
  html += `<div class="author-line">Автор: ${formatText(enemy.author) || ''}</div>`;
  html += `</body></html>`;
  win.document.write(html);
  win.document.close();
}

// Download enemy JSON, ask for path if possible
function downloadEnemy(enemy) {
  // Try File System Access API (supported in Chromium browsers)
  if (window.showSaveFilePicker) {
    (async () => {
      try {
        const options = {
          suggestedName: (enemy.name || 'monster') + '.json',
          types: [{
            description: 'JSON file',
            accept: {'application/json': ['.json']}
          }]
        };
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(enemy, null, 2));
        await writable.close();
      } catch (e) {
        // fallback to download
        fallbackDownload(enemy);
      }
    })();
  } else {
    fallbackDownload(enemy);
  }
}

function fallbackDownload(enemy) {
  const blob = new Blob([JSON.stringify(enemy, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (enemy.name || 'monster') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

// "Создать" button logic
document.getElementById('create-btn').onclick = function() {
  const data = {};
  fields.forEach(id => {
    data[id] = document.getElementById(id).value;
  });
  downloadEnemy(data);
  savedEnemies.push(data);
  localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
  renderEnemyList();
};

// "Сохранить" button logic
document.getElementById('save-btn').onclick = function() {
  const data = {};
  fields.forEach(id => {
    data[id] = document.getElementById(id).value;
  });
  downloadEnemy(data);
};