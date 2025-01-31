const deckSlots = document.querySelectorAll('.deck-slot');
const selectedCards = new Set();
const cardsContainer = document.querySelector('.cards-container');
const elixirCounter = document.getElementById('elixirCounter');

async function fetchCards() {
    try {
        const response = await fetch("http://localhost:3000/cards");
        const cards = await response.json();

        cards.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card");
            const cardName = card.name[0];
            const elixirCost = card.elixircost[0];

            cardElement.innerHTML = `
                <img src="images/${cardName.replace(/\s+/g, '_').toLowerCase()}.png" alt="${cardName}" class="card-image">
                <h3 class="card-name" title="${cardName}">${cardName}</h3>
                <p class="elixir-cost">
                    <span>${elixirCost}</span>
                    <img src="images/elixir_drop.png" alt="Elixir Drop" class="elixir-drop-icon">
                </p>
            `;

            cardElement.draggable = true;

            cardElement.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', JSON.stringify({ cardName, elixirCost }));
            });

            cardsContainer.appendChild(cardElement);
        });
    } catch (error) {
        console.error("Error fetching card data:", error);
    }
}

function updateElixirCounter() {
    const elixirValues = Array.from(deckSlots)
        .map(slot => parseFloat(slot.dataset.elixir) || 0);
    const totalElixir = elixirValues.reduce((acc, val) => acc + val, 0);
    const filledSlots = elixirValues.filter(val => val > 0).length;
    elixirCounter.textContent = filledSlots > 0 ? (totalElixir / filledSlots).toFixed(1) : '0.0';
}

deckSlots.forEach(slot => {
    slot.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    slot.addEventListener('drop', (event) => {
        event.preventDefault();

        const { cardName, elixirCost } = JSON.parse(event.dataTransfer.getData('text/plain'));

        if (selectedCards.has(cardName)) {
            alert("This card is already in your deck!");
            return;
        }

        if (slot.textContent !== "Empty") {
            alert("This slot is already filled!");
            return;
        }

        slot.innerHTML = `<img src="images/${cardName.replace(/\s+/g, '_').toLowerCase()}.png" alt="${cardName}" class="slot-image">`;
        slot.dataset.elixir = elixirCost;
        slot.classList.add('filled-slot');
        selectedCards.add(cardName);

        // Eliminar carta de seleccion
        const cardElements = document.querySelectorAll('.card');
        cardElements.forEach(cardEl => {
            if (cardEl.querySelector('h3').textContent === cardName) {
                cardEl.remove();
            }
        });

        updateElixirCounter();

        slot.addEventListener('click', () => {
            selectedCards.delete(cardName);
            slot.innerHTML = "Empty";
            slot.dataset.elixir = "0";
            slot.classList.remove('filled-slot');

            const restoredCard = document.createElement("div");
            restoredCard.classList.add("card");
            restoredCard.innerHTML = ` 
                <img src="images/${cardName.replace(/\s+/g, '_').toLowerCase()}.png" alt="${cardName}" class="card-image">
                <h3 class="card-name" title="${cardName}">${cardName}</h3>
                <p class="elixir-cost">
                    <span>${elixirCost}</span>
                    <img src="images/elixir_drop.png" alt="Elixir Drop" class="elixir-drop-icon">
                </p>
            `;
            restoredCard.draggable = true;
            restoredCard.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', JSON.stringify({ cardName, elixirCost }));
            });

            cardsContainer.appendChild(restoredCard);
            updateElixirCounter();
        }, { once: true });
    });
});

fetchCards();
