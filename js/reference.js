const referenceContent = document.getElementById("reference-content");

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getSectionIndexFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");

    if (section === null) {
        return null;
    }

    const index = Number(section);

    if (!Number.isInteger(index)) {
        return null;
    }

    return index;
}

function renderReferenceHome(sections) {
    if (!referenceContent) return;

    referenceContent.innerHTML = `
        <section class="section">
            <h2 class="section-title">Разделы справочника</h2>

            <div class="reference-grid reference-index-grid">
                ${sections.map((section, index) => `
                    <a class="reference-card reference-section-link" href="reference.html?section=${index}">
                        <h3>${escapeHtml(section.section)}</h3>
                        <p>${escapeHtml(section.items?.length ?? 0)} записей в разделе.</p>
                        <span class="reference-open-link">Открыть раздел →</span>
                    </a>
                `).join("")}
            </div>
        </section>
    `;
}

function renderReferenceSection(sections, sectionIndex) {
    if (!referenceContent) return;

    const section = sections[sectionIndex];

    if (!section) {
        referenceContent.innerHTML = `
            <section class="section">
                <a class="reference-back-link" href="reference.html">← Назад к разделам</a>
                <h2 class="section-title">Раздел не найден</h2>

                <div class="reference-grid">
                    <article class="reference-card important">
                        <h3>Ошибка</h3>
                        <p>Такого раздела в справочнике нет. Вернись к списку разделов.</p>
                    </article>
                </div>
            </section>
        `;
        return;
    }

    const cards = section.items.map(item => {
        const importantClass = item.important ? " important" : "";

        return `
            <article class="reference-card${importantClass}">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
            </article>
        `;
    }).join("");

    referenceContent.innerHTML = `
        <section class="section">
            <a class="reference-back-link" href="reference.html">← Назад к разделам</a>

            <h2 class="section-title">${escapeHtml(section.section)}</h2>

            <div class="reference-grid">
                ${cards}
            </div>
        </section>
    `;
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

    const sectionIndex = getSectionIndexFromUrl();

    if (sectionIndex === null) {
        renderReferenceHome(sections);
        return;
    }

    renderReferenceSection(sections, sectionIndex);
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