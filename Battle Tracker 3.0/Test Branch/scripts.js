let combatants = [];
let currentTurnIndex = 0;

const CONDITION_DB = {
    "БЕССОЗНАТЕЛЬНЫЙ": `
Неподвижность - Вы получаете состояния «Недееспособный» и «Сбитый с ног» и роняете всё, что держите. Когда это состояние оканчивается, вы остаётесь сбитым с ног. 
Скорость 0 - Ваша Скорость равна 0 и не может увеличиться. 
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом. 
Затронуты спасброски - Вы автоматически проваливаете спасброски Силы и Ловкости. 
Автоматические критические попадания - Каждый успешный бросок атаки по вам становится Критическим попаданием, если атакующий находится в пределах 5 футов от вас. 
Неосведомлённость - Вы не осознаёте своё окружение.`,
    "ИСПУГАННЫЙ": `
Затронуты проверки характеристик и атаки - Вы совершаете с Помехой проверки характеристик и броски атаки, пока источник страха находится в пределах вашей линии обзора. 
Не можете приблизиться - Вы не способны добровольно приблизиться к источнику своего страха.`,
    "НЕВИДИМЫЙ": `
Застигнуть врасплох - Вы получаете Преимущество к броску Инициативы. 
Скрыт - Вы не подвержены никаким эффектам, требующим, чтобы цель быть видна, если у создателя эффекта нет какого-нибудь способа вас видеть. Всё снаряжение, которое вы носите или несёте, также скрыто. 
Затронуты атаки - Броски атаки по вам совершаются с Помехой, а ваши броски атаки — с Преимуществом. Если существо каким-то образом может вас видеть, эти эффекты не действуют на него.`,
    "НЕДЕЕСПОСОБНЫЙ": `
Бездействие - Вы не можете совершать Действия и Реакции. 
Без Концентрации - Ваша Концентрация нарушена. 
Немота - Вы не можете говорить. 
Застигнут врасплох - Вы получаете Помеху к броску Инициативы.`,
    "ОГЛОХШИЙ": `
Потеря слуха - Вы ничего не слышите и автоматически проваливаете все проверки характеристик, связанные со слухом.`,
    "ОКАМЕНЕВШИЙ": `
Обращение в неодушевлённую материю - Вы и все немагические предметы, которые вы носите или несёте, превращаетесь в твёрдую неодушевлённую материю (обычно, камень). Ваш вес увеличивается в 10 раз, и вы перестаёте стареть. 
Недееспособность - Вы получаете состояние «Недееспособный». 
Скорость 0 - Ваша Скорость равна 0 и не может увеличиться. 
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом. 
Затронуты спасброски - Вы автоматически проваливаете спасброски Силы и Ловкости. 
Сопротивление к урону - У вас Сопротивление ко всем видам урона. 
Иммунитет к яду - У вас Иммунитет к состоянию «Отравленный».`,
    "ОПУТАННЫЙ": `
Скорость 0 - Ваша Скорость равна 0 и не может увеличиться. 
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом, а ваши броски атаки — с Помехой. 
Затронуты спасброски - Вы совершаете спасброски Ловкости с Помехой.`,
    "ОСЛЕПЛЁННЫЙ": `
Потеря зрения - Вы ничего не видите и автоматически проваливаете все проверки характеристик, связанные со зрением. 
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом, а ваши броски атаки — с Помехой.`,
    "ОТРАВЛЕННЫЙ": `
Затронуты проверки характеристик и атаки - Вы совершаете с Помехой проверки характеристик и броски атаки.`,
    "ОЧАРОВАННЫЙ": `
Не можете навредить очарователю - Вы не можете атаковать того, кто вас очаровал, а также сделать его целью умения или магического эффекта, причиняющего вред. 
Социальное Преимущество - Очарователь совершает с Преимуществом все проверки характеристик при социальном взаимодействии с вами.`,
    "ОШЕЛОМЛЁННЫЙ": `
Недееспособность - Вы получаете состояние «Недееспособный». 
Затронуты спасброски - Вы автоматически проваливаете спасброски Силы и Ловкости. 
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом.`,
    "ПАРАЛИЗОВАННЫЙ": `
Недееспособность - Вы получаете состояние «Недееспособный». 
Скорость 0 - Ваша Скорость равна 0 и не может увеличиться. 
Затронуты спасброски - Вы автоматически проваливаете спасброски Силы и Ловкости. 
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом. 
Автоматические критические попадания - Каждый успешный бросок атаки по вам становится Критическим попаданием, если атакующий находится в пределах 5 футов от вас.`,
    "СБИТЫЙ С НОГ": `
Ограниченная подвижность - Вы способны перемещаться только ползком и можете потратить половину своей Скорости (с округлением вниз), чтобы подняться, оканчивая тем самым это состояние. Если ваша Скорость равна 0, вы не можете подняться. 
Затронуты атаки - Ваши броски атаки совершаются с Помехой. Броски атаки по вам совершаются с Преимуществом, если атакующий находится 5 футах от вас. В противном случае этот бросок атаки совершается с Помехой.`,
    "СХВАЧЕННЫЙ": `
Скорость 0 - Ваша Скорость равна 0 и не может увеличиться. 
Затронуты атаки - Ваши броски атаки совершаются с Помехой по любой цели, кроме схватившего вас существа. 
Перемещаемость - Схватившее вас существо может тянуть или переносить вас во время своего движения, но каждый фут перемещения будет стоить ему 1 дополнительный фут, если вы не Крошечный или на два и более размеров меньше этого существа.`
};

document.addEventListener('DOMContentLoaded', () => {
    loadCombatants();
    document.getElementById('addForm').addEventListener('submit', handleAdd);
    const importInput = document.getElementById('importFile');
    if (importInput) importInput.addEventListener('change', handleImport);
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
                    combatants.push(...newEntries.map(c => ({...c, conditions: c.conditions || []})));
                    resolve();
                } catch (err) { resolve(); }
            };
            reader.readAsText(file);
        });
    });
    Promise.all(readers).then(() => { sortAndRender(); event.target.value = ''; });
}

window.fixLeadingZeros = (e) => {
    if (e.target.type === 'number') {
        let val = e.target.value;
        if (val.length > 1 && val.startsWith('0')) e.target.value = val.replace(/^0+/, '');
    }
};

function formatRichText(text) {
    if (!text) return "";
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/(преимущ[а-яё]*)/gi, '<span class="text-adv">$1</span>');
    html = html.replace(/(помех[а-яё]*)/gi, '<span class="text-disadv">$1</span>');
    Object.keys(CONDITION_DB).forEach(cond => {
        const regex = new RegExp(`(${cond})`, 'gi');
        html = html.replace(regex, '<b>$1</b>');
    });
    return html;
}

function handleAdd(e) {
    e.preventDefault();
    const maxHpVal = parseInt(document.getElementById('maxHp').value) || 10;
    const hpInput = document.getElementById('hp').value;
    const initVal = parseInt(document.getElementById('initiative').value) || 0;
    const acVal = parseInt(document.getElementById('ac').value) || 0;

    const newChar = {
        id: Date.now(),
        name: document.getElementById('name').value,
        ac: Math.max(0, acVal),
        hp: hpInput === "" ? maxHpVal : parseInt(hpInput),
        maxHp: maxHpVal,
        initiative: Math.max(-5, initVal),
        notes: "",
        isCollapsed: false,
        showNotes: false,
        deathSaves: { success: 0, failure: 0 },
        isDead: false,
        concentration: false,
        concentrationCounter: 0,
        conditions: [],
        showCondMenu: false
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
        div.className = `combatant ${index === currentTurnIndex ? 'active' : ''} ${c.isDead ? 'dead' : ''} ${c.isCollapsed ? 'collapsed' : ''} ${c.showNotes ? 'notes-open' : ''}`;
        const hpPct = Math.min(Math.max((c.hp / c.maxHp) * 100, 0), 100);
        div.innerHTML = `
            <div class="combatant-main-row">
                <button class="icon-btn" onclick="toggleCollapse(${index})">${c.isCollapsed ? '▶' : '▼'}</button>
                <div class="combatant-name hide-on-collapse"><b>${c.name} ${c.isDead ? '💀' : ''}</b></div>
                <div class="ac-box hide-on-collapse">🛡️ <input type="number" value="${c.ac}" onchange="updateProp(${index}, 'ac', this.value)" style="width:35px" min="0"></div>
                <div class="hp-control hide-on-collapse">
                    <button class="icon-btn" onclick="changeHp(${index}, -1)">⚔️</button>
                    <input type="number" id="hp-mod-${index}" placeholder="0" style="width:40px" min="0">
                    <button class="icon-btn" onclick="changeHp(${index}, 1)">❤️</button>
                </div>
                <div class="cond-box hide-on-collapse">
                    <button class="icon-btn" onclick="toggleCondMenu(${index})">✨</button>
                    <div class="condition-menu ${c.showCondMenu ? 'open' : ''}">
                        ${Object.keys(CONDITION_DB).map(cond => `
                            <label><input type="checkbox" ${c.conditions.includes(cond) ? 'checked' : ''} onchange="toggleCondition(${index}, '${cond}')"> ${cond}</label>
                        `).join('')}
                    </div>
                </div>
                <div class="conc-box hide-on-collapse">
                    <button class="icon-btn" onclick="setConcentration(${index})">${c.concentration ? '🌀' + c.concentrationCounter : '💤'}</button>
                </div>
                <div class="init-box hide-on-collapse">⏳ <input type="number" value="${c.initiative}" onchange="updateProp(${index}, 'initiative', this.value)" style="width:35px" min="-5"></div>
                <div class="health-bar hide-on-collapse">
                    <div class="health-text">${c.hp <= 0 && !c.isDead ? 'СПАСБРОСКИ' : c.hp + ' / ' + c.maxHp}</div>
                    <div class="health-bar-inner" style="width: ${hpPct}%; background: ${getHpColor(hpPct)}"></div>
                </div>
                <div class="actions hide-on-collapse">
                    <button class="icon-btn" onclick="toggleNotes(${index})">📝</button>
                    <button class="icon-btn" onclick="copyCombatant(${index})">📑</button>
                    <button class="icon-btn remove-btn" onclick="removeCombatant(${index})">🗑️</button>
                </div>
            </div>
            <div class="notes-area">
                <div class="notes-view" id="view-${index}" onclick="editNotes(${index})">${formatRichText(c.notes) || '...'}</div>
                <textarea class="notes-input" id="input-${index}" style="display:none" onblur="saveNotes(${index})">${c.notes}</textarea>
            </div>
            ${c.hp <= 0 && !c.isDead ? renderDeathSaves(index, c) : ''}
        `;
        container.appendChild(div);
    });
}

window.toggleCondMenu = (i) => { combatants[i].showCondMenu = !combatants[i].showCondMenu; render(); };

window.toggleCondition = (i, cond) => {
    const c = combatants[i];
    const fullEffectText = `${cond} ${CONDITION_DB[cond]}`;
    
    if (c.conditions.includes(cond)) {
        c.conditions = c.conditions.filter(x => x !== cond);
        c.notes = c.notes.replace(fullEffectText, "").trim();
        c.notes = c.notes.replace(/\n\s*\n/g, '\n').trim();
    } else {
        c.conditions.push(cond);
        c.notes = (c.notes.trim() + (c.notes.trim() ? '\n\n' : '') + fullEffectText).trim();
    }
    saveCombatants();
    render();
};

window.editNotes = (i) => {
    document.getElementById(`view-${i}`).style.display = 'none';
    const input = document.getElementById(`input-${i}`);
    input.style.display = 'block';
    input.focus();
};

window.saveNotes = (i) => {
    const val = document.getElementById(`input-${i}`).value;
    combatants[i].notes = val;
    saveCombatants();
    render();
};

window.changeHp = (index, sign) => {
    let mod = parseInt(document.getElementById(`hp-mod-${index}`).value) || 0;
    mod = Math.max(0, mod); // Урон/лечение не может быть отрицательным
    const c = combatants[index];
    if (sign > 0) {
        c.hp = Math.min(c.maxHp, c.hp + mod);
        if (c.hp > 0) { c.isDead = false; c.deathSaves = {success: 0, failure: 0}; }
    } else {
        c.hp = Math.max(0, c.hp - mod);
        if (c.hp <= 0) c.concentration = false;
    }
    sortAndRender();
};

window.updateProp = (i, p, v) => {
    let val = parseInt(v);
    if (p === 'ac') val = Math.max(0, val);
    if (p === 'initiative') val = Math.max(-5, val);
    
    combatants[i][p] = (p === 'notes') ? v : val;
    if (p === 'initiative') combatants.sort((a, b) => b.initiative - a.initiative);
    saveCombatants();
    render();
};

window.setConcentration = (i) => {
    const c = combatants[i];
    if (!c.concentration) {
        const r = parseInt(prompt("Длительность (раунды):", "10"));
        if (r > 0) { c.concentration = true; c.concentrationCounter = r; }
    } else { c.concentration = false; c.concentrationCounter = 0; }
    sortAndRender();
};

window.copyCombatant = (i) => {
    const copy = JSON.parse(JSON.stringify(combatants[i]));
    copy.id = Date.now();
    copy.name += " (копия)";
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

window.handleDeathSave = (i, t, s) => {
    const c = combatants[i];
    if (c.deathSaves[t] === s + 1) c.deathSaves[t] = s;
    else c.deathSaves[t] = s + 1;
    if (t === 'success' && c.deathSaves.success >= 3) { c.hp = 1; c.deathSaves = {success:0, failure:0}; }
    else if (t === 'failure' && c.deathSaves.failure >= 3) c.isDead = true;
    sortAndRender();
};

window.nextTurn = () => {
    if (!combatants.length) return;
    currentTurnIndex = (currentTurnIndex + 1) % combatants.length;
    combatants.forEach(c => {
        if (c.concentration && c.concentrationCounter > 0) {
            c.concentrationCounter--;
            if (c.concentrationCounter === 0) c.concentration = false;
        }
    });
    sortAndRender();
};

window.prevTurn = () => {
    if (!combatants.length) return;
    currentTurnIndex = (currentTurnIndex - 1 + combatants.length) % combatants.length;
    render();
};

function sortAndRender() { combatants.sort((a, b) => b.initiative - a.initiative); saveCombatants(); render(); }
function getHpColor(p) { return p > 70 ? '#2ecc71' : p > 30 ? '#f1c40f' : '#e74c3c'; }
function saveCombatants() { localStorage.setItem('dnd_v5_data', JSON.stringify(combatants)); }
function loadCombatants() { const d = localStorage.getItem('dnd_v5_data'); if(d) combatants = JSON.parse(d); render(); }
window.toggleCollapse = (i) => { combatants[i].isCollapsed = !combatants[i].isCollapsed; render(); };
window.toggleNotes = (i) => { combatants[i].showNotes = !combatants[i].showNotes; render(); };
window.removeCombatant = (i) => { combatants.splice(i, 1); sortAndRender(); };
window.exportCombatants = () => {
    const blob = new Blob([JSON.stringify(combatants, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'battle_tracker.json';
    a.click();
};