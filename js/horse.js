const TREE_HORSES_PER_PAGE = 8;

async function loadHorseProfile() {
    try {
        const params = new URLSearchParams(window.location.search);
        const horseId = params.get("id");

        if (!horseId) {
            showError("ID лошади не указан в адресе страницы.");
            return;
        }

        const response = await fetch("data/horses.json");

        if (!response.ok) {
            throw new Error("Не удалось загрузить data/horses.json");
        }

        const horses = await response.json();
        const horse = horses.find(item => item.id === horseId);

        if (!horse) {
            showError(`Лошадь с ID ${horseId} не найдена.`);
            return;
        }

        renderHorseProfile(horses, horse);
    } catch (error) {
        console.error(error);
        showError("Не получилось загрузить данные лошади.");
    }
}

function renderHorseProfile(horses, horse) {
    document.title = `${horse.name} — Legend of Khiimori`;

    document.getElementById("horse-name").textContent = `🐴 ${horse.name}`;
    document.getElementById("horse-subtitle").innerHTML = `
        <span class="id-code">${horse.id}</span> • ${horse.sex} ${horse.sexSymbol} • ${horse.breed}
    `;

    const profile = document.getElementById("horse-profile");

    profile.innerHTML = `
        <article class="profile-card">
            <h2>📋 Основная информация</h2>

            <table>
                <tr><th>ID</th><td><span class="id-code">${horse.id}</span></td></tr>
                <tr><th>Имя</th><td>${horse.name || "—"}</td></tr>
                <tr><th>Пол</th><td>${horse.sex || "—"} ${horse.sexSymbol || ""}</td></tr>
                <tr><th>Порода</th><td>${horse.breed || "—"}</td></tr>
                <tr><th>Масть</th><td>${horse.coat || "—"}</td></tr>
                <tr><th>Рост</th><td>${horse.heightCm ? horse.heightCm + " см" : "—"}</td></tr>
                <tr><th>Вес</th><td>${horse.weightKg ? horse.weightKg + " кг" : "—"}</td></tr>
                <tr><th>Линия</th><td>${getLineLink(horses, horse)}</td></tr>
                <tr><th>Происхождение</th><td>${getOriginText(horse.origin)}</td></tr>
            </table>
        </article>

        <article class="profile-card">
            <h2>❤️ Статус разведения</h2>

            <p class="${horse.status === "ready" ? "status-ready" : "status-not-ready"} big">
                ${horse.status === "ready" ? "✅" : "⏳"} ${horse.statusText || "Статус не указан"}
            </p>

            <p>${horse.status === "ready"
                ? "Все основные характеристики прокачаны до максимума."
                : "Лошадь пока не готова к разведению."}
            </p>
        </article>

        <article class="profile-card">
            <h2>🐴 Племенная программа</h2>
            ${renderProgram(horses, horse)}
        </article>

        <article class="profile-card">
            <h2>🧠 Черты характера</h2>
            ${renderTraits(horse.traits)}
        </article>

        <article class="profile-card two-thirds">
            <h2>📊 Характеристики и навыки</h2>

            <table class="compact-table stats-table">
                <tr>
                    <th>Характеристика</th>
                    <th>Значение</th>
                    <th>Навыки</th>
                </tr>

                ${renderStats(horse.stats)}
            </table>
        </article>

        <article class="profile-card one-third">
            <h2>🧬 Генетика</h2>
            ${renderGenetics(horse.genetics)}
        </article>

        <article class="profile-card two-thirds">
            <h2>⚙️ Подробные параметры</h2>
            ${renderParameters(horse.parameters)}
        </article>

        <article class="profile-card one-third">
            <h2>🌳 Родословная</h2>
            ${renderPedigree(horse)}

            <a class="pedigree-button" href="pedigree.html?id=${horse.id}">
                🌳 Открыть древо
            </a>
        </article>
    `;
}

function renderProgram(horses, horse) {
    const program = horse.program || {};

    const lineFullName = program.lineFullName || horse.lineName || "Не назначена";
    const role = program.role || horse.lineRole || getFounderText(horse);
    const direction = program.direction || "Не указано";
    const partner = program.partner || getPartnerName(horses, horse) || "Не указана";

    return `
        <table class="compact-table">
            <tr><th>Линия</th><td>${lineFullName}</td></tr>
            <tr><th>Роль</th><td>${role}</td></tr>
            <tr><th>Направление</th><td>${direction}</td></tr>
            <tr><th>Пара</th><td>${partner}</td></tr>
        </table>
    `;
}

function renderTraits(traits) {
    if (!traits || traits.length === 0) {
        return "<p>Нет данных.</p>";
    }

    return `
        <ul class="trait-list">
            ${traits.map(trait => `
                <li>
                    <strong>${trait}</strong>
                    <span>${getTraitDescription(trait)}</span>
                </li>
            `).join("")}
        </ul>
    `;
}

function renderStats(stats) {
    if (!stats || stats.length === 0) {
        return `
            <tr>
                <td colspan="3">Нет данных.</td>
            </tr>
        `;
    }

    return stats.map(stat => `
        <tr>
            <td>${stat.name || "—"}</td>
            <td>${stat.current ?? "—"} / ${stat.max ?? "—"}</td>
            <td>${stat.skills && stat.skills.length ? stat.skills.join(", ") : "—"}</td>
        </tr>
    `).join("");
}

function renderGenetics(genetics) {
    if (!genetics) {
        return "<p>Нет данных.</p>";
    }

    const genes = genetics.genes || [];

    return `
        <p class="genetics-phenotype">
            <strong>Фенотип:</strong> ${genetics.phenotype || "—"}
        </p>

        <div class="gene-grid">
            ${genes.length ? genes.map(gene => `
                <span class="gene-pill">
                    <strong>${gene.name}</strong>
                    ${gene.value}
                </span>
            `).join("") : "<p>Гены не указаны.</p>"}
        </div>
    `;
}

function renderParameters(parameters) {
    if (!parameters || parameters.length === 0) {
        return "<p>Нет данных.</p>";
    }

    return `
        <table class="compact-table readable-params">
            ${parameters.map(parameter => `
                <tr>
                    <td>${parameter.name}</td>
                    <td>${parameter.value}</td>
                </tr>
            `).join("")}
        </table>
    `;
}

function renderPedigree(horse) {
    const pedigree = horse.pedigree || {};

    return `
        <table class="compact-table">
            <tr><th>Мать</th><td>${pedigree.motherId || "Неизвестно"}</td></tr>
            <tr><th>Отец</th><td>${pedigree.fatherId || "Неизвестно"}</td></tr>
            <tr><th>Заметки</th><td>${pedigree.notes || "—"}</td></tr>
        </table>
    `;
}

function getLineLink(horses, horse) {
    if (!horse.line) {
        return "Не назначена";
    }

    const url = getLineUrlForHorse(horses, horse);

    return `
        <a class="profile-line-link" href="${url}">
            🌳 ${getLineText(horse)}
        </a>
    `;
}

function getLineUrlForHorse(horses, horse) {
    const line = encodeURIComponent(horse.line);

    if (isFounderForLine(horse)) {
        return `tree.html?line=${line}`;
    }

    const descendants = horses
        .filter(item => item.line === horse.line && !isFounderForLine(item))
        .map(item => ({
            ...item,
            generation: getGenerationForLine(horses, item, horse.line)
        }))
        .sort((a, b) => {
            if (a.generation !== b.generation) {
                return a.generation - b.generation;
            }

            return a.id.localeCompare(b.id);
        });

    const index = descendants.findIndex(item => item.id === horse.id);

    if (index === -1) {
        return `tree.html?line=${line}`;
    }

    const page = Math.floor(index / TREE_HORSES_PER_PAGE) + 1;

    return page > 1
        ? `tree.html?line=${line}&page=${page}`
        : `tree.html?line=${line}`;
}

function getGenerationForLine(horses, horse, lineKey, visited = new Set()) {
    if (!horse || isFounderForLine(horse)) {
        return 0;
    }

    if (visited.has(horse.id)) {
        return 1;
    }

    visited.add(horse.id);

    const mother = findHorseById(horses, horse.pedigree?.motherId);
    const father = findHorseById(horses, horse.pedigree?.fatherId);

    const sameLineParents = [mother, father].filter(parent =>
        parent && parent.line === lineKey
    );

    if (!sameLineParents.length) {
        return 1;
    }

    const parentGenerations = sameLineParents.map(parent =>
        getGenerationForLine(horses, parent, lineKey, new Set(visited))
    );

    return Math.max(...parentGenerations) + 1;
}

function isFounderForLine(horse) {
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

function getLineText(horse) {
    if (!horse.line && !horse.lineName) {
        return "Не назначена";
    }

    if (horse.line && horse.lineName) {
        return `${horse.line} — ${horse.lineName}`;
    }

    return horse.lineName || horse.line || "Не назначена";
}

function getFounderText(horse) {
    if (horse.founderStatus === "founder") {
        return horse.sex === "Кобыла" ? "Основательница" : "Основатель";
    }

    if (horse.founderStatus === "descendant") {
        return "Потомок";
    }

    if (horse.line && horse.line.includes("×")) {
        return "Межлинейный кросс";
    }

    return "Не указана";
}

function getPartnerName(horses, horse) {
    if (!horse.line) {
        return null;
    }

    const partner = horses.find(item =>
        item.id !== horse.id &&
        item.line === horse.line &&
        item.founderStatus === "founder"
    );

    return partner ? partner.name : null;
}

function getOriginText(origin) {
    const origins = {
        "starter": "Стартовая лошадь",
        "trader": "Куплена у торговца",
        "wild": "Приручена в дикой природе",
        "bred": "Рождена в конюшне"
    };

    return origins[origin] || "Не указано";
}

function getTraitDescription(trait) {
    const descriptions = {
        "Страсть к карьеру": "Набирает бодрость при карьере.",
        "Мерзлявость": "Теряет бодрость в холод.",
        "Вьючная лошадь": "Набирает бодрость при перегрузе.",
        "Метеочувствительность": "Теряет бодрость в дождь.",
        "Трусость": "Быстрее теряет бодрость, когда пугается.",
        "Игривый нрав": "Набирает бодрость рядом с кроликами.",
        "Раздражительность от голода": "Теряет бодрость, когда хочет есть.",
        "Ночной образ жизни": "Набирает бодрость ночью.",
        "Ветреность": "Набирает бодрость в сильный ветер.",
        "Храбрость": "Набирает бодрость, когда пугается.",
        "Зимняя шкура": "Набирает бодрость в холод.",
        "Избирательность в еде": "Меньше ест.",
        "Нелюбовь к ветру": "Теряет бодрость в сильный ветер."
    };

    return descriptions[trait] || "Описание пока не добавлено.";
}

function showError(message) {
    document.getElementById("horse-name").textContent = "⚠️ Ошибка";
    document.getElementById("horse-subtitle").textContent = "Не удалось открыть карточку";

    document.getElementById("horse-profile").innerHTML = `
        <article class="profile-card wide">
            <h2>Ошибка</h2>
            <p>${message}</p>
            <p><a class="back-link" href="index.html">← Вернуться на главную</a></p>
        </article>
    `;
}

loadHorseProfile();