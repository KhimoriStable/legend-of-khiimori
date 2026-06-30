const LINE_SETTINGS = [
    {
        key: "A",
        title: "Линия A",
        subtitle: "Линия Хавара и Амении",
        note: "Первая линия с упором на универсальность"
    },
    {
        key: "B",
        title: "Линия B",
        subtitle: "Линия Их-Мори и Шоно",
        note: "Вторая линия с упором на универсальность"
    },
    {
        key: "C",
        title: "Линия C",
        subtitle: "Линия Нандын и Гола",
        note: "Третья линия с упором на универсальность"
    },
    {
        key: "D",
        title: "Линия D",
        subtitle: "Резервная линия",
        note: "Будущая дополнительная основательская пара"
    },
    {
        key: "E",
        title: "Линия E",
        subtitle: "Резервная линия",
        note: "Будущая дополнительная основательская пара"
    },
    {
        key: "F",
        title: "Линия F",
        subtitle: "Резервная линия",
        note: "Будущая дополнительная основательская пара"
    }
];

const HORSES_PER_PAGE = 8;

async function loadStableTree() {
    try {
        const response = await fetch("data/horses.json");

        if (!response.ok) {
            throw new Error("Не удалось загрузить data/horses.json");
        }

        const horses = await response.json();

        const params = new URLSearchParams(window.location.search);
        const selectedLine = params.get("line");
        const showCrosses = params.get("crosses") === "true";

        if (showCrosses) {
            renderCrossesPage(horses);
            return;
        }

        if (selectedLine) {
            renderLinePage(horses, selectedLine);
            return;
        }

        renderOverviewPage(horses);
    } catch (error) {
        console.error(error);

        document.getElementById("stable-tree").innerHTML = `
            <article class="profile-card wide">
                <h2>Ошибка</h2>
                <p>Не удалось загрузить древо.</p>
            </article>
        `;
    }
}

function renderOverviewPage(horses) {
    document.title = "Древо — Legend of Khiimori";

    document.getElementById("tree-title").textContent = "🌳 Древо";
    document.getElementById("tree-subtitle").textContent = "Обзор племенных линий";
    document.getElementById("tree-disclaimer").innerHTML = `
        <strong>🌳 Обзор линий:</strong>
        нажми на нужную линию, чтобы открыть её отдельное древо. Так страница останется удобной даже при сотне лошадей.
    `;

    const treeBlock = document.getElementById("stable-tree");
    const crosses = findLineCrosses(horses);

    treeBlock.innerHTML = `
        <section class="tree-dashboard">
            <h2 class="section-title">Основные линии</h2>

            <div class="line-overview-grid">
                ${LINE_SETTINGS.map(line => renderLineOverviewCard(horses, line)).join("")}
            </div>
        </section>

        <section class="tree-dashboard">
            <h2 class="section-title">Межлинейные кроссы</h2>

            <article class="cross-overview-card" onclick="window.location.href='tree.html?crosses=true'">
                <div>
                    <h3>🔗 Кроссы линий</h3>
                    <p>Потомки, полученные от родителей из разных линий.</p>
                </div>

                <div class="overview-big-number">
                    ${crosses.length}
                    <span>кроссов</span>
                </div>

                <a class="tree-open-link" href="tree.html?crosses=true" onclick="event.stopPropagation()">
                    Открыть кроссы →
                </a>
            </article>
        </section>
    `;
}

function renderLineOverviewCard(horses, line) {
    const lineHorses = horses.filter(horse => horse.line === line.key);
    const founders = lineHorses.filter(isFounder);
    const descendants = lineHorses.filter(horse => !isFounder(horse));
    const maxGeneration = getMaxGeneration(horses, descendants, line.key);

    return `
        <article class="line-overview-card" onclick="window.location.href='tree.html?line=${line.key}'">
            <div class="line-overview-header">
                <h3>${line.title}</h3>
                <p>${line.subtitle}</p>
                <span>${line.note}</span>
            </div>

            <div class="line-overview-founders">
                <strong>Основатели:</strong>
                ${founders.length
                    ? founders.map(horse => `
                        <a href="horse.html?id=${horse.id}" onclick="event.stopPropagation()">
                            ${horse.sexSymbol || ""} ${horse.name}
                        </a>
                    `).join("")
                    : `<span>Пара ещё не выбрана</span>`
                }
            </div>

            <div class="line-overview-stats">
                <div>
                    <strong>${descendants.length}</strong>
                    <span>потомков</span>
                </div>

                <div>
                    <strong>${maxGeneration}</strong>
                    <span>поколений</span>
                </div>
            </div>

            <a class="tree-open-link" href="tree.html?line=${line.key}" onclick="event.stopPropagation()">
                Открыть древо →
            </a>
        </article>
    `;
}

function renderLinePage(horses, lineKey) {
    const line = getLineSetting(lineKey);
    const params = new URLSearchParams(window.location.search);
    const currentPage = Math.max(1, Number(params.get("page")) || 1);

    const lineHorses = horses.filter(horse => horse.line === lineKey);
    const founders = lineHorses.filter(isFounder);
    const descendants = lineHorses
        .filter(horse => !isFounder(horse))
        .map(horse => ({
            ...horse,
            generation: getGeneration(horses, horse, lineKey)
        }))
        .sort((a, b) => {
            if (a.generation !== b.generation) {
                return a.generation - b.generation;
            }

            return a.id.localeCompare(b.id);
        });

    const totalPages = Math.max(1, Math.ceil(descendants.length / HORSES_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * HORSES_PER_PAGE;
    const visibleDescendants = descendants.slice(startIndex, startIndex + HORSES_PER_PAGE);

    document.title = `${line.title} — Legend of Khiimori`;

    document.getElementById("tree-title").textContent = `🌳 ${line.title}`;
    document.getElementById("tree-subtitle").textContent = line.subtitle;
    document.getElementById("tree-disclaimer").innerHTML = `
        <strong>🌳 ${line.title}:</strong>
        показаны основатели и часть потомков линии. Если потомков много, используй стрелки для продолжения древа.
    `;

    const treeBlock = document.getElementById("stable-tree");

    treeBlock.innerHTML = `
        <a class="back-link" href="tree.html">← Назад к обзору линий</a>

        <section class="line-tree-page">
            <div class="line-page-header">
                <h2>${line.title}</h2>
                <p>${line.subtitle}</p>
                <span>${line.note}</span>
            </div>

            <div class="line-founders-block">
                <h3>Основатели</h3>

                ${founders.length
                    ? `<div class="line-founder-row">${founders.map(horse => renderTreeHorseCard(horse, "Основатель")).join("")}</div>`
                    : `
                        <div class="tree-empty-panel">
                            <strong>Основатели ещё не выбраны</strong>
                            <span>Добавим сюда магазинских или диких лошадей без известных родителей.</span>
                        </div>
                    `
                }
            </div>

            <div class="line-tree-arrow">↓</div>

            <div class="line-descendants-block">
                <div class="line-descendants-header">
                    <h3>Потомки линии</h3>
                    <span>Страница ${safePage} из ${totalPages}</span>
                </div>

                ${visibleDescendants.length
                    ? renderPaginatedDescendants(visibleDescendants)
                    : `
                        <div class="tree-empty-panel">
                            <strong>Потомков пока нет</strong>
                            <span>Когда появятся жеребята этой линии, они будут показаны здесь.</span>
                        </div>
                    `
                }

                ${renderPagination(lineKey, safePage, totalPages)}
            </div>
        </section>
    `;
}

function renderPaginatedDescendants(descendants) {
    const grouped = {};

    descendants.forEach(horse => {
        if (!grouped[horse.generation]) {
            grouped[horse.generation] = [];
        }

        grouped[horse.generation].push(horse);
    });

    return `
        <div class="descendant-page-stack">
            ${Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map(generation => `
                <section class="generation-page-block">
                    <h4>Поколение ${generation}</h4>

                    <div class="descendant-grid">
                        ${grouped[generation].map(horse => renderTreeHorseCard(horse, `Поколение ${generation}`)).join("")}
                    </div>
                </section>
            `).join("")}
        </div>
    `;
}

function renderPagination(lineKey, currentPage, totalPages) {
    if (totalPages <= 1) {
        return "";
    }

    const previousPage = currentPage - 1;
    const nextPage = currentPage + 1;

    return `
        <nav class="tree-pagination">
            ${currentPage > 1
                ? `<a class="tree-page-arrow" href="tree.html?line=${lineKey}&page=${previousPage}">←</a>`
                : `<span class="tree-page-arrow disabled">←</span>`
            }

            <span class="tree-page-info">Страница ${currentPage} / ${totalPages}</span>

            ${currentPage < totalPages
                ? `<a class="tree-page-arrow" href="tree.html?line=${lineKey}&page=${nextPage}">→</a>`
                : `<span class="tree-page-arrow disabled">→</span>`
            }
        </nav>
    `;
}

function renderCrossesPage(horses) {
    const crosses = findLineCrosses(horses);

    document.title = "Кроссы линий — Legend of Khiimori";

    document.getElementById("tree-title").textContent = "🔗 Межлинейные кроссы";
    document.getElementById("tree-subtitle").textContent = "Потомки от родителей из разных линий";
    document.getElementById("tree-disclaimer").innerHTML = `
        <strong>🔗 Кроссы:</strong>
        здесь показаны скрещивания между разными линиями. Они вынесены отдельно, чтобы основные линии не превращались в клубок.
    `;

    const treeBlock = document.getElementById("stable-tree");

    treeBlock.innerHTML = `
        <a class="back-link" href="tree.html">← Назад к обзору линий</a>

        <section class="crosses-page">
            ${crosses.length
                ? crosses.map(cross => renderCrossCard(cross)).join("")
                : `
                    <div class="tree-empty-panel">
                        <strong>Кроссов пока нет</strong>
                        <span>Когда потомок одной линии будет скрещён с потомком другой, связь появится здесь.</span>
                    </div>
                `
            }
        </section>
    `;
}

function renderCrossCard(cross) {
    return `
        <article class="cross-line-card">
            <h3>${cross.label}</h3>

            <div class="cross-line-grid">
                ${renderSmallCrossHorse(cross.father, "Отец")}
                <div class="pair-symbol">×</div>
                ${renderSmallCrossHorse(cross.mother, "Мать")}
            </div>

            <div class="line-tree-arrow">↓</div>

            <div class="cross-child-row">
                ${renderSmallCrossHorse(cross.child, "Потомок")}
            </div>
        </article>
    `;
}

function renderTreeHorseCard(horse, label) {
    const statusClass = horse.status === "ready" ? "status-ready" : "status-not-ready";
    const statusIcon = horse.status === "ready" ? "✅" : "⏳";

    return `
        <a class="tree-horse-card" href="horse.html?id=${horse.id}">
            <div class="tree-card-label">${label}</div>

            <div class="tree-card-name">
                ${horse.sexSymbol || ""} ${horse.name}
            </div>

            <div class="tree-card-meta">
                <span class="id-code">${horse.id}</span>
                <span>${horse.breed}</span>
            </div>

            <div class="tree-card-status ${statusClass}">
                ${statusIcon} ${horse.statusText}
            </div>

            <div class="tree-card-links">
                <span>Карточка</span>
                <span>•</span>
                <span>Родословная в карточке</span>
            </div>
        </a>
    `;
}

function renderSmallCrossHorse(horse, label) {
    return `
        <a class="cross-mini-horse" href="horse.html?id=${horse.id}">
            <span>${label}</span>
            <strong>${horse.sexSymbol || ""} ${horse.name}</strong>
            <small>${horse.id} • ${horse.line || "без линии"}</small>
        </a>
    `;
}

function findLineCrosses(horses) {
    return horses
        .map(child => {
            const mother = findHorseById(horses, child.pedigree?.motherId);
            const father = findHorseById(horses, child.pedigree?.fatherId);

            if (!mother || !father) {
                return null;
            }

            if (!mother.line || !father.line || mother.line === father.line) {
                return null;
            }

            return {
                child,
                mother,
                father,
                label: `${father.line} × ${mother.line}`
            };
        })
        .filter(Boolean);
}

function getLineSetting(lineKey) {
    return LINE_SETTINGS.find(line => line.key === lineKey) || {
        key: lineKey,
        title: `Линия ${lineKey}`,
        subtitle: "Пользовательская линия",
        note: "Дополнительная племенная линия"
    };
}

function getGeneration(allHorses, horse, lineKey, visited = new Set()) {
    if (!horse || isFounder(horse)) {
        return 0;
    }

    if (visited.has(horse.id)) {
        return 1;
    }

    visited.add(horse.id);

    const mother = findHorseById(allHorses, horse.pedigree?.motherId);
    const father = findHorseById(allHorses, horse.pedigree?.fatherId);

    const sameLineParents = [mother, father].filter(parent =>
        parent && parent.line === lineKey
    );

    if (!sameLineParents.length) {
        return 1;
    }

    const parentGenerations = sameLineParents.map(parent =>
        getGeneration(allHorses, parent, lineKey, new Set(visited))
    );

    return Math.max(...parentGenerations) + 1;
}

function getMaxGeneration(allHorses, descendants, lineKey) {
    if (!descendants.length) {
        return 0;
    }

    return Math.max(...descendants.map(horse => getGeneration(allHorses, horse, lineKey)));
}

function isFounder(horse) {
    return horse.founderStatus === "founder" ||
        (
            !horse.pedigree?.motherId &&
            !horse.pedigree?.fatherId &&
            horse.origin !== "bred"
        );
}

function findHorseById(horses, id) {
    if (!id) return null;
    return horses.find(horse => horse.id === id) || null;
}

loadStableTree();