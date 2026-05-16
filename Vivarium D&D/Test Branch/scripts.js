const fields = [
  'name', 'size', 'type', 'alignment', 'ac', 'hp', 'hit_dice', 'speed_walk', 'speed_climb', 'speed_fly', 'speed_swim', 'speed_burrow',
  'str', 'dex', 'con', 'int', 'wis', 'cha', 'saves', 'immune_damage', 'immune_conditions', 'resistances',
  'vulnerabilities', 'senses', 'languages', 'cr', 'proficiency_bonus', 'traits', 'actions', 'description', 'author', 'image'
];

let savedEnemies = JSON.parse(localStorage.getItem('dnd_enemies') || '[]');
const imageInput = document.getElementById('monster-image');
const imageUploadBtn = document.getElementById('image-upload-btn');
const imageDeleteBtn = document.getElementById('image-delete-btn');
const imagePreview = document.getElementById('image-preview');
const imageHidden = document.getElementById('image');

const getFieldValue = id => {
  const el = document.getElementById(id);
  if (!el) return '';
  return el.multiple ? Array.from(el.selectedOptions).map(o => o.value).join(', ') : el.value;
};

const setFieldValue = (id, val) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.multiple) {
    const vals = (val || '').split(',').map(v => v.trim());
    Array.from(el.options).forEach(o => o.selected = vals.includes(o.value));
    SelectedDisplayHelper(id);
  } else el.value = val || '';
};

const getModifier = s => {
  const n = parseInt(s);
  return isNaN(n) ? 0 : Math.floor((n - 10) / 2);
};

const addSense = () => {
  const type = document.getElementById('sense_type').value;
  const range = document.getElementById('sense_range').value;
  const input = document.getElementById('senses');
  if (!range) return;
  const entry = `${type} ${range} фт.`;
  input.value = input.value ? `${input.value}, ${entry}` : entry;
  localStorage.setItem('dnd_senses', input.value);
};

const updateProficiency = () => {
  const cr = document.getElementById('cr').value;
  const pb = document.getElementById('proficiency_bonus');
  const n = eval(cr);
  const val = n <= 4 ? 2 : n <= 8 ? 3 : n <= 12 ? 4 : n <= 16 ? 5 : n <= 20 ? 6 : n <= 24 ? 7 : n <= 28 ? 8 : 9;
  pb.value = val;
  localStorage.setItem('dnd_proficiency_bonus', val);
};

const updateHitDice = () => {
  const hp = parseInt(document.getElementById('hp').value);
  const size = document.getElementById('size').value;
  const con = parseInt(document.getElementById('con').value) || 10;
  if (isNaN(hp) || hp <= 0) return;
  const table = { 'Крошечный': {d:4,a:2.5}, 'Маленький': {d:6,a:3.5}, 'Средний': {d:8,a:4.5}, 'Большой': {d:10,a:5.5}, 'Огромный': {d:12,a:6.5}, 'Громадный': {d:20,a:10.5} };
  const cfg = table[size] || table['Средний'];
  const mod = getModifier(con);
  const count = Math.max(1, Math.round(hp / (cfg.a + mod)));
  const bonus = mod * count;
  let res = `${count}d${cfg.d}${bonus !== 0 ? ` ${bonus > 0 ? '+' : '-'} ${Math.abs(bonus)}` : ''}`;
  document.getElementById('hit_dice').value = res;
  localStorage.setItem('dnd_hit_dice', res);
};

window.onload = () => {
  fields.forEach(id => {
    const saved = localStorage.getItem('dnd_' + id);
    if (saved !== null) {
      setFieldValue(id, saved);
    }
  });
  showImagePreview(imageHidden.value);
  updateAuthor();
  renderEnemyList();
};

fields.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => {
    if (el.type === 'number' && el.value < 0) el.value = 0;
    localStorage.setItem('dnd_' + id, getFieldValue(id));
    if (id === 'author') updateAuthor();
    if (['hp', 'size', 'con'].includes(id)) updateHitDice();
    if (id === 'cr') updateProficiency();
  });
});

imageUploadBtn.onclick = () => imageInput.click();
imageInput.onchange = function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const cvs = document.createElement('canvas');
      let w = img.width, h = img.height, max = 500;
      if (w > max || h > max) { if (w > h) { h *= max/w; w = max; } else { w *= max/h; h = max; } }
      cvs.width = w; cvs.height = h;
      cvs.getContext('2d').drawImage(img, 0, 0, w, h);
      const data = cvs.toDataURL('image/jpeg', 0.7);
      imageHidden.value = data;
      showImagePreview(data);
      localStorage.setItem('dnd_image', data);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

imageDeleteBtn.onclick = () => { imageHidden.value = ''; localStorage.removeItem('dnd_image'); showImagePreview(''); };
const showImagePreview = url => { imagePreview.innerHTML = url ? `<img src="${url}" style="max-width:200px">` : ''; imageDeleteBtn.style.display = url ? '' : 'none'; };

const clearForm = () => {
  if (confirm('Очистить форму?')) {
    fields.forEach(id => {
      localStorage.removeItem('dnd_' + id);
      const el = document.getElementById(id);
      if (el) el.multiple ? Array.from(el.options).forEach(o => o.selected = false) : el.value = (id === 'speed_walk' ? 30 : (id.includes('speed') ? 0 : ''));
    });
    imageHidden.value = ''; showImagePreview('');
    ['immune_damage', 'immune_conditions', 'resistances', 'vulnerabilities'].forEach(SelectedDisplayHelper);
    updateAuthor();
  }
};

const updateAuthor = () => document.getElementById('author-output').textContent = getFieldValue('author') ? `Автор: ${getFieldValue('author')}` : '';

const importData = e => {
  const files = e.target.files;
  if (!files.length) return;
  Promise.all(Array.from(files).map(f => new Promise(res => {
    const r = new FileReader();
    r.onload = ev => { try { const d = JSON.parse(ev.target.result); Array.isArray(d) ? savedEnemies.push(...d) : savedEnemies.push(d); } catch(err){} res(); };
    r.readAsText(f);
  }))).then(() => { localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies)); renderEnemyList(); });
};

const renderEnemyList = () => {
  const list = document.getElementById('enemy-list');
  list.innerHTML = '';
  savedEnemies.forEach((en, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span style="flex:1;cursor:pointer">${en.name || 'Враг'}</span><span class="enemy-buttons">
      <button onclick="viewEnemy(savedEnemies[${i}])">👁</button>
      <button onclick="loadEnemy(savedEnemies[${i}])">⚙</button>
      <button onclick="deleteEnemy(${i})">✖</button></span>`;
    li.querySelector('span').onclick = () => loadEnemy(en);
    list.appendChild(li);
  });
};

const deleteEnemy = i => { if (confirm('Удалить?')) { savedEnemies.splice(i, 1); localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies)); renderEnemyList(); } };

const loadEnemy = en => {
  fields.forEach(id => {
    localStorage.setItem('dnd_' + id, en[id] || '');
  });
  fields.forEach(id => {
    setFieldValueHandler(id, en[id]);
  });
  showImagePreview(en.image || '');
  updateAuthor();
};

const setFieldValueHandler = (id, val) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.multiple) {
    const vals = (val || '').split(',').map(v => v.trim());
    Array.from(el.options).forEach(o => o.selected = vals.includes(o.value));
    SelectedDisplayHelper(id);
  } else {
    el.value = val || '';
  }
};

const formatText = t => t ? t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>') : '';

const viewEnemy = en => {
    const win = window.open('', '_blank', 'width=800,height=900');
    const sMap = {'Крошечный': '1/4 клетки', 'Маленький': '1 клетка', 'Средний': '1 клетка', 'Большой': '2x2 клетки', 'Огромный': '3x3 клетки', 'Громадный': '4x4 клетки+'};
    const speeds = [];
    if (en.speed_walk > 0) speeds.push(`${en.speed_walk} фт.`);
    ['climb', 'fly', 'swim', 'burrow'].forEach(m => { if (en['speed_'+m] > 0) { const names = {climb:'лазая', fly:'летая', swim:'плавая', burrow:'копая'}; speeds.push(`${names[m]} ${en['speed_'+m]} фт.`); }});
    const sensesFull = (en.senses ? en.senses + ', ' : '') + `пассивная Внимательность ${10 + getModifier(en.wis)}`;
    
    let h = `<html><head><style>
    body { font-family: 'Cormorant Garamond', serif; background: #18191c; color: #e0e0e0; padding: 30px; line-height: 1.4; }
    h2 { color: #e74c3c; font-size:2.4em; margin: 0; }
    .sub { font-style: italic; color: #bbb; border-bottom: 2px solid #e74c3c; padding-bottom: 5px; margin-bottom: 15px; }
    .lab { font-weight: bold; color: #e74c3c; text-transform: uppercase; font-size: 0.9em; }
    .num { font-size: 1.2em; font-weight: bold; color: #fff; }
    .red-head { color: #e74c3c; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #e74c3c; margin: 15px 0 10px 0; font-size: 1.1em; }
    table { width: 100%; max-width: 450px; background: #232326; border-collapse: collapse; border: 1px solid #444; margin: 15px 0; }
    th, td { border: 1px solid #444; padding: 8px; text-align: center; }
    th { color: #e74c3c; font-size: 0.8em; }
    .img-box { margin: 20px 0; text-align: center; }
    .img-box img { max-width: 100%; border-radius: 8px; border: 1px solid #444; }
    .tag { background: #333; border: 1px solid #444; padding: 2px 8px; border-radius: 2px; margin-right: 4px; display: inline-block; }
    .copy-btn { position: fixed; top: 10px; right: 10px; padding: 10px; background: #e74c3c; color: #fff; border: none; cursor: pointer; border-radius: 4px; z-index:100; }
    </style></head><body><button class="copy-btn" onclick="copySheet()">Копировать текст</button><div id="sheet-content">`;
    h += `<h2>${en.name || 'Враг'}</h2><div class="sub">${en.size} ${en.type}, ${en.alignment} (${sMap[en.size] || ''})</div>`;
    h += `<div><span class="lab">КД:</span> <span class="num">${en.ac || 10}</span><br>
          <span class="lab">ХП:</span> <span class="num">${en.hp || 0}</span> <i>(${en.hit_dice || ''})</i><br>
          <span class="lab">Скорость:</span> <span class="num">${speeds.join(', ') || '0 фт.'}</span></div>`;
    h += `<table><tr><th>СИЛ</th><th>ЛОВ</th><th>ТЕЛ</th><th>ИНТ</th><th>МУД</th><th>ХАР</th></tr>
          <tr><td>${en.str} (${getModifier(en.str) >= 0 ? '+' : ''}${getModifier(en.str)})</td><td>${en.dex} (${getModifier(en.dex) >= 0 ? '+' : ''}${getModifier(en.dex)})</td><td>${en.con} (${getModifier(en.con) >= 0 ? '+' : ''}${getModifier(en.con)})</td>
          <td>${en.int} (${getModifier(en.int) >= 0 ? '+' : ''}${getModifier(en.int)})</td><td>${en.wis} (${getModifier(en.wis) >= 0 ? '+' : ''}${getModifier(en.wis)})</td><td>${en.cha} (${getModifier(en.cha) >= 0 ? '+' : ''}${getModifier(en.cha)})</td></tr></table>`;
    if (en.saves) h += `<div><span class="lab">Спасброски:</span> ${formatText(en.saves)}</div>`;
    [['Иммунитет', en.immune_damage], ['Состояния', en.immune_conditions], ['Сопротивление', en.resistances], ['Уязвимость', en.vulnerabilities]].forEach(f => {
      if (f[1]) h += `<div><span class="lab">${f[0]}:</span> ${f[1].split(',').map(v => `<span class="tag">${v.trim()}</span>`).join('')}</div>`;
    });
    h += `<div><span class="lab">Чувства:</span> ${sensesFull}</div><div><span class="lab">Языки:</span> ${en.languages || '—'}</div>
          <div><span class="lab">CR:</span> <span class="num">${en.cr}</span> | <span class="lab">Бонус:</span> <span class="num">+${en.proficiency_bonus}</span></div>`;
    if (en.traits) h += `<div class="red-head">Особые свойства</div><div>${formatText(en.traits)}</div>`;
    h += `<div class="red-head">Действия</div><div>${formatText(en.actions)}</div>`;
    if (en.description) h += `<div class="red-head">Описание</div><div style="font-style:italic;">${formatText(en.description)}</div>`;
    if (en.image) h += `<div class="img-box"><img src="${en.image}"></div>`;
    h += `<div style="color:#555; margin-top:40px; font-size:0.8em">Автор: ${en.author || 'Неизвестен'}</div></div>
    <script>function copySheet(){const el=document.getElementById('sheet-content');const range=document.createRange();range.selectNode(el);window.getSelection().removeAllRanges();window.getSelection().addRange(range);document.execCommand('copy');alert('Скопировано!');}</script></body></html>`;
    win.document.write(h); win.document.close();
};

const downloadEnemy = async en => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(en, null, 2));
  
  // Проверяем, поддерживает ли браузер современный API для сохранения файлов
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: (en.name || 'monster') + '.json',
        types: [{
          description: 'JSON-файлы',
          accept: {'application/json': ['.json']},
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(en, null, 2));
      await writable.close();
      return;
    } catch (err) {
      console.log('Пользователь отменил сохранение через системный диалог, используем обычное скачивание.');
    }
  }

  // Стандартный метод, если API не поддерживается (показывает стандартное окно браузера с выбором папки)
  const a = document.createElement('a');
  a.setAttribute("href", dataStr);
  a.setAttribute("download", (en.name || 'monster') + '.json');
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const createWithChoice = () => {
  const d = {}; 
  fields.forEach(id => d[id] = getFieldValue(id));
  
  savedEnemies.push(d);
  localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
  renderEnemyList();
  
  downloadEnemy(d);
};

const saveWithChoice = () => {
  const d = {}; 
  fields.forEach(id => d[id] = getFieldValue(id));
  
  savedEnemies.push(d);
  localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
  renderEnemyList();
  
  downloadEnemy(d);
};

document.getElementById('create-btn').onclick = createWithChoice;
document.getElementById('update-btn').onclick = () => {
  const d = {}; 
  fields.forEach(id => d[id] = getFieldValue(id));
  savedEnemies.push(d);
  localStorage.setItem('dnd_enemies', JSON.stringify(savedEnemies));
  renderEnemyList();
};
document.getElementById('save-btn').onclick = saveWithChoice;

const SelectedDisplayHelper = id => {
  const s = document.getElementById(id), d = document.getElementById(id + '_display');
  if (s && d) {
    d.innerHTML = Array.from(s.selectedOptions).map(o => `<span>${o.textContent}</span>`).join('') || '<span style="color:#ffffff;">Не выбрано</span>';
  }
};

['immune_damage', 'immune_conditions', 'resistances', 'vulnerabilities'].forEach(id => {
  SelectedDisplayHelper(id);
  const s = document.getElementById(id), c = s.closest('.select-container'), disp = document.getElementById(id + '_display');
  s.onchange = () => SelectedDisplayHelper(id);
  disp.onclick = e => { e.stopPropagation(); c.classList.toggle('open'); if (c.classList.contains('open')) s.focus(); };
});

document.onclick = () => document.querySelectorAll('.select-container.open').forEach(c => c.classList.remove('open'));
document.querySelectorAll('.select-container select').forEach(s => s.onclick = e => e.stopPropagation());

const addSave = () => {
  const type = document.getElementById('save_type').value;
  const bonus = document.getElementById('save_bonus').value;
  const input = document.getElementById('saves');
  if (!bonus) return;
  const entry = `${type} +${bonus}`;
  input.value = input.value ? `${input.value}, ${entry}` : entry;
  localStorage.setItem('dnd_saves', input.value);
};