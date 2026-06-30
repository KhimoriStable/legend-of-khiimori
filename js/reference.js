const referenceContent = document.getElementById("reference-content");

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderReference(sections) {
    if (!referenceContent) return;

    if (!sections || sections.length === 0) {
        referenceContent.innerHTML = `
            <section class="section">
                <h2 class="section-title">Справочник пуст</h2>
                <div class="reference-grid">
                    <article class="reference-card">
                        <h3>Записей пока нет</h3>
                        <p>Когда появятся правила и заметки, они будут показаны здесь.</p>
                    </article>
                </div>
            </section>
        `;
        return;
    }

    referenceContent.innerHTML = sections.map(section => {
        const cards = section.items.map(item => {
            const importantClass = item.important ? " important" : "";

            return `
                <article class="reference-card${importantClass}">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.text)}</p>
                </article>
            `;
        }).join("");

        return `
            <section class="section">
                <h2 class="section-title">${escapeHtml(section.section)}</h2>
                <div class="reference-grid">
                    ${cards}
                </div>
            </section>
        `;
    }).join("");
}

fetch("data/reference.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Не удалось загрузить справочник");
        }

        return response.json();
    })
    .then(sections => {
        renderReference(sections);
    })
    .catch(error => {
        console.error(error);

        if (referenceContent) {
            referenceContent.innerHTML = `
                <section class="section">
                    <h2 class="section-title">Ошибка загрузки справочника</h2>
                    <div class="reference-grid">
                        <article class="reference-card important">
                            <h3>Ошибка</h3>
                            <p>Проверь файл data/reference.json и запусти сайт через Live Server.</p>
                        </article>
                    </div>
                </section>
            `;
        }
    });