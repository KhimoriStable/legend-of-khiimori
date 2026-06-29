let adminHorses = [];

async function loadAdminHorses() {
    try {
        const response = await fetch("data/horses.json");

        if (!response.ok) {
            throw new Error("Не удалось загрузить data/horses.json");
        }

        adminHorses = await response.json();
        renderAdminHorseList();
    } catch (error) {
        console.error(error);

        document.getElementById("admin-horse-list").innerHTML = `
            <div class="profile-card wide">
                <h2>Ошибка загрузки</h2>
                <p>Не получилось загрузить файл <span class="id-code">data/horses.json</span>.</p>
                <p>Проверь, что файл существует и сохранён.</p>
            </div>
        `;
    }
}

function renderAdminHorseList() {
    const list = document.getElementById("admin-horse-list");

    list.innerHTML = "";

    adminHorses.forEach(horse => {
        const isReady = horse.status === "ready";

        const card = document.createElement("article");
        card.className = "profile-card admin-card";

        card.innerHTML = `
            <div class="admin-card-header">
                <div>
                    <h3>${horse.name}</h3>
                    <p>
                        <span class="id-code">${horse.id}</span>
                        • ${horse.sex} ${horse.sexSymbol}
                        • ${horse.breed}
                    </p>
                </div>

                <p class="${isReady ? "status-ready" : "status-not-ready"}">
                    ${isReady ? "✅" : "⏳"} ${horse.statusText}
                </p>
            </div>

            <table>
                <tr>
                    <th>Характеристика</th>
                    <th>Текущее</th>
                    <th>Максимум</th>
                </tr>

                ${horse.stats.map(stat => `
                    <tr>
                        <td>${stat.name}</td>
                        <td>${stat.current}</td>
                        <td>${stat.max}</td>
                    </tr>
                `).join("")}
            </table>

            <div class="admin-actions">
                <button type="button" onclick="maxHorseStats('${horse.id}')">
                    Прокачать до максимума
                </button>

                <button type="button" onclick="markHorseReady('${horse.id}')">
                    Сделать готовой к разведению
                </button>
            </div>
        `;

        list.appendChild(card);
    });
}

function maxHorseStats(horseId) {
    const horse = adminHorses.find(item => item.id === horseId);

    if (!horse) {
        return;
    }

    horse.stats.forEach(stat => {
        stat.current = stat.max;

        stat.skills = stat.skills.map(skill => {
            return skill.replace("*", "");
        });
    });

    setReadyStatus(horse);
    renderAdminHorseList();
}

function markHorseReady(horseId) {
    const horse = adminHorses.find(item => item.id === horseId);

    if (!horse) {
        return;
    }

    setReadyStatus(horse);
    renderAdminHorseList();
}

function setReadyStatus(horse) {
    horse.status = "ready";

    if (horse.sex === "Жеребец") {
        horse.statusText = "Готов к разведению";
    } else {
        horse.statusText = "Готова к разведению";
    }
}

loadAdminHorses();