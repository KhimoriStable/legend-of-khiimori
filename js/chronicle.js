const chronicleList = document.getElementById("chronicle-list");

const ENTRIES_PER_PAGE = 5;

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderEntry(entry) {
    return `
        <article class="chronicle-timeline-entry">
            <div class="chronicle-marker"></div>

            <div class="chronicle-timeline-card">
                <div class="chronicle-entry-top">
                    <span class="chronicle-date">${escapeHtml(entry.date)}</span>
                    <span class="chronicle-tag">${escapeHtml(entry.tag)}</span>
                </div>

                <h3>${escapeHtml(entry.title)}</h3>

                <p>${escapeHtml(entry.text)}</p>
            </div>
        </article>
    `;
}

function renderPagination(totalPages, currentPage) {
    if (totalPages <= 1) {
        return "";
    }

    const pageButtons = Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        const activeClass = page === currentPage ? " active" : "";

        return `
            <button class="chronicle-page-button${activeClass}" data-page="${page}">
                ${page}
            </button>
        `;
    }).join("");

    return `
        <div class="chronicle-pagination">
            <button
                class="chronicle-page-button"
                data-page="${currentPage - 1}"
                ${currentPage === 1 ? "disabled" : ""}
            >
                ← Назад
            </button>

            <div class="chronicle-page-numbers">
                ${pageButtons}
            </div>

            <button
                class="chronicle-page-button"
                data-page="${currentPage + 1}"
                ${currentPage === totalPages ? "disabled" : ""}
            >
                Вперёд →
            </button>
        </div>
    `;
}

function setupPagination(entries) {
    const buttons = document.querySelectorAll(".chronicle-page-button");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const page = Number(button.dataset.page);

            if (!Number.isInteger(page)) return;

            renderChronicle(entries, page);

            const timelineSection = document.querySelector(".chronicle-timeline-section");

            if (timelineSection) {
                timelineSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
}

function renderChronicle(entries, page = 1) {
    if (!chronicleList) return;

    if (!entries || entries.length === 0) {
        chronicleList.innerHTML = `
            <section class="chronicle-empty">
                <h3>Записей пока нет</h3>
                <p>Когда в конюшне произойдёт важное событие, оно появится здесь.</p>
            </section>
        `;
        return;
    }

    const importantEntries = entries.filter(entry => entry.important);
    const normalEntries = entries.filter(entry => !entry.important);

    const totalPages = Math.max(1, Math.ceil(normalEntries.length / ENTRIES_PER_PAGE));
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
    const endIndex = startIndex + ENTRIES_PER_PAGE;
    const visibleEntries = normalEntries.slice(startIndex, endIndex);

    chronicleList.innerHTML = `
        <div class="chronicle-layout">

            <section class="chronicle-intro-card">
                <p class="chronicle-kicker">Летопись конюшни</p>
                <h3>История развития Khiimori Stable</h3>
                <p>
                    Здесь собраны важные решения, изменения сайта, правила разведения,
                    обновления справочника и события племенной программы.
                </p>
            </section>

            ${currentPage === 1 && importantEntries.length > 0 ? `
                <section class="chronicle-important-section">
                    <h3 class="chronicle-block-title">⭐ Важные события</h3>

                    <div class="chronicle-important-grid">
                        ${importantEntries.map(entry => `
                            <article class="chronicle-featured-card">
                                <div class="chronicle-entry-top">
                                    <span class="chronicle-date">${escapeHtml(entry.date)}</span>
                                    <span class="chronicle-tag">${escapeHtml(entry.tag)}</span>
                                </div>

                                <h3>${escapeHtml(entry.title)}</h3>
                                <p>${escapeHtml(entry.text)}</p>
                            </article>
                        `).join("")}
                    </div>
                </section>
            ` : ""}

            <section class="chronicle-timeline-section">
                <div class="chronicle-timeline-header">
                    <h3 class="chronicle-block-title">📜 Лента событий</h3>

                    <p class="chronicle-page-info">
                        Страница ${currentPage} из ${totalPages}
                    </p>
                </div>

                <div class="chronicle-timeline">
                    ${visibleEntries.map(renderEntry).join("")}
                </div>

                ${renderPagination(totalPages, currentPage)}
            </section>

        </div>
    `;

    setupPagination(entries);
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