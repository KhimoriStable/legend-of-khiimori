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

        renderHorseProfile(horse);
    } catch (error) {
        console.error(error);
        showError("Не получилось загрузить данные лошади.");
    }
}

function renderHorseProfile(horse) {
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
                <tr><th>Имя</th><td>${horse.name}</td></tr>
                <tr><th>Пол</th><td>${horse.sex} ${horse.sexSymbol}</td></tr>
                <tr><th>Порода</th><td>${horse.breed}</td></tr>
                <tr><th>Масть</th><td>${horse.coat}</td></tr>
                <tr><th>Рост</th><td>${horse.heightCm} см</td></tr>
                <tr><th>Вес</th><td>${horse.weightKg} кг</td></tr>
            </table>
        </article>

        <article class="profile-card">
            <h2>❤️ Статус разведения</h2>

            <p class="${horse.status === "ready" ? "status-ready" : "status-not-ready"} big">
                ${horse.status === "ready" ? "✅" : "⏳"} ${horse.statusText}
            </p>

            <p>${horse.status === "ready"
                ? "Все основные характеристики прокачаны до максимума."
                : "Лошадь пока не готова к разведению."}
            </p>
        </article>

        <article class="profile-card">
            <h2>🧠 Черты характера</h2>

            ${renderList(horse.traits)}
        </article>

        <article class="profile-card wide">
            <h2>📊 Характеристики и навыки</h2>

            <table>
                <tr>
                    <th>Характеристика</th>
                    <th>Значение</th>
                    <th>Навыки</th>
                </tr>

                ${horse.stats.map(stat => `
                    <tr>
                        <td>${stat.name}</td>
                        <td>${stat.current} / ${stat.max}</td>
                        <td>${stat.skills.length ? stat.skills.join(", ") : "—"}</td>
                    </tr>
                `).join("")}
            </table>
        </article>

        <article class="profile-card wide">
            <h2>🧬 Генетика</h2>

            <table>
                <tr><th>Ген</th><th>Значение</th></tr>
                <tr><td>Фенотип</td><td>${horse.genetics.phenotype}</td></tr>

                ${horse.genetics.genes.map(gene => `
                    <tr>
                        <td>${gene.name}</td>
                        <td>${gene.value}</td>
                    </tr>
                `).join("")}
            </table>
        </article>

        <article class="profile-card wide">
            <h2>⚙️ Подробные параметры</h2>

            <table>
                <tr><th>Параметр</th><th>Значение</th></tr>

                ${horse.parameters.map(parameter => `
                    <tr>
                        <td>${parameter.name}</td>
                        <td>${parameter.value}</td>
                    </tr>
                `).join("")}
            </table>
        </article>

        <article class="profile-card wide">
            <h2>🌳 Родословная</h2>

            <table>
                <tr><th>Мать</th><td>${horse.pedigree.motherId || "Неизвестно"}</td></tr>
                <tr><th>Отец</th><td>${horse.pedigree.fatherId || "Неизвестно"}</td></tr>
                <tr><th>Заметки</th><td>${horse.pedigree.notes || "—"}</td></tr>
            </table>
        </article>
    `;
}

function renderList(items) {
    if (!items || items.length === 0) {
        return "<p>Нет данных.</p>";
    }

    return `
        <ul>
            ${items.map(item => `<li>${item}</li>`).join("")}
        </ul>
    `;
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