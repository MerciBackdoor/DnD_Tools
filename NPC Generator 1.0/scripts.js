let squad = [null, null, null];

window.onload = function() {
    const savedSquad = localStorage.getItem('npcSquad');
    if (savedSquad) {
        try {
            squad = JSON.parse(savedSquad);
            renderSquad();
        } catch (e) {
            console.error("Ошибка при чтении сохраненного отряда:", e);
        }
    }
};

function generateNPC() {
    if (typeof npcData === 'undefined') {
        alert("Ошибка: файл npc_data.js не загружен.");
        return;
    }

    const selectedGender = document.getElementById('filter-gender').value;
    const selectedRace = document.getElementById('filter-race').value;

    let gender = selectedGender;
    if (!gender) {
        gender = npcData.genders[Math.floor(Math.random() * npcData.genders.length)];
    }

    let race = selectedRace;
    if (!race) {
        race = npcData.races[Math.floor(Math.random() * npcData.races.length)];
    }

    const traits = npcData.traits;
    const namesSource = gender === 'Мужчина' ? npcData.maleNames : npcData.femaleNames;

    const name = namesSource[Math.floor(Math.random() * namesSource.length)];
    const trait = traits[Math.floor(Math.random() * traits.length)];

    const newNpc = {
        name: name,
        gender: gender,
        race: race,
        trait: trait
    };

    let targetIndex = 0;

    if (squad[0] === null) {
        targetIndex = 0;
        squad[0] = newNpc;
    } else if (squad[1] === null) {
        targetIndex = 1;
        squad[1] = newNpc;
    } else if (squad[2] === null) {
        targetIndex = 2;
        squad[2] = newNpc;
    } else {
        if (typeof window.replaceIndex === 'undefined') {
            window.replaceIndex = 0; 
        }

        targetIndex = window.replaceIndex;
        squad[window.replaceIndex] = newNpc;
        window.replaceIndex = (window.replaceIndex + 1) % 3;
    }

    renderSquad();
    localStorage.setItem('npcSquad', JSON.stringify(squad));

    const slotElement = document.getElementById(`npc-slot-${targetIndex + 1}`);
    if (slotElement) {
        slotElement.classList.remove('flash');
        void slotElement.offsetWidth;
        slotElement.classList.add('flash');
    }
}

function clearAllSlots() {
    squad = [null, null, null];
    renderSquad();
    localStorage.setItem('npcSquad', JSON.stringify(squad));
}

function renderSquad() {
    for (let i = 0; i < 3; i++) {
        const slotElement = document.getElementById(`npc-slot-${i + 1}`);
        if (!slotElement) continue;

        if (squad[i] !== null) {
            slotElement.innerHTML = `
                <span class="npc-name" title="${squad[i].name}">${squad[i].name}</span>
                <span class="npc-meta">${squad[i].gender}, ${squad[i].race}</span>
                <div class="npc-trait"><strong>Особенность:</strong> ${squad[i].trait}</div>
            `;
            slotElement.classList.remove('empty');
        } else {
            slotElement.innerHTML = `<p class="placeholder">🎲</p>`;
            slotElement.classList.add('empty');
        }
    }
}