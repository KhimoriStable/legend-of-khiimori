const checkResults = document.getElementById("check-results");

const checks = [
    {
        name: "Лошади",
        file: "data/horses.json",
        validator: validateHorses
    },
    {
        name: "Справочник",
        file: "data/reference.json",
        validator: validateReference
    },
    {
        name: "Летопись",
        file: "data/chronicle.json",
        validator: validateChronicle
    }
];

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function loadJson(file) {
    const response = await fetch(file);

    if (!response.ok) {
        throw new Error(`Файл не найден или не загрузился: ${file}`);
    }

    return response.json();
}

function validateHorses(horses) {
    const warnings = [];

    if (!Array.isArray(horses)) {
        return {
            ok: false,
            message: "Файл horses.json должен быть массивом.",
            warnings
        };
    }

    const ids = new Set();

    horses.forEach((horse, index) => {
        if (!horse.id) {
            warnings.push(`Лошадь №${index + 1}: не указан ID.`);
        }

        if (horse.id && ids.has(horse.id)) {
            warnings.push(`Дублирующийся ID: ${horse.id}.`);
        }

        if (horse.id) {
            ids.add(horse.id);
        }

        if (!horse.name) {
            warnings.push(`${horse.id || `Лошадь №${index + 1}`}: не указано имя.`);
        }

        if (!horse.status) {
            warnings.push(`${horse.id || horse.name}: не указан status.`);
        }

        if (!Array.isArray(horse.stats)) {
            warnings.push(`${horse.id || horse.name}: stats должен быть массивом.`);
        }
    });

    horses.forEach(horse => {
        const motherId = horse.pedigree?.motherId;
        const fatherId = horse.pedigree?.fatherId;

        if (motherId && !ids.has(motherId)) {
            warnings.push(`${horse.id}: motherId ${motherId} не найден среди лошадей.`);
        }

        if (fatherId && !ids.has(fatherId)) {
            warnings.push(`${horse.id}: fatherId ${fatherId} не найден среди лошадей.`);
        }
    });

    return {
        ok: true,
        message: `Загружено лошадей: ${horses.length}.`,
        warnings
    };
}

function validateReference(sections) {
    const warnings = [];

    if (!Array.isArray(sections)) {
        return {
            ok: false,
            message: "Файл reference.json должен быть массивом.",
            warnings
        };
    }

    sections.forEach((section, index) => {
        if (!section.section) {
            warnings.push(`Раздел №${index + 1}: не указано название section.`);
        }

        if (!Array.isArray(section.items)) {
            warnings.push(`${section.section || `Раздел №${index + 1}`}: items должен быть массивом.`);
            return;
        }

        section.items.forEach((item, itemIndex) => {
            if (!item.title) {
                warnings.push(`${section.section}: запись №${itemIndex + 1} без title.`);
            }

            if (!item.text) {
                warnings.push(`${section.section}: запись №${itemIndex + 1} без text.`);
            }
        });
    });

    return {
        ok: true,
        message: `Загружено разделов справочника: ${sections.length}.`,
        warnings
    };
}

function validateChronicle(entries) {
    const warnings = [];

    if (!Array.isArray(entries)) {
        return {
            ok: false,
            message: "Файл chronicle.json должен быть массивом.",
            warnings
        };
    }

    entries.forEach((entry, index) => {
        if (!entry.date) {
            warnings.push(`Запись летописи №${index + 1}: не указана date.`);
        }

        if (!entry.title) {
            warnings.push(`Запись летописи №${index + 1}: не указан title.`);
        }

        if (!entry.text) {
            warnings.push(`Запись летописи №${index + 1}: не указан text.`);
        }

        if (!entry.tag) {
            warnings.push(`Запись летописи №${index + 1}: не указан tag.`);
        }

        if (typeof entry.important !== "boolean") {
            warnings.push(`Запись летописи №${index + 1}: important должен быть true или false.`);
        }
    });

    return {
        ok: true,
        message: `Загружено записей летописи: ${entries.length}.`,
        warnings
    };
}

function renderCheckCard(result) {
    const statusClass = result.ok && result.warnings.length === 0
        ? "ok"
        : result.ok
            ? "warning"
            : "error";

    const statusText = result.ok && result.warnings.length === 0
        ? "✅ Всё хорошо"
        : result.ok
            ? "⚠️ Есть предупреждения"
            : "❌ Ошибка";

    return `
        <article class="check-card ${statusClass}">
            <div class="check-card-top">
                <h3>${escapeHtml(result.name)}</h3>
                <span>${statusText}</span>
            </div>

            <p><strong>Файл:</strong> <span class="id-code">${escapeHtml(result.file)}</span></p>
            <p>${escapeHtml(result.message)}</p>

            ${result.warnings.length > 0 ? `
                <ul class="check-warning-list">
                    ${result.warnings.map(warning => `
                        <li>${escapeHtml(warning)}</li>
                    `).join("")}
                </ul>
            ` : ""}
        </article>
    `;
}

async function runChecks() {
    const results = [];

    for (const check of checks) {
        try {
            const data = await loadJson(check.file);
            const validation = check.validator(data);

            results.push({
                name: check.name,
                file: check.file,
                ok: validation.ok,
                message: validation.message,
                warnings: validation.warnings
            });
        } catch (error) {
            results.push({
                name: check.name,
                file: check.file,
                ok: false,
                message: error.message,
                warnings: []
            });
        }
    }

    checkResults.innerHTML = results.map(renderCheckCard).join("");
}

runChecks();