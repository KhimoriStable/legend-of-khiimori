let allHorses = [];
let currentLineFilter = "all";
let currentSearchQuery = "";
let currentStatusFilter = "all";
let currentSortMode = "id";

async function loadHorses() {
    try {
        const response = await fetch("data/horses.json");

        if (!response.ok) {
            throw new Error("Не удалось загрузить data/horses.json");
        }

        const horses = await response.json();

        allHorses = horses;

        updateStats(allHorses);
        setupLineFilters();
        setupHorseSearch();
        setupStatusFilter();
        setupHorseSort();
        function setupResetFilters() {
    const resetButton = document.getElementById("reset-stable-filters");
    const searchInput = document.getElementById("horse-search-input");
    const sortSelect = document.getElementById("horse-sort-select");

    if (!resetButton) return;

    resetButton.addEventListener("click", () => {
        currentLineFilter = "all";
        currentSearchQuery = "";
        currentStatusFilter = "all";
        currentSortMode = "id";

        if (searchInput) {
            searchInput.value = "";
        }

        if (sortSelect) {
            sortSelect.value = "id";
        }

        document.querySelectorAll("[data-line-filter]").forEach(button => {
            button.classList.toggle("active", button.dataset.lineFilter === "all");
        });

        document.querySelectorAll("[data-status-filter]").forEach(button => {
            button.classList.toggle("active", button.dataset.statusFilter === "all");
        });

        renderHorseList(getVisibleHorses());
    });
}
        setupResetFilters();
        renderHorseList(getVisibleHorses());
    } catch (error) {
        console.error(error);

        const horseList = document.getElementById("horse-list");

        if (horseList) {
            horseList.innerHTML = `
                <div class="profile-card wide">
                    <h2>Ошибка загрузки</h2>
                    <p>Не получилось загрузить файл <span class="id-code">data/horses.json</span>.</p>
                    <p>Проверь, что файл существует и сохранён.</p>
                </div>
            `;
        }
    }
}

function setupLineFilters() {
    const buttons = document.querySelectorAll("[data-line-filter]");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            currentLineFilter = button.dataset.lineFilter;

            buttons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");

            renderHorseList(getVisibleHorses());
        });
    });
}

function setupHorseSearch() {
    const searchInput = document.getElementById("horse-search-input");

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        currentSearchQuery = searchInput.value.toLowerCase().trim();
        renderHorseList(getVisibleHorses());
    });
}

function setupStatusFilter() {
    const buttons = document.querySelectorAll("[data-status-filter]");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            currentStatusFilter = button.dataset.statusFilter;

            buttons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");

            renderHorseList(getVisibleHorses());
        });
    });
}

function setupHorseSort() {
    const sortSelect = document.getElementById("horse-sort-select");

    if (!sortSelect) return;

    sortSelect.addEventListener("change", () => {
        currentSortMode = sortSelect.value;
        renderHorseList(getVisibleHorses());
    });
}

function getVisibleHorses() {
    const filteredHorses = getFilteredHorses()
        .filter(horse => {
            if (currentStatusFilter === "ready") {
                return horse.status === "ready";
            }

            if (currentStatusFilter === "not-ready") {
                return horse.status !== "ready";
            }

            return true;
        })
        .filter(horse => {
            if (!currentSearchQuery) {
                return true;
            }

            const searchableText = buildHorseSearchText(horse);

            return searchableText.includes(currentSearchQuery);
        });

    return sortHorses(filteredHorses);
}

function getFilteredHorses() {
    if (currentLineFilter === "all") {
        return allHorses;
    }

    if (currentLineFilter === "none") {
        return allHorses.filter(horse => !horse.line);
    }

    return allHorses.filter(horse => horse.line === currentLineFilter);
}

function sortHorses(horses) {
    const collator = new Intl.Collator("ru", {
        numeric: true,
        sensitivity: "base"
    });

    return [...horses].sort((firstHorse, secondHorse) => {
        if (currentSortMode === "name") {
            return collator.compare(firstHorse.name || "", secondHorse.name || "");
        }

        if (currentSortMode === "line") {
            const firstLine = firstHorse.line || "ZZZ";
            const secondLine = secondHorse.line || "ZZZ";

            return collator.compare(
                `${firstLine} ${firstHorse.id}`,
                `${secondLine} ${secondHorse.id}`
            );
        }

        if (currentSortMode === "status") {
            const firstReady = firstHorse.status === "ready" ? 0 : 1;
            const secondReady = secondHorse.status === "ready" ? 0 : 1;

            if (firstReady !== secondReady) {
                return firstReady - secondReady;
            }

            return collator.compare(firstHorse.id || "", secondHorse.id || "");
        }

        return collator.compare(firstHorse.id || "", secondHorse.id || "");
    });
}

function buildHorseSearchText(horse) {
    const traits = horse.traits || [];

    const skills = (horse.stats || [])
        .flatMap(stat => stat.skills || []);

    const parameters = (horse.parameters || [])
        .map(parameter => `${parameter.name} ${parameter.value}`);

    return `
        ${horse.id}
        ${horse.name}
        ${horse.sex}
        ${horse.breed}
        ${horse.coat}
        ${horse.status}
        ${horse.statusText}
        ${horse.origin}
        ${horse.line}
        ${horse.lineName}
        ${horse.lineRole}
        ${horse.heightCm}
        ${horse.weightKg}
        ${traits.join(" ")}
        ${skills.join(" ")}
        ${parameters.join(" ")}
    `.toLowerCase();
}

function updateStats(horses) {
    const total = horses.length;
    const ready = horses.filter(horse => horse.status === "ready").length;
    const notReady = horses.filter(horse => horse.status !== "ready").length;

    document.getElementById("total-horses").textContent = total;
    document.getElementById("ready-horses").textContent = ready;
    document.getElementById("not-ready-horses").textContent = notReady;
}

function updateVisibleCount(visibleCount, totalCount) {
    const countElement = document.getElementById("horse-visible-count");

    if (!countElement) return;

    countElement.textContent = `Показано: ${visibleCount} из ${totalCount} лошадей`;
}

function renderHorseList(horses) {
    const horseList = document.getElementById("horse-list");

    horseList.innerHTML = "";

    updateVisibleCount(horses.length, allHorses.length);

    if (!horses.length) {
        horseList.innerHTML = `
            <article class="profile-card wide">
                <h2>Лошадей не найдено</h2>
                <p>По текущему фильтру и поиску ничего не найдено.</p>
                <p>Попробуй другое слово или выбери фильтр “Все”.</p>
            </article>
        `;
        return;
    }

    horses.forEach(horse => {
        const card = document.createElement("a");

        card.className = "horse-card";
        card.href = `horse.html?id=${horse.id}`;

        card.innerHTML = `
            <h3>${horse.name}</h3>
            <p><strong>ID:</strong> <span class="id-code">${horse.id}</span></p>
            <p><strong>Пол:</strong> ${horse.sex} ${horse.sexSymbol}</p>
            <p><strong>Порода:</strong> ${horse.breed}</p>
            <p><strong>Масть:</strong> ${horse.coat}</p>

            <div class="horse-line-badge">
                🌳 ${getLineText(horse)}
            </div>

            <p class="${horse.status === "ready" ? "status-ready" : "status-not-ready"}">
                ${horse.status === "ready" ? "✅" : "⏳"} ${horse.statusText}
            </p>
        `;

        horseList.appendChild(card);
    });
}

function getLineText(horse) {
    if (!horse.line && !horse.lineName) {
        return "Линия не назначена";
    }

    if (horse.line && horse.lineName) {
        return `${horse.line} — ${horse.lineName}`;
    }

    return horse.lineName || horse.line || "Линия не назначена";
}

loadHorses();