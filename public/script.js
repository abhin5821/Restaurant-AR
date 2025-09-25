// --- DOM Elements ---
const grid = document.getElementById('menu');
const overlay = document.getElementById('arOverlay');
const viewer = document.getElementById('viewer');
const closeBtn = document.getElementById('closeBtn');

// --- Functions ---

/**
 * Fetches menu data and populates the Bootstrap grid.
 */
async function loadMenu() {
  try {
    const res = await fetch('/menu.json');
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const items = await res.json();

    grid.innerHTML = ''; // Clear previous content

    items.forEach(item => {
      // Create a Bootstrap column for each card
      const col = document.createElement('div');
      col.className = 'col-lg-4 col-md-6 mb-4 d-flex align-items-stretch';

      // Use Bootstrap's card structure for better responsiveness
      col.innerHTML = `
        <div class="card w-100">
          <img src="${item.thumbnail || ''}" class="card-img-top" alt="${item.name}" onerror="this.style.display='none'">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text flex-grow-1">${item.desc}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <strong>${item.currency} ${item.price}</strong>
              <button class="btn btn-primary btn-ar">View in AR</button>
            </div>
          </div>
        </div>
      `;
      // Attach the full item data to the column for the event listener
      col.dataset.item = JSON.stringify(item);
      grid.appendChild(col);
    });
  } catch (err) {
    console.error('ERROR in loadMenu:', err);
    grid.innerHTML = '<p class="text-danger">Failed to load menu. Please try again later.</p>';
  }
}

/**
 * Handles clicks on AR buttons within the grid.
 */
function handleARButtonClick(e) {
  const btn = e.target.closest('.btn-ar');
  if (!btn) return;

  // Data is now on the column element
  const col = btn.closest('.col-lg-4');
  if (!col || !col.dataset.item) return;

  try {
    const itemData = JSON.parse(col.dataset.item);
    openAR(itemData);
  } catch (err) {
    console.error('ERROR: Failed to parse item data:', err);
  }
}

/**
 * Opens the AR overlay and loads the 3D model.
 */
function openAR(item) {
  if (!item?.model?.glb || !item?.model?.usdz) {
    alert('Sorry, the 3D model for this item is not available.');
    return;
  }
  viewer.src = item.model.glb;
  viewer.iosSrc = item.model.usdz;
  viewer.poster = item.thumbnail || '';
  overlay.classList.remove('hidden');
}

/**
 * Closes the AR overlay and unloads the model.
 */
function closeAR() {
  overlay.classList.add('hidden');
  viewer.src = '';
  viewer.iosSrc = '';
  viewer.poster = '';
}

// --- Event Listeners ---
grid.addEventListener('click', handleARButtonClick);
closeBtn.addEventListener('click', closeAR);

// --- Initial Load ---
loadMenu();