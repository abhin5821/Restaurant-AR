document.addEventListener('DOMContentLoaded', () => {

  // --- DOM Elements ---
  const welcomeView = document.getElementById('welcome-view');
  const menuView = document.getElementById('menu-view');
  const arOverlay = document.getElementById('arOverlay');

  const categoryButtonsContainer = document.getElementById('category-buttons');
  const menuItemsGrid = document.getElementById('menu-items-grid');
  const categoryTitle = document.getElementById('category-title');
  
  const backBtn = document.getElementById('back-to-categories-btn');
  const closeArBtn = document.getElementById('closeBtn');
  const waiterBtn = document.getElementById('call-waiter-btn');
  
  const viewer = document.getElementById('viewer');
  
  let menuData = {};

  // --- Main Function to Initialize ---
  async function initializeApp() {
    try {
      const res = await fetch('/menu.json');
      if (!res.ok) throw new Error('Could not load menu data.');
      menuData = await res.json();
      
      populateCategoryButtons();
    } catch (error) {
      console.error(error);
      categoryButtonsContainer.innerHTML = '<p class="text-white">Could not load menu categories.</p>';
    }
  }

  // --- UI Population Functions ---
  function populateCategoryButtons() {
    const categories = Object.keys(menuData);
    categoryButtonsContainer.innerHTML = categories.map(category => 
      `<button class="btn btn-light" data-category="${category}">${category}</button>`
    ).join('');
  }

  function displayMenuItems(category) {
    const items = menuData[category];
    categoryTitle.textContent = category;
    menuItemsGrid.innerHTML = ''; // Clear previous items

    if (!items || items.length === 0) {
        menuItemsGrid.innerHTML = '<p>No items found in this category.</p>';
        return;
    }

    items.forEach(item => {
      const col = document.createElement('div');
      col.className = 'col-lg-4 col-md-6 mb-4 d-flex align-items-stretch';
      col.innerHTML = `
        <div class="card w-100">
          <img src="${item.thumbnail}" class="card-img-top" alt="${item.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text flex-grow-1">${item.desc}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <strong>${item.currency} ${item.price}</strong>
              <button class="btn btn-primary btn-ar" data-item='${JSON.stringify(item)}'>View in AR</button>
            </div>
          </div>
        </div>
      `;
      menuItemsGrid.appendChild(col);
    });
  }
  
  // --- Navigation & View Switching ---
  function showMenuView(category) {
    displayMenuItems(category);
    welcomeView.classList.add('d-none');
    menuView.classList.remove('d-none');
  }

  function showWelcomeView() {
    menuView.classList.add('d-none');
    welcomeView.classList.remove('d-none');
  }

  // --- AR Functionality ---
  function openAR(item) {
    if (!item?.model?.glb || !item?.model?.usdz) {
      alert('Sorry, the 3D model for this item is not available.');
      return;
    }
    viewer.src = item.model.glb;
    viewer.iosSrc = item.model.usdz;
    viewer.poster = item.thumbnail || '';
    arOverlay.classList.remove('hidden');
  }

  function closeAR() {
    arOverlay.classList.add('hidden');
    viewer.src = '';
    viewer.iosSrc = '';
    viewer.poster = '';
  }

  // --- Event Listeners ---
  categoryButtonsContainer.addEventListener('click', (e) => {
    const categoryButton = e.target.closest('button');
    if (categoryButton) {
      const category = categoryButton.dataset.category;
      showMenuView(category);
    }
  });

  menuItemsGrid.addEventListener('click', (e) => {
    const arButton = e.target.closest('.btn-ar');
    if (arButton) {
      const item = JSON.parse(arButton.dataset.item);
      openAR(item);
    }
  });

  backBtn.addEventListener('click', showWelcomeView);
  closeArBtn.addEventListener('click', closeAR);
  waiterBtn.addEventListener('click', () => {
    alert('Calling the waiter!'); // Placeholder action
  });

  // --- Start the App ---
  initializeApp();
});