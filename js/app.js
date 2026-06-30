let allHorses = [];
let currentLineFilter = "all";
let currentSearchQuery = "";
let currentStatusFilter = "all";

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

function getVisibleHorses() {
    return getFilteredHorses()
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

function renderHorseList(horses) {
    const horseList = document.getElementById("horse-list");

    horseList.innerHTML = "";

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