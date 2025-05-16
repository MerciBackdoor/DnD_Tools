const fields = [
  'name', 'summary', 'ac', 'hp', 'hit_dice', 'speed',
  'str', 'dex', 'con', 'int', 'wis', 'cha',
  'saves', 'immune_damage', 'immune_conditions', 'resistances',
  'senses', 'languages', 'cr', 'proficiency_bonus',
  'traits', 'actions', 'description', 'author', 'image' // <-- added image
];

let savedEnemies = JSON.parse(localStorage.getItem('dnd_enemies') || '[]');

function getFieldValue(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  if (el.multiple) {
    return Array.from(el.selectedOptions).map(opt => opt.value).join(', ');
  }
  return el.value;
}

function setFieldValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.multiple) {
    const values = (value || '').split(',').map(v => v.trim());
    Array.from(el.options).forEach(opt => {
      opt.selected = values.includes(opt.value);
    });
    updateSelectedDisplay(id); // <-- add this
  } else {
    el.value = value || '';
  }
}

function saveCurrentToStorage() {
  const enemy = {};
  fields.forEach(id => {
    const val = getFieldValue(id);
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
    if (saved !== null) setFieldValue(id, saved);
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
    localStorage.setItem('dnd_' + id, getFieldValue(id));
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

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      fields.forEach(id => {
        const val = data[id] || '';
        setFieldValue(id, val);
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
    setFieldValue(id, val);
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

function formatMultiField(field) {
  if (!field) return '';
  return field.split(',').map(v => `<span style="display:inline-block;background:#444;color:#e0e0e0;border-radius:2px;padding:2px 8px;margin:2px 2px 2px 0;">${v.trim()}</span>`).join(' ');
}

// View enemy in a new window
function viewEnemy(enemy) {
  const win = window.open('', '_blank', 'width=600,height=900');
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
    .monster-image { display:block; margin: 0 auto 16px auto; max-width:350px; max-height:350px; border-radius:10px; box-shadow:0 0 8px #0008; }
    .multi-field { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .multi-field span { background: #444; color: #e0e0e0; border-radius: 2px; padding: 2px 8px; font-size: 0.98em; }
  </style>
  </head><body>
  <div class="main-content">`;
  html += `<h2>${formatText(enemy.name) || 'Безымянный'}</h2>`;
  html += `<div class="block"><span class="label"></span> ${formatText(enemy.summary) || ''}</div>`;
  html += `<div class="block"><span class="label">КД:</span> <span class="big-num">${enemy.ac || ''}</span> <span class="label">ХП:</span> <span class="big-num">${enemy.hp || ''}</span> <span class="label">Кубики:</span> <span class="big-num">${enemy.hit_dice || ''}</span></div>`;
  html += `<div class="block"><span class="label">Скорость:</span> <span class="big-num">${enemy.speed ? enemy.speed + ' футов' : ''}</span></div>`;
  // --- STAT TABLE (see next section) ---
  html += `<div class="block"><table style="width:100%;background:#232326;border-radius:4px;"><tr>
    <th>СИЛ</th><th>ЛОВ</th><th>ТЕЛ</th><th>ИНТ</th><th>МУД</th><th>ХАР</th></tr>
    <tr>
      <td style="text-align:center;">${enemy.str || ''} <span class="mod">(${getModifier(enemy.str)})</span></td>
      <td style="text-align:center;">${enemy.dex || ''} <span class="mod">(${getModifier(enemy.dex)})</span></td>
      <td style="text-align:center;">${enemy.con || ''} <span class="mod">(${getModifier(enemy.con)})</span></td>
      <td style="text-align:center;">${enemy.int || ''} <span class="mod">(${getModifier(enemy.int)})</span></td>
      <td style="text-align:center;">${enemy.wis || ''} <span class="mod">(${getModifier(enemy.wis)})</span></td>
      <td style="text-align:center;">${enemy.cha || ''} <span class="mod">(${getModifier(enemy.cha)})</span></td>
    </tr>
  </table></div>`;
  // --- END STAT TABLE ---
  html += `<div class="block"><span class="label">Спасброски:</span> ${formatText(enemy.saves) || ''}</div>`;
  html += `<div class="block"><span class="label">Иммунитет к урону:</span> <div class="multi-field">${formatMultiField(enemy.immune_damage)}</div></div>`;
  html += `<div class="block"><span class="label">Иммунитет к состояниям:</span> <div class="multi-field">${formatMultiField(enemy.immune_conditions)}</div></div>`;
  html += `<div class="block"><span class="label">Сопротивление урону:</span> <div class="multi-field">${formatMultiField(enemy.resistances)}</div></div>`;
  html += `<div class="block"><span class="label">Чувства:</span> ${formatText(enemy.senses) || ''}</div>`;
  html += `<div class="block"><span class="label">Языки:</span> ${formatText(enemy.languages) || ''}</div>`;
  html += `<div class="block"><span class="label">Уровень опасности:</span> ${formatText(enemy.cr) || ''} <span class="label">Бонус мастерства:</span> <span class="big-num">${enemy.proficiency_bonus || ''}</span></div>`;
  html += `<div class="block"><span class="label">ОСОБЫЕ СВОЙСТВА:</span><br>${formatText(enemy.traits)}</div>`;
  html += `<div class="block"><span class="label">ДЕЙСТВИЯ:</span><br>${formatText(enemy.actions)}</div>`;
  html += `<div class="block desc"><span class="label">ОПИСАНИЕ:</span><br>${formatText(enemy.description) || ''}</div>`;
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
    data[id] = getFieldValue(id);
  });
  savedEnemies.push(data); // Сначала добавляем в список
  localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
  renderEnemyList();
  downloadEnemy(data); // Потом сохраняем на диск
};

// "Обновить" button logic (add to list, no download)
document.getElementById('update-btn').onclick = function() {
  const data = {};
  fields.forEach(id => {
    data[id] = getFieldValue(id);
  });
  savedEnemies.push(data);
  localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
  renderEnemyList();
};

// "Сохранить" button logic (save to disk, do NOT add to list)
document.getElementById('save-btn').onclick = function() {
  const data = {};
  fields.forEach(id => {
    data[id] = getFieldValue(id);
  });
  downloadEnemy(data);
};

function updateSelectedDisplay(id) {
  const select = document.getElementById(id);
  const display = document.getElementById(id + '_display');
  if (!select || !display) return;
  const selected = Array.from(select.selectedOptions).map(opt => `<span>${opt.textContent}</span>`).join('');
  display.innerHTML = selected || '<span style="color:#888;">Не выбрано</span>';
}

// Initial update on load
['immune_damage', 'immune_conditions', 'resistances'].forEach(id => {
  updateSelectedDisplay(id);
  document.getElementById(id).addEventListener('change', () => updateSelectedDisplay(id));
});

['immune_damage', 'immune_conditions', 'resistances'].forEach(id => {
  const container = document.getElementById(id).closest('.select-container');
  const display = document.getElementById(id + '_display');
  // Toggle open on click
  display.onclick = (e) => {
    e.stopPropagation();
    container.classList.toggle('open');
    if (container.classList.contains('open')) {
      document.getElementById(id).focus();
    }
  };
});

// Close all selects on outside click
document.addEventListener('click', function(e) {
  document.querySelectorAll('.select-container.open').forEach(cont => {
    cont.classList.remove('open');
  });
});

// Prevent closing when clicking inside select
document.querySelectorAll('.select-container select').forEach(sel => {
  sel.addEventListener('click', e => e.stopPropagation());
});