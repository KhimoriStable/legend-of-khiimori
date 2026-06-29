async function loadPedigree() {
    try {
        const params = new URLSearchParams(window.location.search);
        const horseId = params.get("id");

        if (!horseId) {
            showPedigreeError("ID лошади не указан.");
            return;
        }

        const response = await fetch("data/horses.json");

        if (!response.ok) {
            throw new Error("Не удалось загрузить data/horses.json");
        }

        const horses = await response.json();
        const horse = findHorse(horses, horseId);

        if (!horse) {
            showPedigreeError(`Лошадь с ID ${horseId} не найдена.`);
            return;
        }

        renderPedigree(horses, horse);
    } catch (error) {
        console.error(error);
        showPedigreeError("Не получилось загрузить родословную.");
    }
}

function renderPedigree(horses, horse) {
    document.title = `Родословная ${horse.name} — Legend of Khiimori`;

    document.getElementById("pedigree-title").textContent = `🌳 Родословная: ${horse.name}`;
    document.getElementById("pedigree-subtitle").innerHTML = `
        <span class="id-code">${horse.id}</span> • ${horse.sex} ${horse.sexSymbol} • ${horse.breed}
    `;

    document.getElementById("back-to-horse").href = `horse.html?id=${horse.id}`;

    const mother = findHorse(horses, horse.pedigree?.motherId);
    const father = findHorse(horses, horse.pedigree?.fatherId);

    const maternalGrandmother = mother ? findHorse(horses, mother.pedigree?.motherId) : null;
    const maternalGrandfather = mother ? findHorse(horses, mother.pedigree?.fatherId) : null;

    const paternalGrandmother = father ? findHorse(horses, father.pedigree?.motherId) : null;
    const paternalGrandfather = father ? findHorse(horses, father.pedigree?.fatherId) : null;

    const tree = document.getElementById("pedigree-tree");

    tree.innerHTML = `
        <div class="pedigree-generation grandparents">
            ${renderPedigreeHorse(maternalGrandmother, "Бабушка по матери")}
            ${renderPedigreeHorse(maternalGrandfather, "Дедушка по матери")}
            ${renderPedigreeHorse(paternalGrandmother, "Бабушка по отцу")}
            ${renderPedigreeHorse(paternalGrandfather, "Дедушка по отцу")}
        </div>

        <div class="pedigree-lines pedigree-lines-top">
            <span></span>
            <span></span>
        </div>

        <div class="pedigree-generation parents">
            ${renderPedigreeHorse(mother, "Мать")}
            ${renderPedigreeHorse(father, "Отец")}
        </div>

        <div class="pedigree-lines pedigree-lines-bottom">
            <span></span>
        </div>

        <div class="pedigree-generation main-horse">
            ${renderPedigreeHorse(horse, "Выбранная лошадь", true)}
        </div>
    `;
}

function renderPedigreeHorse(horse, label, isMain = false) {
    if (!horse) {
        return `
            <div class="pedigree-horse unknown">
                <div class="pedigree-label">${label}</div>
                <div class="pedigree-name">Неизвестно</div>
                <div class="pedigree-meta">Нет данных</div>
            </div>
        `;
    }

    return `
        <a class="pedigree-horse ${isMain ? "current" : ""}" href="horse.html?id=${horse.id}">
            <div class="pedigree-label">${label}</div>
            <div class="pedigree-name">${horse.sexSymbol || ""} ${horse.name}</div>
            <div class="pedigree-meta">
                <span class="id-code">${horse.id}</span>
                <span>${horse.breed}</span>
            </div>
        </a>
    `;
}

function findHorse(horses, id) {
    if (!id) return null;
    return horses.find(horse => horse.id === id) || null;
}

function showPedigreeError(message) {
    document.getElementById("pedigree-title").textContent = "⚠️ Ошибка";
    document.getElementById("pedigree-subtitle").textContent = "Не удалось открыть родословную";

    document.getElementById("pedigree-tree").innerHTML = `
        <article class="profile-card wide">
            <h2>Ошибка</h2>
            <p>${message}</p>
            <p><a class="back-link" href="index.html">← Вернуться на главную</a></p>
        </article>
    `;
}

loadPedigree();