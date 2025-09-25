// --- DOM Elements ---
const grid = document.getElementById('menu');
const overlay = document.getElementById('arOverlay');
const viewer = document.getElementById('viewer');
const closeBtn = document.getElementById('closeBtn');

// --- Functions ---

/**
 * Fetches menu data from menu.json and populates the grid.
 */
async function loadMenu() {
  try {
    const res = await fetch('/menu.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch menu.json with status: ${res.status}`);
    }
    const items = await res.json();

    grid.innerHTML = ''; // Clear any previous content

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${item.thumbnail || ''}" alt="${item.name}" class="thumb" onerror="this.style.display='none'"/>
        <div class="card-body">
          <h3>${item.name}</h3>
          <p class="desc">${item.desc}</p>
          <div class="card-footer">
            <strong>${item.currency} ${item.price}</strong>
            <button class="btn-ar">View in AR</button>
          </div>
        </div>
      `;
      // Attach the full item data to the card element for easy access
      card.dataset.item = JSON.stringify(item);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('ERROR in loadMenu:', err);
    grid.textContent = 'Failed to load menu. Please check the developer console for errors.';
  }
}

/**
 * Handles clicks on the main menu grid, looking for clicks on AR buttons.
 */
function handleARButtonClick(e) {
  const btn = e.target.closest('.btn-ar');

  if (!btn) {
    return; // Exit if the click was not on an AR button
  }

  const card = btn.closest('.card');
  if (!card || !card.dataset.item) {
    console.error('Could not find item data on the parent card element.');
    return;
  }

  try {
    const itemData = JSON.parse(card.dataset.item);
    openAR(itemData);
  } catch (err) {
    console.error('ERROR: Failed to parse item data from card:', err);
  }
}

/**
 * Opens the AR overlay and loads the selected 3D model.
 */
function openAR(item) {
  if (!item?.model?.glb || !item?.model?.usdz) {
    console.error('Item is missing required model paths (.glb or .usdz).', item);
    alert('Sorry, the 3D model for this item is not available.');
    return;
  }

  // Set the 3D model sources and poster image for <model-viewer>
  viewer.src = item.model.glb;
  viewer.iosSrc = item.model.usdz;
  viewer.poster = item.thumbnail || '';
  
  // Show the overlay
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
}

/**
 * Closes the AR overlay and unloads the 3D model to save resources.
 */
function closeAR() {
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  // Unload the model to free up memory
  viewer.src = '';
  viewer.iosSrc = '';
  viewer.poster = '';
}

// --- Event Listeners ---
grid.addEventListener('click', handleARButtonClick);
closeBtn.addEventListener('click', closeAR);

// --- Initial Load ---
loadMenu();