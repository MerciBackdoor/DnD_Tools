const form = document.getElementById('addForm');
    const combatantsDiv = document.getElementById('combatants');
    let combatants = [];
    let currentTurnIndex = 0;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      addCombatant();
    });

    function addCombatant() {
      const name = document.getElementById('name').value;
      const ac = parseInt(document.getElementById('ac').value);
      const maxHp = parseInt(document.getElementById('maxHp').value);
      let initiativeInput = document.getElementById('initiative').value;
      const initiative = initiativeInput === '' ? 0 : parseInt(initiativeInput);
      const hpInput = document.getElementById('hp').value;
      let hp = hpInput === '' ? maxHp : parseInt(hpInput);
      hp = Math.min(hp, maxHp);

      combatants.push({ 
        name, 
        ac, 
        hp, 
        maxHp, 
        initiative,
        deathSaves: { success: 0, failure: 0 },
        isDead: false,
        concentration: false,
        concentrationCounter: 0
      });
      
      combatants.sort((a, b) => b.initiative - a.initiative);
      form.reset();
      renderCombatants();
    }

    function getHealthColor(percent) {
      if (percent > 80) return 'limegreen';
      if (percent > 60) return 'yellowgreen';
      if (percent > 40) return 'gold';
      if (percent > 20) return 'orange';
      return 'red';
    }

    function applyHpChange(index, type) {
      const input = document.querySelector(`.combatant:nth-child(${index + 1}) .hp-input`);
      const value = parseInt(input.value) || 0;
      
      if (type === 'damage') {
        combatants[index].hp = Math.max(0, combatants[index].hp - value);
      } else {
        combatants[index].hp = Math.min(combatants[index].maxHp, combatants[index].hp + value);
      }

      if (combatants[index].hp <= 0) {
        combatants[index].concentration = false;
        combatants[index].concentrationCounter = 0;
      }

      input.value = '';
      renderCombatants();
    }

    function handleDeathSave(index, type, saveIndex) {
      const c = combatants[index];
      if (c.isDead || c.hp > 0) return;
      if (type === 'success') {
        if (saveIndex === c.deathSaves.success) {
          c.deathSaves.success++;
          if (c.deathSaves.success === 3) {
            c.hp = 1;
            c.deathSaves = { success: 0, failure: 0 };
          }
        }
      } else {
        if (saveIndex === c.deathSaves.failure) {
          c.deathSaves.failure++;
          if (c.deathSaves.failure === 3) {
            c.isDead = true;
            c.concentration = false;
            c.concentrationCounter = 0;
          }
        }
      }
      renderCombatants();
    }

    function updateAC(index, value) {
      const val = parseInt(value);
      if (!isNaN(val) && val >= 0) {
        combatants[index].ac = val;
        renderCombatants();
      }
    }

    function updateInitiative(index, value) {
      const val = parseInt(value);
      if (!isNaN(val)) {
        combatants[index].initiative = val;
        combatants.sort((a, b) => b.initiative - a.initiative);
        renderCombatants();
      }
    }

    function toggleConcentration(index, checked) {
      const c = combatants[index];
      c.concentration = checked;
      if (checked && c.concentrationCounter === 0) {
        c.concentrationCounter = 10;
      }
      if (!checked) {
        c.concentrationCounter = 0;
      }
      renderCombatants();
    }

    function updateConcentrationCounter(index, value) {
      const val = Math.max(0, parseInt(value) || 0);
      combatants[index].concentrationCounter = val;
      if (val === 0) {
        combatants[index].concentration = false;
      }
      renderCombatants();
    }

    function nextTurn() {
      if (combatants.length === 0) return;
      currentTurnIndex = (currentTurnIndex + 1) % combatants.length;
      combatants.forEach(c => {
        if (c.concentration) {
          c.concentrationCounter = Math.max(0, c.concentrationCounter - 1);
          if (c.concentrationCounter === 0) {
            c.concentration = false;
          }
        }
      });
      renderCombatants();
    }

    function prevTurn() {
      if (combatants.length === 0) return;
      currentTurnIndex = (currentTurnIndex - 1 + combatants.length) % combatants.length;
      combatants.forEach(c => {
        if (c.concentration) {
          c.concentrationCounter += 1;
        }
      });
      renderCombatants();
    }

    function removeCombatant(index) {
      combatants.splice(index, 1);
      if (currentTurnIndex >= combatants.length) {
        currentTurnIndex = Math.max(0, combatants.length - 1);
      }
      renderCombatants();
    }

    function copyCombatant(index) {
      const original = combatants[index];
      // Find all combatants with the same base name
      const baseName = original.name.replace(/\s\d+$/, '');
      const sameBase = combatants.filter(c => c.name.startsWith(baseName));
      // Find the next available number
      let maxNum = 0;
      sameBase.forEach(c => {
        const match = c.name.match(/\s(\d+)$/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
      });
      const newName = `${baseName} ${maxNum + 1}`;
      const copy = JSON.parse(JSON.stringify(original));
      copy.name = newName;
      combatants.splice(index + 1, 0, copy);
      renderCombatants();
      saveCombatants();
    }

    function renderCombatants() {
      combatantsDiv.innerHTML = '';
      if (combatants.length === 0) {
        combatantsDiv.innerHTML = '<p style="text-align: center;">Да начнётся битва!</p>';
        return;
      }
      combatants.forEach((c, index) => {
        const div = document.createElement('div');
        div.className = 'combatant';
        if (c.isDead) div.classList.add('dead');
        if (index === currentTurnIndex) div.classList.add('active');
        if (c.concentration) div.classList.add('concentrating');

        const hpPercent = Math.round((c.hp / c.maxHp) * 100);
        const hpColor = getHealthColor(hpPercent);

        let healthText = `${c.hp} / ${c.maxHp}`;
        let deathSavesHTML = '';
        if (c.hp <= 0 && !c.isDead) {
          healthText = 'Спасброски';
          deathSavesHTML = `
            <div class="death-saves-container">
              <div class="death-saves-group">
                <span class="death-save-label">П</span>
                ${Array(3).fill().map((_, i) => `<div class="death-save failure ${i < c.deathSaves.failure ? 'marked' : ''}" onclick="handleDeathSave(${index}, 'failure', ${i})"></div>`).join('')}
              </div>
              <div class="death-saves-group">
                <span class="death-save-label">У</span>
                ${Array(3).fill().map((_, i) => `<div class="death-save success ${i < c.deathSaves.success ? 'marked' : ''}" onclick="handleDeathSave(${index}, 'success', ${i})"></div>`).join('')}
              </div>
            </div>`;
        }

        div.innerHTML = `
          <div class="combatant-name">${c.name}</div>
          <div class="ac-value">
            КД: <input type="number" class="ac-input" value="${c.ac}" onchange="updateAC(${index}, this.value)">
          </div>
          <div class="hp-control">
            <button class="hp-button damage-btn" onclick="applyHpChange(${index}, 'damage')">Урон</button>
            <input type="number" class="hp-input" placeholder="0" min="0">
            <button class="hp-button heal-btn" onclick="applyHpChange(${index}, 'heal')">Лечение</button>
          </div>
          <div class="initiative-value">
            Инициатива:
            <input type="number" class="hp-input" value="${c.initiative}" onchange="updateInitiative(${index}, this.value)">
          </div>
          <div class="concentration-label">
            <input type="checkbox" class="concentration-checkbox" ${c.concentration ? 'checked' : ''} onchange="toggleConcentration(${index}, this.checked)">
            <label>Концентрация</label>
            <input type="number" class="concentration-counter" min="0" value="${c.concentrationCounter}" onchange="updateConcentrationCounter(${index}, this.value)">
          </div>
          <div class="health-bar">
            <div class="health-text">${healthText}</div>
            <div class="health-bar-inner" style="width: ${Math.min(hpPercent, 100)}%; background: ${hpColor};"></div>
            ${deathSavesHTML}
          </div>
          <button class="remove-btn" onclick="removeCombatant(${index})">Удалить</button>
          <button class="copy-btn" onclick="copyCombatant(${index})">Копировать</button>
        `;
        combatantsDiv.appendChild(div);
      });
    }

    renderCombatants();
    window.handleDeathSave = handleDeathSave;
    window.applyHpChange = applyHpChange;
    window.removeCombatant = removeCombatant;
    window.nextTurn = nextTurn;
    window.prevTurn = prevTurn;
    window.addCombatant = addCombatant;
    window.updateAC = updateAC;
    window.updateInitiative = updateInitiative;
    window.toggleConcentration = toggleConcentration;
    window.updateConcentrationCounter = updateConcentrationCounter;
    window.copyCombatant = copyCombatant;

    // Импорт данных
document.getElementById('importFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data)) {
        combatants = combatants.concat(data); // <-- Now it ADDS!
        renderCombatants();
        saveCombatants();
      }
    } catch (err) {
      alert('Ошибка при импорте данных: ' + err.message);
    }
  };
  reader.readAsText(file);
});

document.getElementById('load-btn').addEventListener('click', function () {
  const fileInput = document.getElementById('importFile');
  const file = fileInput.files[0];
  if (!file) {
    alert('Выберите файл для загрузки!');
    return;
  }
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data)) {
        combatants = combatants.concat(data);
        renderCombatants();
        saveCombatants();
      } else {
        alert('Файл должен содержать массив врагов.');
      }
    } catch (err) {
      alert('Ошибка при загрузке: ' + err.message);
    }
  };
  reader.readAsText(file);
});

// Экспорт данных
function exportCombatants() {
  const blob = new Blob([JSON.stringify(combatants, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'combatants.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Автосохранение в localStorage
function saveCombatants() {
  localStorage.setItem('combatantsData', JSON.stringify(combatants));
  localStorage.setItem('turnIndex', currentTurnIndex);
}

// Загрузка при старте
function loadCombatants() {
  const saved = localStorage.getItem('combatantsData');
  const index = localStorage.getItem('turnIndex');
  if (saved) {
    combatants = JSON.parse(saved);
    currentTurnIndex = parseInt(index) || 0;
    renderCombatants();
  }
}

// Обновите функции, чтобы вызывать saveCombatants
const originalAddCombatant = addCombatant;
addCombatant = function () {
  originalAddCombatant();
  saveCombatants();
};

const originalApplyHpChange = applyHpChange;
applyHpChange = function (index, type) {
  originalApplyHpChange(index, type);
  saveCombatants();
};

const originalUpdateAC = updateAC;
updateAC = function (index, value) {
  originalUpdateAC(index, value);
  saveCombatants();
};

const originalUpdateInitiative = updateInitiative;
updateInitiative = function (index, value) {
  originalUpdateInitiative(index, value);
  saveCombatants();
};

const originalToggleConcentration = toggleConcentration;
toggleConcentration = function (index, checked) {
  originalToggleConcentration(index, checked);
  saveCombatants();
};

const originalUpdateConcentrationCounter = updateConcentrationCounter;
updateConcentrationCounter = function (index, value) {
  originalUpdateConcentrationCounter(index, value);
  saveCombatants();
};

const originalRemoveCombatant = removeCombatant;
removeCombatant = function (index) {
  originalRemoveCombatant(index);
  saveCombatants();
};

const originalNextTurn = nextTurn;
nextTurn = function () {
  originalNextTurn();
  saveCombatants();
};

const originalPrevTurn = prevTurn;
prevTurn = function () {
  originalPrevTurn();
  saveCombatants();
};

// Загрузка при старте страницы
window.addEventListener('DOMContentLoaded', loadCombatants);
