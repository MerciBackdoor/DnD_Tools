let combatants = [];
let currentTurnIndex = 0;

const CONDITION_DB = {
"БЕССОЗНАТЕЛЬНЫЙ": `Неподвижность - Вы получаете состояния «Недееспособный» и «Сбитый с ног» и роняете всё, что держите. Когда это состояние оканчивается, вы остаётесь сбитым с ног.
Скорость 0 - Ваша Скорость равна 0 и не может увеличиться.
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом.
Затронуты спасброски - Вы автоматически проваливаете спасброски Силы и Ловкости.
Автоматические критические попадания - Каждый успешный бросок атаки по вам становится Критическим попаданием, если атакующий находится в пределах 5 футов от вас.
Неосведомлённость - Вы не осознаёте своё окружение.`,

    "ИСПУГАННЫЙ": `Затронуты проверки характеристик и атаки - Вы совершаете с Помехой проверки характеристик и броски атаки, пока источник страха находится в пределах вашей линии обзора.
Не можете приблизиться - Вы не способны добровольно приблизиться к источнику своего страха.`,

    "НЕВИДИМЫЙ": `Застигнуть врасплох - Вы получаете Преимущество к броску Инициативы.
Скрыт - Вы не подвержены никаким эффектам, требующим, чтобы цель быть видна, если у создателя эффекта нет какого-нибудь способа вас видеть. Всё снаряжение, которое вы носите или несёте, также скрыто.
Затронуты атаки - Броски атаки по вам совершаются с Помехой, а ваши броски атаки — с Преимуществом. Если существо каким-то образом может вас видеть, эти эффекты не действуют на него.`,

    "НЕДЕЕСПОСОБНЫЙ": `Бездействие - Вы не можете совершать Действия и Реакции.
Без Концентрации - Ваша Концентрация нарушена.
Немота - Вы не можете говорить.
Застигнут врасплох - Вы получаете Помеху к броску Инициативы.`,

    "ОГЛОХШИЙ": `Потеря слуха - Вы ничего не слышите и автоматически проваливаете все проверки характеристик, связанные со слухом.`,

    "ОКАМЕНЕВШИЙ": `Обращение в неодушевлённую материю - Вы и все немагические предметы, которые вы носите или несёте, превращаетесь в твёрдую неодушевлённую материю (обычно, камень). Ваш вес увеличивается в 10 раз, и вы перестаёте стареть.
Недееспособность - Вы получаете состояние «Недееспособный».
Скорость 0 - Ваша Скорость равна 0 и не может увеличиться.
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом.
Затронуты спасброски - Вы автоматически проваливаете спасброски Силы и Ловкости.
Сопротивление к урону - У вас Сопротивление ко всем видам урона.
Иммунитет к яду - У вас Иммунитет к состоянию «Отравленный».`,

    "ОПУТАННЫЙ": `Скорость 0 - Ваша Скорость равна 0 и не может увеличиться.
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом, а ваши броски атаки — с Помехой.
Затронуты спасброски - Вы совершаете спасброски Ловкости с Помехой.`,

    "ОСЛЕПЛЁННЫЙ": `Потеря зрения - Вы ничего не видите и автоматически проваливаете все проверки характеристик, связанные со зрением.
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом, а ваши броски атаки — с Помехой.`,

    "ОТРАВЛЕННЫЙ": `Затронуты проверки характеристик и атаки - Вы совершаете с Помехой проверки характеристик и броски атаки.`,

    "ОЧАРОВАННЫЙ": `Не можете навредить очарователю - Вы не можете атаковать того, кто вас очаровал, а также сделать его целью умения или магического эффекта, причиняющего вред.
Социальное Преимущество - Очарователь совершает с Преимуществом все проверки характеристик при социальном взаимодействии с вами.`,

    "ОШЕЛОМЛЁННЫЙ": `Недееспособность - Вы получаете состояние «Недееспособный».
Затронуты спасброски - Вы автоматически проваливаете спасброски Силы и Ловкости.
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом.`,

    "ПАРАЛИЗОВАННЫЙ": `Недееспособность - Вы получаете состояние «Недееспособный».
Скорость 0 - Ваша Скорость равна 0 и не может увеличиться.
Затронуты спасброски - Вы автоматически проваливаете спасброски Силы и Ловкости.
Затронуты атаки - Броски атаки по вам совершаются с Преимуществом.
Автоматические критические попадания - Каждый успешный бросок атаки по вам становится Критическим попаданием, если атакующий находится в пределах 5 футов от вас.`,

    "СБИТЫЙ С НОГ": `Ограниченная подвижность - Вы способны перемещаться только ползком и можете потратить половину своей Скорости (с округлением вниз), чтобы подняться, оканчивая тем самым это состояние. Если ваша Скорость равна 0, вы не можете подняться.
Затронуты атаки - Ваши броски атаки совершаются с Помехой. Броски атаки по вам совершаются с Преимуществом, если атакующий находится 5 футах от вас. В противном случае этот бросок атаки совершается с Помехой.`,

    "СХВАЧЕННЫЙ": `Скорость 0 - Ваша Скорость равна 0 и не может увеличиться.
Затронуты атаки - Ваши броски атаки совершаются с Помехой по любой цели, кроме схватившего вас существа.
Перемещаемость - Схватившее вас существо может тянуть или переносить вас во время своего движения, но каждый фут перемещения будет стоить ему 1 дополнительный фут, если вы не Крошечный или на два и более размеров меньше этого существа.`
};

const EXHAUSTION_EFFECTS = [
    "",
    "ИСТОЩЕНИЕ (УР 1) - Помеха при проверках характеристик.",
    "ИСТОЩЕНИЕ (УР 2) - Скорость уменьшается вдвое.",
    "ИСТОЩЕНИЕ (УР 3) - Помеха при бросках атаки и спасбросках.",
    "ИСТОЩЕНИЕ (УР 4) - Максимум хитов уменьшается вдвое.",
    "ИСТОЩЕНИЕ (УР 5) - Скорость снижается до 0.",
    "ИСТОЩЕНИЕ (УР 6) - Смерть."
];

document.addEventListener('DOMContentLoaded', () => {
    loadCombatants();
    document.getElementById('addForm').addEventListener('submit', handleAdd);
    
    document.getElementById('importFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = JSON.parse(event.target.result);
            if (data.combatants) {
                combatants = data.combatants;
                currentTurnIndex = data.currentTurnIndex || 0;
            } else {
                combatants = data;
                currentTurnIndex = 0;
            }
            saveCombatants();
            render();
        };
        reader.readAsText(file);
    });

    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!e.target.closest('.cond-box') && !e.target.closest('.exhaust-box')) {
            let changed = false;
            combatants.forEach(c => {
                if (c.showCondMenu || c.showExhaustMenu) {
                    c.showCondMenu = false;
                    c.showExhaustMenu = false;
                    changed = true;
                }
            });
            if (changed) render();
        }
    });
});

function formatRichText(text) {
    if (!text) return "";
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/(.+ угас от истощения)/gi, '<span class="death-exhaustion">$1</span>');
    html = html.replace(/(.+ умер от потери крови)/gi, '<span class="death-blood">$1</span>');
    html = html.replace(/(преимущ[а-яё]*)/gi, '<span class="text-adv">$1</span>');
    html = html.replace(/(помех[а-яё]*)/gi, '<span class="text-disadv">$1</span>');
    html = html.replace(/(СМЕРТЬ ОТ МАССИВНОГО УРОНА)/g, '<span class="text-disadv"><b>$1</b></span>');
    Object.keys(CONDITION_DB).forEach(cond => {
        const regex = new RegExp(`(${cond})`, 'gi');
        html = html.replace(regex, '<b>$1</b>');
    });
    for(let i=1; i<=6; i++) {
        const regex = new RegExp(`(ИСТОЩЕНИЕ \\(УР ${i}\\))`, 'gi');
        html = html.replace(regex, '<b>$1</b>');
    }
    return html.replace(/\n/g, '<br>');
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
        tempHp: 0,
        maxHp: maxHpVal,
        baseMaxHp: maxHpVal,
        initiative: Math.max(-5, initVal),
        notes: "",
        isCollapsed: false,
        showNotes: false,
        deathSaves: { success: 0, failure: 0 },
        isDead: false,
        inspiration: false,
        concentration: false,
        concentrationCounter: 0,
        maxConcentration: 0,
        conditions: [],
        exhaustion: 0,
        showCondMenu: false,
        showExhaustMenu: false
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
        const tempPct = Math.min((c.tempHp / c.maxHp) * 100, 100);
        div.innerHTML = `
            <div class="combatant-main-row">
                <button class="icon-btn" onclick="toggleCollapse(${index})">${c.isCollapsed ? '▶' : '▼'}</button>
                <div class="combatant-name hide-on-collapse" onclick="editName(${index})" style="cursor: pointer;"><b>${c.name} ${c.isDead ? '💀' : ''}</b></div>
                <div class="inspiration-box hide-on-collapse" onclick="toggleInspiration(${index})">
                    ${c.inspiration ? '⭐' : '<div class="insp-checkbox"></div>'}
                </div>
                <div class="ac-box hide-on-collapse">🛡️ <input type="number" value="${c.ac}" onchange="updateProp(${index}, 'ac', this.value)" style="width:35px"></div>
                <div class="hp-control hide-on-collapse">
                    <button class="icon-btn" onclick="changeHp(${index}, -1)">⚔️</button>
                    <input type="number" id="hp-mod-${index}" placeholder="0" style="width:40px">
                    <button class="icon-btn" onclick="changeHp(${index}, 1)">❤️</button>
                </div>
                <div class="exhaust-box hide-on-collapse">
                    <button class="icon-btn" onclick="toggleExhaustMenu(${index})">🤕<sup>${c.exhaustion}</sup></button>
                    <div class="exhaust-menu ${c.showExhaustMenu ? 'open' : ''}">
                        <div class="exhaust-row">
                            ${[1, 2, 3, 4, 5, 6].map(lvl => `
                                <div class="exhaust-item">
                                    <input type="checkbox" ${c.exhaustion >= lvl ? 'checked' : ''} onchange="updateExhaustion(${index}, ${c.exhaustion === lvl ? lvl - 1 : lvl})">
                                    <span>${lvl}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
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
                    <button class="icon-btn" onclick="setConcentration(${index})">${c.concentration ? '🌀<span class="conc-counter">' + c.concentrationCounter + '</span>' : '💤'}</button>
                </div>
                <div class="init-box hide-on-collapse">⏳ <input type="number" value="${c.initiative}" onchange="updateProp(${index}, 'initiative', this.value)" style="width:35px"></div>
                <div class="health-bar hide-on-collapse">
                    <div class="health-text">
                        ${c.hp <= 0 && !c.isDead ? 'СПАСБРОСКИ' : 
                            `<span onclick="setTempHp(${index})">${(c.tempHp > 0 ? `(${c.tempHp}) + ` : '') + c.hp}</span> / <span onclick="editMaxHp(${index})">${c.maxHp}</span>`
                        }
                    </div>
                    <div class="health-bar-inner" style="width: ${hpPct}%; background: ${getHpColor(hpPct)}"></div>
                    <div class="health-bar-temp" style="width: ${tempPct}%;"></div>
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

window.changeHp = (index, sign) => {
    let modInput = document.getElementById(`hp-mod-${index}`);
    let mod = parseInt(modInput.value) || 0;
    const c = combatants[index];

    if (sign > 0) {
        c.hp = Math.min(c.maxHp, c.hp + mod);
        if (c.hp > 0 && c.exhaustion < 6) {
            c.isDead = false;
            c.deathSaves = {success: 0, failure: 0};
        }
    } else {
        if (c.tempHp > 0) {
            if (mod <= c.tempHp) {
                c.tempHp -= mod;
                mod = 0;
            } else {
                mod -= c.tempHp;
                c.tempHp = 0;
            }
        }

        const overkill = Math.floor(c.maxHp / 2);
        const deathThreshold = c.hp + overkill;

        if (mod > 0) {
            if (mod >= deathThreshold) {
                c.hp = 0;
                c.isDead = true;
                c.showNotes = true;
                const msg = `СМЕРТЬ ОТ МАССИВНОГО УРОНА (Получено ${mod} при пороге ${deathThreshold})`;
                if (!c.notes.includes("СМЕРТЬ ОТ МАССИВНОГО УРОНА")) {
                    c.notes = (msg + "\n" + c.notes).trim();
                }
            } else {
                c.hp = Math.max(0, c.hp - mod);
            }
        }
        if (c.hp <= 0) c.concentration = false;
    }
    sortAndRender();
};

window.nextTurn = () => {
    if (!combatants.length) return;
    let nextIndex = (currentTurnIndex + 1) % combatants.length;
    while (combatants[nextIndex].isDead && combatants.some(x => !x.isDead)) {
        nextIndex = (nextIndex + 1) % combatants.length;
    }
    currentTurnIndex = nextIndex;
    combatants.forEach(c => {
        if (c.concentration && c.concentrationCounter > 0) {
            c.concentrationCounter--;
            if (c.concentrationCounter === 0) c.concentration = false;
        }
    });
    saveCombatants();
    render();
};

window.prevTurn = () => {
    if (!combatants.length) return;
    let prevIndex = (currentTurnIndex - 1 + combatants.length) % combatants.length;
    while (combatants[prevIndex].isDead && combatants.some(x => !x.isDead)) {
        prevIndex = (prevIndex - 1 + combatants.length) % combatants.length;
    }
    currentTurnIndex = prevIndex;
    
    // Повышение счетчика при возврате хода с ограничениями
    combatants.forEach(c => {
        if (c.concentration) {
            c.concentrationCounter++;
            
            // Если счётчик превышает заданный максимум, сбрасываем концентрацию
            if (c.concentrationCounter > c.maxConcentration) {
                c.concentration = false;
                c.concentrationCounter = 0;
            }
        }
    });
    
    saveCombatants();
    render();
};

window.updateExhaustion = (i, level) => {
    const c = combatants[i];
    EXHAUSTION_EFFECTS.forEach(eff => { if(eff) c.notes = c.notes.replace(eff, "").trim(); });
    c.exhaustion = level;
    c.maxHp = (level >= 4) ? Math.floor(c.baseMaxHp / 2) : c.baseMaxHp;
    if (c.hp > c.maxHp) c.hp = c.maxHp;
    for(let j=1; j<=level; j++) {
        const eff = EXHAUSTION_EFFECTS[j];
        if(!c.notes.includes(eff)) c.notes = (c.notes.trim() + (c.notes.trim() ? '\n' : '') + eff).trim();
    }
    if(level === 6) { 
        c.isDead = true; c.hp = 0; 
        c.showNotes = true;
        const fadeMsg = `${c.name} угас от истощения`;
        if (!c.notes.includes(fadeMsg)) c.notes = (fadeMsg + "\n" + c.notes).trim();
    }
    c.notes = c.notes.replace(/\n{3,}/g, '\n\n').trim();
    saveCombatants();
    render();
};

window.toggleCondition = (i, cond) => {
    const c = combatants[i];
    const fullBlock = cond + "\n" + CONDITION_DB[cond].trim();
    if (c.conditions.includes(cond)) {
        c.conditions = c.conditions.filter(x => x !== cond);
        c.notes = c.notes.replace(fullBlock, "").trim();
    } else {
        c.conditions.push(cond);
        c.showNotes = true;
        c.notes = (c.notes.trim() + (c.notes.trim() ? '\n\n' : '') + fullBlock).trim();
    }
    c.notes = c.notes.replace(/\n{3,}/g, '\n\n').trim();
    saveCombatants();
    render();
};

window.updateProp = (i, p, v) => {
    combatants[i][p] = parseInt(v) || 0;
    if (p === 'initiative') combatants.sort((a, b) => b.initiative - a.initiative);
    saveCombatants();
    render();
};

window.setConcentration = (i) => {
    const c = combatants[i];
    if (!c.concentration) {
        const val = prompt("Длительность (раунды):", "10");
        const r = parseInt(val);
        if (r > 0) { 
            c.concentration = true; 
            c.concentrationCounter = r;
            c.maxConcentration = r; // Сохраняем исходное значение для лимита
        }
    } else { 
        c.concentration = false; 
    }
    saveCombatants();
    render();
};

window.toggleCondMenu = (i) => {
    const s = !combatants[i].showCondMenu;
    combatants.forEach(c => { c.showCondMenu = false; c.showExhaustMenu = false; });
    combatants[i].showCondMenu = s;
    render();
};

window.toggleExhaustMenu = (i) => {
    const s = !combatants[i].showExhaustMenu;
    combatants.forEach(c => { c.showCondMenu = false; c.showExhaustMenu = false; });
    combatants[i].showExhaustMenu = s;
    render();
};

window.toggleCollapse = (i) => { combatants[i].isCollapsed = !combatants[i].isCollapsed; saveCombatants(); render(); };
window.toggleNotes = (i) => { combatants[i].showNotes = !combatants[i].showNotes; saveCombatants(); render(); };
window.removeCombatant = (i) => { combatants.splice(i, 1); saveCombatants(); render(); };
window.editNotes = (i) => {
    const v = document.getElementById(`view-${i}`);
    const inp = document.getElementById(`input-${i}`);
    v.style.display = 'none'; inp.style.display = 'block'; inp.focus();
};
window.saveNotes = (i) => {
    const inp = document.getElementById(`input-${i}`);
    combatants[i].notes = inp.value;
    saveCombatants();
    render();
};
window.toggleInspiration = (i) => { combatants[i].inspiration = !combatants[i].inspiration; saveCombatants(); render(); };
window.editName = (i) => { 
    const n = prompt("Имя:", combatants[i].name); 
    if(n) { combatants[i].name = n; saveCombatants(); render(); } 
};
window.editMaxHp = (i) => {
    const n = prompt("Макс ХП:", combatants[i].maxHp);
    if(n) { combatants[i].baseMaxHp = parseInt(n); updateExhaustion(i, combatants[i].exhaustion); }
};
window.setTempHp = (i) => {
    const n = prompt("Временные ХП:", combatants[i].tempHp);
    if(n !== null) { combatants[i].tempHp = parseInt(n) || 0; saveCombatants(); render(); }
};
window.copyCombatant = (i) => {
    const copy = JSON.parse(JSON.stringify(combatants[i]));
    copy.id = Date.now();
    copy.name += " (копия)";
    combatants.push(copy);
    sortAndRender();
};

window.longRest = () => {
    if (confirm("Вы уверены, что хотите выполнить Долгий отдых для всех?")) {
        combatants.forEach((c, index) => {
            if (c.isDead) {
                return; // Пропускаем этого персонажа
            }
            c.hp = c.maxHp;
            c.tempHp = 0;
            c.isDead = false;
            c.deathSaves = { success: 0, failure: 0 };
            if (c.exhaustion > 0) {
                updateExhaustion(index, Math.max(0, c.exhaustion - 1));
            }
        });
        saveCombatants();
        render();
    }
};

window.exportCombatants = () => {
    const data = { combatants, currentTurnIndex };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnd-battle-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
};

window.fixLeadingZeros = (e) => {
    if (e.target.type === 'number') {
        e.target.value = e.target.value.replace(/^0+(?=\d)/, '');
    }
};

function sortAndRender() { combatants.sort((a, b) => b.initiative - a.initiative); saveCombatants(); render(); }
function getHpColor(p) { return p > 70 ? '#2ecc71' : p > 30 ? '#f1c40f' : '#e74c3c'; }

function saveCombatants() { 
    const data = { combatants, currentTurnIndex };
    localStorage.setItem('dnd_v5_data', JSON.stringify(data)); 
}

function loadCombatants() { 
    const d = localStorage.getItem('dnd_v5_data'); 
    if(d) {
        const parsed = JSON.parse(d);
        if (parsed.combatants) {
            combatants = parsed.combatants;
            currentTurnIndex = parsed.currentTurnIndex || 0;
        } else {
            combatants = parsed;
        }
    }
    render(); 
}

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
    else if (t === 'failure' && c.deathSaves.failure >= 3) { 
        c.isDead = true; 
        c.showNotes = true;
        const msg = `${c.name} умер от потери крови`;
        if(!c.notes.includes(msg)) c.notes = (msg + "\n" + c.notes).trim();
    }
    saveCombatants();
    render();
};