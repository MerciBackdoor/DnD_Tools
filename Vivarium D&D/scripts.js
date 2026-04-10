const fields = [
  'name', 'size', 'type', 'alignment', 'ac', 'hp', 'hit_dice', 'speed',
  'str', 'dex', 'con', 'int', 'wis', 'cha',
  'saves', 'immune_damage', 'immune_conditions', 'resistances',
  'vulnerabilities', 'senses', 'languages', 'cr', 'proficiency_bonus',
  'traits', 'actions', 'description', 'author', 'image'
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
  // Показываем предпросмотр только из поля #image
  showImagePreview(imageHidden.value);
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
const imageHidden = document.getElementById('image');

imageUploadBtn.onclick = () => imageInput.click();

imageInput.onchange = function() {
  const file = this.files[0];
  if (!file) return;
  // (опционально) Можно добавить ограничение на исходный размер файла, например 2 МБ
  if (file.size > 2 * 1024 * 1024) {
    alert('Изображение слишком большое (максимум 2 МБ).');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Ограничиваем размер 500x500, сохраняя пропорции
      const maxSize = 500;
      let w = img.width;
      let h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) {
          h = Math.round(h * (maxSize / w));
          w = maxSize;
        } else {
          w = Math.round(w * (maxSize / h));
          h = maxSize;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      // Сохраняем как JPEG с качеством 0.6 (60%)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      // (опционально) Проверяем итоговый размер base64-строки
      if (dataUrl.length > 2000000) { // ~2MB base64 string
        alert('Изображение после сжатия всё равно слишком большое! Попробуйте другую картинку.');
        return;
      }
      imageHidden.value = dataUrl;
      showImagePreview(dataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

imageDeleteBtn.onclick = function() {
  imageHidden.value = '';
  localStorage.removeItem('dnd_image');
  showImagePreview('');
};

function showImagePreview(dataUrl) {
  if (dataUrl) {
    imagePreview.innerHTML = `<img src="${dataUrl}" alt="Изображение существа" style="max-width:600px;max-height:600px;display:block;margin:0 auto 8px auto;border-radius:8px;">`;
    imageDeleteBtn.style.display = '';
  } else {
    imagePreview.innerHTML = '';
    imageDeleteBtn.style.display = 'none';
  }
}

// Следим за изменением скрытого поля и обновляем предпросмотр
imageHidden.addEventListener('input', function() {
  showImagePreview(this.value);
});

function clearForm() {
  if (confirm('Вы уверены, что хотите очистить все поля?')) {
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === 'hidden') {
        el.value = '';
      } else if (el.multiple) {
        Array.from(el.options).forEach(opt => opt.selected = false);
        updateSelectedDisplay(id);
      } else {
        el.value = '';
      }
      localStorage.removeItem('dnd_' + id);
    });
    // Явно очищаем предпросмотр и скрытое поле изображения
    imageHidden.value = '';
    showImagePreview('');
    // Сбросить отображение выбранных значений для select
    ['immune_damage', 'immune_conditions', 'resistances'].forEach(id => updateSelectedDisplay(id));
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
  const files = event.target.files;
  if (!files || files.length === 0) return;

  // Используем Promise.all, чтобы дождаться чтения всех файлов
  const readers = Array.from(files).map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          // Если это массив врагов (экспорт всей базы), добавляем всех
          if (Array.isArray(data)) {
            savedEnemies.push(...data);
          } else {
            // Если это один враг
            savedEnemies.push(data);
          }
          resolve();
        } catch (err) {
          console.error('Ошибка парсинга файла:', file.name);
          resolve(); // Продолжаем даже если один файл битый
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  });

  Promise.all(readers).then(() => {
    // Сохраняем обновленный список в localStorage
    localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
    // Перерисовываем список в сайдбаре
    renderEnemyList();
    // Очищаем input, чтобы можно было загрузить те же файлы повторно
    event.target.value = '';
    alert(`Успешно импортировано файлов: ${files.length}`);
  }).catch(err => {
    alert('Произошла ошибка при чтении файлов');
    console.error(err);
  });
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
  // Синхронизируем предпросмотр с новым значением поля #image
  showImagePreview(enemy.image || '');
  imageHidden.value = enemy.image || '';
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

// Markdown-like formatting: *italic*, **bold**, [текст](ссылка)
function formatText(text) {
  if (!text) return '';
  // Ссылки в формате [текст](url)
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
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
    const win = window.open('', '_blank', 'width=800,height=900');

    // Логика определения занимаемого места на сетке
    const sizeMap = {
        'Крошечный': '1/4 клетки',
        'Маленький': '1 клетка',
        'Средний': '1 клетка',
        'Большой': '2x2 клетки',
        'Огромный': '3x3 клетки',
        'Громадный': '4x4 клетки или больше'
    };
    const spaceInfo = sizeMap[enemy.size] || '';

    let html = `<html><head><title>${enemy.name || 'Враг'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cormorant Garamond', serif; background: #18191c; color: #e0e0e0; padding: 30px; margin:0; min-height:100vh; display:flex; flex-direction:column; line-height: 1.4; }
    h2 { text-align: left; color: #e74c3c; text-shadow: 0 0 2px #e74c3c; font-size:2.4em; margin-bottom: 5px; margin-top: 0;}
    .subtitle { font-style: italic; color: #bbb; font-size: 1.2em; margin-bottom: 15px; border-bottom: 2px solid #e74c3c; padding-bottom: 5px; }
    .block { margin-bottom: 12px; }
    .label { font-weight: bold; color: #e74c3c; text-transform: uppercase; font-size: 0.9em; }
    .desc { margin-top: 10px; font-style: italic; white-space: pre-line; }
    .mod { color: #aaa; font-size: 0.9em; }
    .big-num { font-size: 1.3em; font-weight: bold; color: #fff; }
    .author-line { font-size: 0.85em; color: #555; margin-top: 40px; border-top: 1px solid #333; padding-top: 10px; }
    .main-content { flex:1; }
    .monster-image { display:block; margin: 20px 0; max-width:100%; height:auto; border-radius:10px; box-shadow:0 0 15px #000; }
    .multi-field { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .multi-field span { background: #333; color: #e0e0e0; border-radius: 2px; padding: 2px 8px; font-size: 0.95em; border: 1px solid #444; }
  </style>
  </head><body>
  <div class="main-content">`;

    // Заголовок и подзаголовок (Размер, Тип, Мировоззрение)
    html += `<h2>${formatText(enemy.name) || 'Безымянный'}</h2>`;
    html += `<div class="subtitle">${enemy.size || ''} ${enemy.type || ''}, ${enemy.alignment || ''} ${spaceInfo ? `(${spaceInfo})` : ''}</div>`;

    // Основные параметры (КД, ХП, Скорость)
    html += `<div class="block">
        <span class="label">Класс Доспеха:</span> <span class="big-num">${enemy.ac || '10'}</span><br>
        <span class="label">Хиты:</span> <span class="big-num">${enemy.hp || '0'}</span> <i>(${enemy.hit_dice || ''})</i><br>
        <span class="label">Скорость:</span> <span class="big-num">${enemy.speed ? enemy.speed + ' футов' : '0 футов'}</span>
    </div>`;

    // --- ТАБЛИЦА ХАРАКТЕРИСТИК (Компактная, прижата влево) ---
    html += `
    <div class="block" style="display: flex; justify-content: flex-start; margin: 15px 0;">
      <table style="width: 100%; max-width: 450px; background: #232326; border-radius: 5px; border-collapse: collapse; overflow: hidden; border: 1px solid #444;">
        <tr style="color: #e74c3c; font-size: 0.85em; font-weight: bold;">
          <th style="padding: 5px; border: 1px solid #444;">СИЛ</th>
          <th style="padding: 5px; border: 1px solid #444;">ЛОВ</th>
          <th style="padding: 5px; border: 1px solid #444;">ТЕЛ</th>
          <th style="padding: 5px; border: 1px solid #444;">ИНТ</th>
          <th style="padding: 5px; border: 1px solid #444;">МУД</th>
          <th style="padding: 5px; border: 1px solid #444;">ХАР</th>
        </tr>
        <tr>
          <td style="text-align:center; padding: 8px;"><div>${enemy.str || '10'}</div><div class="mod">(${getModifier(enemy.str)})</div></td>
          <td style="text-align:center; padding: 8px;"><div>${enemy.dex || '10'}</div><div class="mod">(${getModifier(enemy.dex)})</div></td>
          <td style="text-align:center; padding: 8px;"><div>${enemy.con || '10'}</div><div class="mod">(${getModifier(enemy.con)})</div></td>
          <td style="text-align:center; padding: 8px;"><div>${enemy.int || '10'}</div><div class="mod">(${getModifier(enemy.int)})</div></td>
          <td style="text-align:center; padding: 8px;"><div>${enemy.wis || '10'}</div><div class="mod">(${getModifier(enemy.wis)})</div></td>
          <td style="text-align:center; padding: 8px;"><div>${enemy.cha || '10'}</div><div class="mod">(${getModifier(enemy.cha)})</div></td>
        </tr>
      </table>
    </div>`;

    // Особенности (Спасброски, Сопротивления и т.д.)
    if (enemy.saves) html += `<div class="block"><span class="label">Спасброски:</span> ${formatText(enemy.saves)}</div>`;
    
    const multiFields = [
        { label: 'Иммунитет к урону', val: enemy.immune_damage },
        { label: 'Иммунитет к состояниям', val: enemy.immune_conditions },
        { label: 'Сопротивление урону', val: enemy.resistances },
        { label: 'Уязвимость к урону', val: enemy.vulnerabilities }
    ];

    multiFields.forEach(f => {
        if (f.val) {
            html += `<div class="block"><span class="label">${f.label}:</span> <div class="multi-field">${formatMultiField(f.val)}</div></div>`;
        }
    });

    html += `<div class="block"><span class="label">Чувства:</span> ${formatText(enemy.senses) || '—'}</div>`;
    html += `<div class="block"><span class="label">Языки:</span> ${formatText(enemy.languages) || '—'}</div>`;

    // ОПАСНОСТЬ И БОНУС (На разных строках, оба выделены)
    html += `<div class="block"><span class="label">Уровень опасности:</span> <span class="big-num">${enemy.cr || '0'}</span></div>`;
    html += `<div class="block"><span class="label">Бонус мастерства:</span> <span class="big-num">+${enemy.proficiency_bonus || '2'}</span></div>`;

    // Способности и Действия
    html += `<div style="border-top: 2px solid #e74c3c; margin-top: 15px; padding-top: 10px;"></div>`;
    if (enemy.traits) html += `<div class="block">${formatText(enemy.traits)}</div>`;
    if (enemy.actions) html += `<div class="block"><span class="label" style="font-size: 1.2em;">Действия</span><br>${formatText(enemy.actions)}</div>`;
    if (enemy.description) html += `<div class="block desc"><span class="label">Описание</span><br>${formatText(enemy.description)}</div>`;

    // Изображение
    if (enemy.image) {
        html += `<img src="${enemy.image}" class="monster-image" alt="Изображение">`;
    }

    html += `</div>`; // Конец main-content
    html += `<div class="author-line">Автор: ${formatText(enemy.author) || 'Неизвестен'}</div>`;
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
  savedEnemies.push(data); // Просто добавляем, не проверяя имя
  localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
  renderEnemyList();
  downloadEnemy(data);
  // clearForm(); // Больше не очищаем форму после создания
};

// "Обновить" button logic (add to list, no download)
document.getElementById('update-btn').onclick = function() {
  const data = {};
  fields.forEach(id => {
    data[id] = getFieldValue(id);
  });
  savedEnemies.push(data); // Просто добавляем, не проверяя имя
  localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
  renderEnemyList();
  // clearForm(); // Больше не очищаем форму после обновления
};

// "Сохранить" button logic (save to disk, do NOT add to list)
document.getElementById('save-btn').onclick = function() {
  const data = {};
  fields.forEach(id => {
    data[id] = getFieldValue(id);
  });
  downloadEnemy(data);
  // clearForm(); // Больше не очищаем форму после сохранения
};

function updateSelectedDisplay(id) {
  const select = document.getElementById(id);
  const display = document.getElementById(id + '_display');
  if (!select || !display) return;
  const selected = Array.from(select.selectedOptions).map(opt => `<span>${opt.textContent}</span>`).join('');
  display.innerHTML = selected || '<span style="color:#888;">Не выбрано</span>';
}

// Initial update on load
['immune_damage', 'immune_conditions', 'resistances', 'vulnerabilities'].forEach(id => {
  updateSelectedDisplay(id);
  document.getElementById(id).addEventListener('change', () => updateSelectedDisplay(id));
});

['immune_damage', 'immune_conditions', 'resistances', 'vulnerabilities'].forEach(id => {
  const container = document.getElementById(id).closest('.select-container');
  const display = document.getElementById(id + '_display');
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