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

function normalizeSearchValue(value) {
    return String(value ?? "").toLowerCase().trim();
}

function getAllReferenceEntries(sections) {
    return sections.flatMap((section, sectionIndex) => {
        return (section.items ?? []).map(item => ({
            sectionIndex,
            sectionTitle: section.section,
            title: item.title,
            text: item.text,
            important: item.important
        }));
    });
}

function renderSearchResults(resultsContainer, entries, query) {
    if (!resultsContainer) return;

    if (!query) {
        resultsContainer.innerHTML = "";
        return;
    }

    const normalizedQuery = normalizeSearchValue(query);

    const matches = entries.filter(entry => {
        const haystack = normalizeSearchValue(`
            ${entry.sectionTitle}
            ${entry.title}
            ${entry.text}
        `);

        return haystack.includes(normalizedQuery);
    });

    if (matches.length === 0) {
        resultsContainer.innerHTML = `
            <div class="reference-search-empty">
                Ничего не найдено. Попробуй другое слово: например “жара”, “горы”, “трусость”, “выдержка”.
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = `
        <h3 class="reference-search-title">Найдено: ${matches.length}</h3>

        <div class="reference-search-list">
            ${matches.map(entry => `
                <a class="reference-search-result" href="reference.html?section=${entry.sectionIndex}">
                    <span class="reference-result-section">${escapeHtml(entry.sectionTitle)}</span>
                    <strong>${escapeHtml(entry.title)}</strong>
                    <p>${escapeHtml(entry.text)}</p>
                    <span class="reference-open-link">Открыть раздел →</span>
                </a>
            `).join("")}
        </div>
    `;
}

function setupReferenceSearch(sections) {
    const searchInput = document.getElementById("reference-search-input");
    const resultsContainer = document.getElementById("reference-search-results");

    if (!searchInput || !resultsContainer) return;

    const entries = getAllReferenceEntries(sections);

    searchInput.addEventListener("input", () => {
        renderSearchResults(resultsContainer, entries, searchInput.value);
    });
}

function renderReferenceHome(sections) {
    if (!referenceContent) return;

    referenceContent.innerHTML = `
        <section class="section">
            <h2 class="section-title">Разделы справочника</h2>

            <div class="reference-search-panel">
                <label for="reference-search-input">Поиск по справочнику</label>

                <input
                    id="reference-search-input"
                    class="reference-search-input"
                    type="search"
                    placeholder="Например: жара, трусость, горы, выдержка, вьючная..."
                    autocomplete="off"
                >

                <div id="reference-search-results" class="reference-search-results"></div>
            </div>

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

    setupReferenceSearch(sections);
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