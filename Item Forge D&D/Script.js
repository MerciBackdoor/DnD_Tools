let lastSaveHandle = null; // Переменная для хранения последнего пути сохранения

async function saveItemToFile(item) {
  try {
    let handle;

    // Если есть последний путь сохранения, используем его
    if (lastSaveHandle) {
      handle = lastSaveHandle;
    } else {
      const options = {
        suggestedName: `${item.name}.json`, // Имя файла по умолчанию
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      };

      handle = await window.showSaveFilePicker(options);
    }

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(item, null, 2));
    await writable.close();

    // Сохраняем последний путь
    lastSaveHandle = handle;

    alert('Файл успешно сохранён!');
  } catch (error) {
    console.error('Ошибка при сохранении файла:', error);
    alert('Не удалось сохранить файл.');
  }
}

// Переменная для хранения текущего отображаемого предмета
let currentDisplayedItem = null;

// Функция для отображения предмета
function displayItem(item) {
  currentDisplayedItem = item; // Сохраняем текущий предмет
  const display = document.getElementById('item-display');

  // Format text for bold (**text**) and italics (*text*)
  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italics
  };

  display.innerHTML = `
    <h2>${formatText(item.name)}</h2>
    <p><strong>Стоимость:</strong> ${formatText(item.cost)}</p>
    <p class="item-attributes">
      <strong>Редкость:</strong> ${formatText(item.rarity)} |
      <strong>Тип:</strong> ${formatText(item.type)} |
      <strong>Настройка:</strong> ${formatText(item.custom)} |
      <strong>Расходуемый:</strong> ${formatText(item.consumable)} |
      <strong>Заряды:</strong> ${formatText(item.charges)} |
      <strong>Проклятие:</strong> ${formatText(item.curse)}
    </p>
    <p><strong>Описание внешнего вида:</strong> ${formatText(item.appearance)}</p>
    <p><strong>Эффект:</strong> ${formatText(item.effect)}</p>
    <p><strong>Описание проклятия:</strong> ${formatText(item.curseDescription || 'Нет')}</p>
    <p class="author"><strong>Автор:</strong> ${formatText(item.author || 'Не указан')}</p>
    <button id="save-item-button">Сохранить</button>
  `;

  // Добавляем обработчик для кнопки "Сохранить"
  const saveButton = document.getElementById('save-item-button');
  saveButton.style.display = 'block'; // Убедимся, что кнопка видима
  saveButton.onclick = async () => {
    if (currentDisplayedItem) {
      await saveItemToFile(currentDisplayedItem);
    }
  };
}

// Измените существующую функцию для сохранения предмета
document.getElementById('item-form').addEventListener('submit', async function (e) {
  e.preventDefault(); // Prevent default form submission behavior
  const form = e.target;

  // Create an item object from form inputs
  const item = {
    name: form.name.value,
    rarity: form.rarity.value,
    type: form.type.value,
    custom: form.custom.value,
    consumable: form.consumable.value,
    charges: form.charges.value,
    curse: form.curse.value,
    appearance: form.appearance.value,
    effect: form.effect.value,
    curseDescription: form.curseDescription.value,
    author: form.author.value,
    cost: getCost(form.rarity.value),
  };

  // Add the item to the list
  addItemToList(item);

  // Save the updated list to localStorage
  saveToLocalStorage();

  // Reset the form for the next item
  form.reset();
  document.getElementById('curse-description-label').style.display = 'none'; // Hide curse description field
});

document.getElementById('item-loader').addEventListener('change', function (e) {
  const files = e.target.files; // Get all selected files
  if (!files.length) return;

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const item = JSON.parse(event.target.result);
        validateItem(item); // Ensure the item has all required fields
        addItemToList(item); // Add the item to the list
      } catch (error) {
        alert(`Ошибка при загрузке файла "${file.name}": неверный формат JSON.`);
      }
    };
    reader.readAsText(file);
  });

  // Clear the file input after processing to allow re-uploading the same files
  e.target.value = '';
});

document.getElementById('upload-items-button').addEventListener('click', function () {
  const fileInput = document.getElementById('item-loader');
  const files = fileInput.files; // Get all selected files
  if (!files.length) {
    alert('Пожалуйста, выберите файлы для загрузки.');
    return;
  }

  // Process each file independently
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const item = JSON.parse(event.target.result);
        validateItem(item); // Ensure the item has all required fields
        addItemToList(item); // Add the item to the list
      } catch (error) {
        alert(`Ошибка при загрузке файла "${file.name}": неверный формат JSON.`);
      }
    };
    reader.readAsText(file);
  });

  // Clear the file input after processing to allow re-uploading the same files
  fileInput.value = '';
});

// Toggle visibility of "Описание проклятия" based on "Проклятие" value
document.getElementById('curse-select').addEventListener('change', function (e) {
  const curseDescriptionLabel = document.getElementById('curse-description-label');
  if (e.target.value === 'Да') {
    curseDescriptionLabel.style.display = 'flex'; // Отображаем элемент
  } else {
    curseDescriptionLabel.style.display = 'none'; // Скрываем элемент
  }
});

// Save form state and item list to localStorage
function saveToLocalStorage() {
  const form = document.getElementById('item-form');
  const formData = new FormData(form);
  const formState = {};
  formData.forEach((value, key) => {
    formState[key] = value;
  });

  // Сохраняем состояние формы
  localStorage.setItem('formState', JSON.stringify(formState));

  // Сохраняем список предметов
  const itemList = Array.from(document.getElementById('item-list').children).map(li => li.dataset.item);
  localStorage.setItem('itemList', JSON.stringify(itemList));
}

// Save form state to localStorage whenever the form changes
document.getElementById('item-form').addEventListener('input', function () {
  const form = document.getElementById('item-form');
  const formData = new FormData(form);
  const formState = {};

  formData.forEach((value, key) => {
    formState[key] = value;
  });

  localStorage.setItem('formState', JSON.stringify(formState));
});

// Restore form state and item list from localStorage
function loadFromLocalStorage() {
  const formState = JSON.parse(localStorage.getItem('formState'));
  const itemList = JSON.parse(localStorage.getItem('itemList'));

  // Clear the existing item list to prevent duplication
  const list = document.getElementById('item-list');
  list.innerHTML = ''; // Clear all existing items

  // Restore form state
  if (formState) {
    const form = document.getElementById('item-form');
    Object.keys(formState).forEach(key => {
      if (form[key]) {
        form[key].value = formState[key];
      }
    });

    // Trigger event to update visibility of "Описание проклятия"
    document.getElementById('curse-select').dispatchEvent(new Event('change'));
  }

  // Restore item list
  if (itemList) {
    itemList.forEach(itemJSON => {
      const item = JSON.parse(itemJSON);
      addItemToList(item);
    });
  }
}

// Restore form state from localStorage on page load
document.addEventListener('DOMContentLoaded', function () {
  const savedFormState = localStorage.getItem('formState');
  if (savedFormState) {
    const formState = JSON.parse(savedFormState);
    const form = document.getElementById('item-form');

    Object.keys(formState).forEach(key => {
      if (form[key]) {
        form[key].value = formState[key];
      }
    });

    // Trigger the "change" event for the curse field to update visibility
    document.getElementById('curse-select').dispatchEvent(new Event('change'));
  }
});

// Update localStorage whenever the form changes
document.getElementById('item-form').addEventListener('input', saveToLocalStorage);

// Save item list to localStorage when a new item is added
function addItemToList(item) {
  const list = document.getElementById('item-list');

  // Create a new list item
  const li = document.createElement('li');
  li.dataset.item = JSON.stringify(item); // Store item data in a dataset attribute

  // Create a container for the item's name and rarity
  const textContainer = document.createElement('div');
  textContainer.style.flexGrow = '1';

  // Item name
  const itemName = document.createElement('span');
  itemName.textContent = item.name;
  itemName.style.display = 'block';

  // Item rarity
  const itemRarity = document.createElement('span');
  itemRarity.textContent = `[${item.rarity}]`;
  itemRarity.style.fontSize = '0.9em';

  // Apply rarity class for styling
  switch (item.rarity) {
    case 'Обычный':
    case 'Редкость не указана':
      itemRarity.classList.add('rarity-common');
      break;
    case 'Необычный':
      itemRarity.classList.add('rarity-uncommon');
      break;
    case 'Редкий':
      itemRarity.classList.add('rarity-rare');
      break;
    case 'Очень редкий':
      itemRarity.classList.add('rarity-very-rare');
      break;
    case 'Легендарный':
      itemRarity.classList.add('rarity-legendary');
      break;
    case 'Артефакт':
      itemRarity.classList.add('rarity-artifact');
      break;
    case 'Редкость варьируется':
      itemRarity.classList.add('rarity-variable');
      break;
    default:
      itemRarity.classList.add('rarity-unknown');
  }

  textContainer.appendChild(itemName);
  textContainer.appendChild(itemRarity);

  // Create a container for action buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '5px';

  // Edit button
  const editButton = document.createElement('button');
  editButton.innerHTML = '&#9881;';
  editButton.addEventListener('click', (e) => {
    e.stopPropagation();
    editItem(item, li);
  });

  // Delete button
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '&#10006;';
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteItem(li);
  });

  buttonContainer.appendChild(editButton);
  buttonContainer.appendChild(deleteButton);

  li.appendChild(textContainer);
  li.appendChild(buttonContainer);

  li.addEventListener('click', () => displayItem(item));
  list.appendChild(li);

  // Save the updated list to localStorage
  saveToLocalStorage();
}

// Edit an existing item
function editItem(item, listItem) {
  const form = document.getElementById('item-form');
  Object.keys(item).forEach(key => {
    if (form[key]) {
      form[key].value = item[key];
    }
  });

  // Remove the item from the list to avoid duplicates
  listItem.remove();
  saveToLocalStorage();
}

// Delete an item from the list with double confirmation
function deleteItem(listItem) {
  const confirmFirst = confirm('Вы уверены, что хотите удалить этот предмет?');
  if (confirmFirst) {
    const confirmSecond = confirm('Это действие нельзя отменить. Удалить предмет?');
    if (confirmSecond) {
      listItem.remove();
      saveToLocalStorage(); // Save changes to localStorage
    }
  }
}

// Initialize visibility on page load
document.addEventListener('DOMContentLoaded', function () {
  loadFromLocalStorage();
  const curseSelect = document.getElementById('curse-select');
  const curseDescriptionLabel = document.getElementById('curse-description-label');
  if (curseSelect.value === 'Нет') {
    curseDescriptionLabel.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', function () {
  loadFromLocalStorage();
});

document.addEventListener('DOMContentLoaded', function () {
  loadFromLocalStorage();
});

document.getElementById('clear-form-button').addEventListener('click', function () {
  const confirmFirst = confirm('Вы уверены, что хотите очистить текущие данные формы?');
  if (confirmFirst) {
    const confirmSecond = confirm('Это действие нельзя отменить. Очистить форму?');
    if (confirmSecond) {
      const form = document.getElementById('item-form');
      form.reset(); // Сбрасываем все поля формы
      document.getElementById('curse-description-label').style.display = 'none'; // Скрываем описание проклятия

      // Clear the saved form state from localStorage
      localStorage.removeItem('formState');
    }
  }
});

function getCost(rarity) {
  switch (rarity) {
    case 'Обычный': return '50-100 золотых монет';
    case 'Необычный': return '101-500 золотых монет';
    case 'Редкий': return '501-5000 золотых монет';
    case 'Очень редкий': return '5001-50000 золотых монет';
    case 'Легендарный': return '50001-250000 золотых монет';
    case 'Артефакт': return '250001+ (невозможно купить)';
    default: return 'Цена не указана';
  }
}

function formatText(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
             .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

function validateItem(item) {
  const requiredFields = ['name', 'rarity', 'type', 'custom', 'consumable', 'charges', 'curse', 'appearance', 'effect', 'author', 'cost'];
  for (const field of requiredFields) {
    if (!item.hasOwnProperty(field) || !item[field]) {
      throw new Error(`Отсутствует обязательное поле: ${field}`);
    }
  }
}

