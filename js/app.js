async function loadHorses() {
    try {
        const response = await fetch("data/horses.json");

        if (!response.ok) {
            throw new Error("Не удалось загрузить data/horses.json");
        }

        const horses = await response.json();

        updateStats(horses);
        renderHorseList(horses);
    } catch (error) {
        console.error(error);

        const horseList = document.getElementById("horse-list");
        horseList.innerHTML = `
            <div class="profile-card wide">
                <h2>Ошибка загрузки</h2>
                <p>Не получилось загрузить файл <span class="id-code">data/horses.json</span>.</p>
                <p>Проверь, что файл существует и сохранён.</p>
            </div>
        `;
    }
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
            <p class="${horse.status === "ready" ? "status-ready" : "status-not-ready"}">
    ${horse.status === "ready" ? "✅" : "⏳"} ${horse.statusText}
</p>
        `;

        horseList.appendChild(card);
    });
}

loadHorses();