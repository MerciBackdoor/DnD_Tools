# Картограф D&D

**Картограф D&D** — это веб-приложение для создания и редактирования карт для настольных ролевых игр (Dungeons & Dragons и других). Программа позволяет интерактивно строить поле, размещать стены, двери, окна и различные объекты окружения.

---

## Возможности

- Гибкая настройка размеров сетки (ширина и высота в клетках)
- Выбор типа поверхности клетки (камень, тень, доски, вода, лава, земля, трава)
- Добавление стен, дверей и окон на границы клеток
- Размещение объектов окружения: сундуки, ящики, столы, стулья, скамьи, бочки, колонны, факелы, деревья, камни и др.
- Удаление элементов (режим удаления)
- Масштабирование карты (zoom)
- Сохранение и загрузка карты (используется localStorage браузера)
- Очистка поля

---

## Как использовать

1. Откройте файл **Map Builder 1.0.html** в браузере.
2. Настройте размеры сетки и нажмите **Создать поле**.
3. Выберите инструмент (поверхность, стены/проёмы, окружение) и кликните по клетке для размещения.
4. Для удаления элементов нажмите кнопку **Удалять** и кликните по нужному объекту или клетке.
5. Для сохранения карты нажмите **Сохранить**. Для загрузки — **Загрузить**.
6. Для масштабирования используйте кнопки "+" и "-" в правом верхнем углу.
7. Для очистки поля нажмите **Очистить поле**.

---

## Структура проекта

- **Map Builder 1.0.html** — основной HTML-файл приложения
- **styles.css** — стилизация интерфейса и элементов карты
- **scripts.js** — вся логика работы редактора

---

## Требования

- Современный браузер (Chrome, Firefox, Edge, Opera)
- Интернет для загрузки шрифта и фоновых текстур

---

## Автор

Программа создана для личного использования в настольных играх.

---

**Примечание:**  
Все данные сохраняются только в браузере пользователя (localStorage). Для переноса карты на другое устройство используйте экспорт/импорт данных вручную через localStorage.