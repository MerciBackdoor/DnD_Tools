let combatants = [];
let currentTurnIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadCombatants();
    document.getElementById('addForm').addEventListener('submit', handleAdd);
    
    // Привязываем выбор файла к функции обработки
    const importInput = document.getElementById('importFile');
    if (importInput) {
        importInput.addEventListener('change', handleImport);
    }
});

function handleImport(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const readers = Array.from(files).map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const newEntries = Array.isArray(data) ? data : [data];
                    
                    // Добавляем бойцов в общий массив трекера
                    combatants.push(...newEntries);
                    resolve();
                } catch (err) {
                    console.error('Ошибка при чтении файла:', file.name, err);
                    resolve();
                }
            };
            reader.readAsText(file);
        });
    });

    Promise.all(readers).then(() => {
        // Сортируем, сохраняем в локальное хранилище и перерисовываем список
        sortAndRender();
        
        // Очищаем инпут для возможности повторной загрузки
        event.target.value = '';
    });
}

// Предохранитель: заменяет 0 на вводимую цифру (011 -> 11)
window.fixLeadingZeros = (e) => {
    if (e.target.type === 'number') {
        let val = e.target.value;
        if (val.length > 1 && val.startsWith('0')) {
            e.target.value = val.replace(/^0+/, '');
        }
    }
};

function handleAdd(e) {
    e.preventDefault();
    const initVal = parseInt(document.getElementById('initiative').value);
    const acVal = parseInt(document.getElementById('ac').value);
    
    const newChar = {
        id: Date.now(),
        name: document.getElementById('name').value,
        ac: Math.max(0, acVal || 0), // Валидация КД: не ниже 0
        hp: parseInt(document.getElementById('hp').value) || parseInt(document.getElementById('maxHp').value),
        maxHp: parseInt(document.getElementById('maxHp').value) || 10,
        initiative: Math.max(0, initVal),
        notes: "",
        isCollapsed: false,
        showNotes: false,
        deathSaves: { success: 0, failure: 0 },
        isDead: false,
        concentration: false,
        concentrationCounter: 0
    };
    combatants.push(newChar);
    sortAndRender();
    e.target.reset();
}

function render() {
    const container = document.getElementById('combatants');
    container.innerHTML = '';

    combatants.forEach((c, index) => {
        const div = document.createElement('div');
        div.className = `combatant ${index === currentTurnIndex ? 'active' : ''} 
                         ${c.isDead ? 'dead' : ''} 
                         ${c.isCollapsed ? 'collapsed' : ''} 
                         ${c.showNotes ? 'notes-open' : ''}`;

        const hpPercent = Math.min(Math.max((c.hp / c.maxHp) * 100, 0), 100);
        
        div.innerHTML = `
            <div class="combatant-main-row">
                <button class="icon-btn" onclick="toggleCollapse(${index})">${c.isCollapsed ? '▶' : '▼'}</button>
                <div class="combatant-name hide-on-collapse">
                <b>${c.name} ${c.isDead ? '💀' : ''}</b>
                </div>
                <div class="ac-box hide-on-collapse">
                    🛡️ <input type="number" min="0" value="${c.ac}" oninput="fixLeadingZeros(event)" onchange="updateProp(${index}, 'ac', this.value)" style="width:35px">
                </div>
                <div class="hp-control hide-on-collapse">
                    <button onclick="changeHp(${index}, -1)">⚔️</button>
                    <input type="number" id="hp-mod-${index}" placeholder="0" min="0" oninput="fixLeadingZeros(event)" style="width:40px">
                    <button onclick="changeHp(${index}, 1)">❤️</button>
                </div>
                <div class="conc-box hide-on-collapse">
                    <button class="icon-btn" onclick="setConcentration(${index})">
                        ${c.concentration ? '🌀' + c.concentrationCounter : '💤'}
                    </button>
                </div>
                <div class="init-box hide-on-collapse">
                    ⏳ <input type="number" min="0" value="${c.initiative}" oninput="fixLeadingZeros(event)" onchange="updateProp(${index}, 'initiative', this.value)" style="width:35px">
                </div>
                <div class="health-bar hide-on-collapse">
                    <div class="health-text">${c.hp <= 0 && !c.isDead ? 'СПАСБРОСКИ' : c.hp + ' / ' + c.maxHp}</div>
                    <div class="health-bar-inner" style="width: ${hpPercent}%; background: ${getHpColor(hpPercent)}"></div>
                </div>
                <div class="actions hide-on-collapse">
                    <button class="icon-btn" onclick="toggleNotes(${index})" title="Заметки">📝</button>
                    <button class="icon-btn" onclick="copyCombatant(${index})" title="Копировать">📑</button>
                    <button class="icon-btn remove-btn" onclick="removeCombatant(${index})" title="Удалить">🗑️</button>
                </div>
            </div>
            <div class="notes-area"><textarea rows="3" onchange="updateProp(${index}, 'notes', this.value)">${c.notes}</textarea></div>
            ${c.hp <= 0 && !c.isDead ? renderDeathSaves(index, c) : ''}
        `;
        container.appendChild(div);
    });
}

window.changeHp = (index, sign) => {
    const modInput = document.getElementById(`hp-mod-${index}`);
    const mod = Math.abs(parseInt(modInput.value)) || 0; 
    const c = combatants[index];
    const oldHp = c.hp;
    
    if (sign > 0) {
        // Лечение
        c.hp = Math.min(c.maxHp, c.hp + mod);
        if (c.hp > 0) { 
            c.isDead = false; 
            c.deathSaves = {success: 0, failure: 0}; 
        }
    } else {
        // Урон
        const remainingHp = c.hp - mod;
        const deathThreshold = -(c.maxHp * 0.5); // Порог -50% от макс. ХП

        if (remainingHp <= deathThreshold) {
            // МГНОВЕННАЯ СМЕРТЬ
            c.hp = 0;
            c.isDead = true;
            c.concentration = false;
            const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const deathNote = `\n[${timestamp}] МГНОВЕННАЯ СМЕРТЬ: получено ${mod} урона при ${oldHp} текущих ХП (порог: ${deathThreshold}).`;
            c.notes += deathNote;
        } else {
            // Обычный урон
            c.hp = Math.max(0, remainingHp);
            if (c.hp <= 0) c.concentration = false;
        }
    }
    
    sortAndRender();
};

window.updateProp = (index, prop, value) => {
    let val = (prop === 'notes') ? value : parseInt(value);
    if (prop === 'initiative' || prop === 'ac') val = Math.max(0, val);
    combatants[index][prop] = val;
    if (prop === 'initiative') combatants.sort((a, b) => b.initiative - a.initiative);
    saveCombatants();
    render();
};

window.setConcentration = (index) => {
    const c = combatants[index];
    if (!c.concentration) {
        const val = prompt("Длительность концентрации:", "10");
        const rounds = Math.abs(parseInt(val));
        if (!isNaN(rounds) && rounds > 0) {
            c.concentration = true;
            c.concentrationCounter = rounds;
        }
    } else {
        c.concentration = false;
        c.concentrationCounter = 0;
    }
    sortAndRender();
};

window.copyCombatant = (index) => {
    const original = combatants[index];
    const baseName = original.name.replace(/\s\(\d+\)$/, "");
    const count = combatants.filter(c => c.name.startsWith(baseName)).length;
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = Date.now();
    copy.name = `${baseName} (${count})`;
    copy.isCollapsed = false;
    combatants.push(copy);
    sortAndRender();
};

function renderDeathSaves(index, c) {
    const dot = (type, step, active) => `<div class="death-dot ${type} ${active ? 'active' : ''}" onclick="handleDeathSave(${index}, '${type}', ${step})"></div>`;
    return `<div class="death-saves-row hide-on-collapse">
            <div class="death-save-group"><span>Успех:</span> ${[0,1,2].map(i => dot('success', i, i < c.deathSaves.success)).join('')}</div>
            <div class="death-save-group"><span>Провал:</span> ${[0,1,2].map(i => dot('failure', i, i < c.deathSaves.failure)).join('')}</div>
        </div>`;
}

window.handleDeathSave = (index, type, step) => {
    const c = combatants[index];
    const currentVal = c.deathSaves[type];
    const clickedVal = step + 1;

    // Если кликаем по уже активной точке, сбрасываем на шаг назад
    if (currentVal === clickedVal) {
        c.deathSaves[type] = step;
    } else {
        c.deathSaves[type] = clickedVal;
    }

    // Проверка условий победы над смертью или окончательной гибели
    if (type === 'success' && c.deathSaves.success >= 3) {
        c.hp = 1;
        c.deathSaves = { success: 0, failure: 0 };
    } else if (type === 'failure' && c.deathSaves.failure >= 3) {
        c.isDead = true;
    }

    sortAndRender();
};
window.nextTurn = () => { 
    if(!combatants.length) return;

    // Ищем следующий индекс персонажа, который не свёрнут
    let nextIndex = (currentTurnIndex + 1) % combatants.length;
    let attempts = 0;
    
    // Цикл пропускает всех свёрнутых, пока не найдёт активного или не проверит всех
    while (combatants[nextIndex].isCollapsed && attempts < combatants.length) {
        nextIndex = (nextIndex + 1) % combatants.length;
        attempts++;
    }

    // Если все свёрнуты, индекс не поменяется, иначе переходим на найденного
    if (!combatants[nextIndex].isCollapsed) {
        currentTurnIndex = nextIndex;
    }

    // Снижаем концентрацию только у тех, кто НЕ свёрнут
    combatants.forEach(c => { 
        if(!c.isCollapsed && c.concentration && c.concentrationCounter > 0) {
            c.concentrationCounter--;
            if(c.concentrationCounter === 0) c.concentration = false;
        }
    });
    
    sortAndRender(); 
};

window.prevTurn = () => { 
    if(!combatants.length) return;

    // Ищем предыдущий индекс, пропуская свёрнутых
    let prevIndex = (currentTurnIndex - 1 + combatants.length) % combatants.length;
    let attempts = 0;

    while (combatants[prevIndex].isCollapsed && attempts < combatants.length) {
        prevIndex = (prevIndex - 1 + combatants.length) % combatants.length;
        attempts++;
    }

    if (!combatants[prevIndex].isCollapsed) {
        currentTurnIndex = prevIndex;
    }

    // Увеличиваем концентрацию обратно только у активных
    combatants.forEach(c => { 
        if(!c.isCollapsed && c.concentration) c.concentrationCounter++; 
    });
    
    render(); 
};

function sortAndRender() { combatants.sort((a, b) => b.initiative - a.initiative); saveCombatants(); render(); }
function getHpColor(pct) { return pct > 70 ? '#2ecc71' : pct > 30 ? '#f1c40f' : '#e74c3c'; }
function saveCombatants() { localStorage.setItem('dnd_v5_data', JSON.stringify(combatants)); }
function loadCombatants() { const d = localStorage.getItem('dnd_v5_data'); if(d) combatants = JSON.parse(d); render(); }
window.toggleCollapse = (i) => { combatants[i].isCollapsed = !combatants[i].isCollapsed; render(); };
window.toggleNotes = (i) => { combatants[i].showNotes = !combatants[i].showNotes; render(); };
window.removeCombatant = (i) => { combatants.splice(i, 1); sortAndRender(); };

window.exportCombatants = () => {
    const blob = new Blob([JSON.stringify(combatants, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'battle_tracker_pro.json';
    a.click();
};
window.importCombatants = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Читаем все выбранные файлы
    const readers = Array.from(files).map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Если в файле массив (как в твоем случае), добавляем всех.
                    // Если один объект — превращаем в массив из одного элемента.
                    const newEntries = Array.isArray(data) ? data : [data];
                    
                    // Добавляем новых бойцов в общий список
                    combatants.push(...newEntries);
                    resolve();
                } catch (err) {
                    console.error('Ошибка при чтении файла:', file.name, err);
                    resolve();
                }
            };
            reader.readAsText(file);
        });
    });

    // Когда все файлы прочитаны
    Promise.all(readers).then(() => {
        // Сортируем по инициативе, сохраняем в память и обновляем экран
        sortAndRender();
        
        // Очищаем поле выбора, чтобы можно было загрузить тот же файл снова
        event.target.value = '';
        alert('Враги успешно импортированы на арену!');
    });
};