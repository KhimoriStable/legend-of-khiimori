const chronicleList = document.getElementById("chronicle-list");

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderChronicle(entries) {
    if (!chronicleList) return;

    if (!entries || entries.length === 0) {
        chronicleList.innerHTML = `
            <article class="chronicle-entry">
                <h3>Записей пока нет</h3>
                <p>Когда в конюшне произойдёт важное событие, оно появится здесь.</p>
            </article>
        `;
        return;
    }

    chronicleList.innerHTML = entries.map(entry => {
        const importantClass = entry.important ? " important" : "";

        return `
            <article class="chronicle-entry${importantClass}">
                <div class="chronicle-date">${escapeHtml(entry.date)}</div>
                <h3>${escapeHtml(entry.title)}</h3>
                <p>${escapeHtml(entry.text)}</p>
                <span class="chronicle-tag">${escapeHtml(entry.tag)}</span>
            </article>
        `;
    }).join("");
}

fetch("data/chronicle.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Не удалось загрузить летопись");
        }

        return response.json();
    })
    .then(entries => {
        renderChronicle(entries);
    })
    .catch(error => {
        console.error(error);

        if (chronicleList) {
            chronicleList.innerHTML = `
                <article class="chronicle-entry important">
                    <h3>Ошибка загрузки летописи</h3>
                    <p>Проверь файл data/chronicle.json и запусти сайт через Live Server.</p>
                    <span class="chronicle-tag">Ошибка</span>
                </article>
            `;
        }
    });