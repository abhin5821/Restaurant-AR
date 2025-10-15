document.addEventListener('DOMContentLoaded', () => {

  // --- DOM Elements ---
  const welcomeView = document.getElementById('welcome-view');
  const menuView = document.getElementById('menu-view');
  const arLauncher = document.getElementById('ar-launcher'); // The new hidden model-viewer

  const categoryButtonsContainer = document.getElementById('category-buttons');
  const menuItemsGrid = document.getElementById('menu-items-grid');
  const categoryTitle = document.getElementById('category-title');
  
  const backBtn = document.getElementById('back-to-categories-btn');
  const waiterBtn = document.getElementById('call-waiter-btn');
  
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
    menuItemsGrid.innerHTML = '';

    if (!items || items.length === 0) {
        menuItemsGrid.innerHTML = '<p>No items found in this category.</p>';
        return;
    }

    // **PERFORMANCE: Preload the first model in the category**
    if (items[0].model.glb) {
      preloadModel(items[0].model.glb);
    }

    items.forEach(item => {
      const col = document.createElement('div');
      // Added col-12 for explicit mobile stacking
      col.className = 'col-lg-4 col-md-6 col-12 mb-4 d-flex align-items-stretch';
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

  // --- **NEW** AR and Performance Functions ---
  
  /**
   * Directly activates the AR experience using the hidden model-viewer.
   * @param {object} item - The food item object.
   */
  function launchAR(item) {
    if (!item?.model?.glb) {
      alert('AR model not available for this item.');
      return;
    }
    // Set the source of our hidden launcher
    arLauncher.src = item.model.glb;
    arLauncher.iosSrc = item.model.usdz || '';
    
    // Activate the AR experience
    arLauncher.activateAR();
  }

  /**
   * Injects a <link> tag into the head to start pre-downloading a model.
   * @param {string} modelUrl - The URL of the .glb model to preload.
   */
  function preloadModel(modelUrl) {
    const existingLink = document.querySelector(`link[href="${modelUrl}"]`);
    if (existingLink) return; // Don't preload more than once

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = modelUrl;
    link.as = 'fetch';
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }

  // --- Event Listeners ---
  categoryButtonsContainer.addEventListener('click', (e) => {
    const categoryButton = e.target.closest('button[data-category]');
    if (categoryButton) {
      showMenuView(categoryButton.dataset.category);
    }
  });

  menuItemsGrid.addEventListener('click', (e) => {
    const arButton = e.target.closest('.btn-ar');
    if (arButton) {
      const item = JSON.parse(arButton.dataset.item);
      launchAR(item); // Directly launch AR
    }
  });

  backBtn.addEventListener('click', showWelcomeView);
  waiterBtn.addEventListener('click', () => alert('Calling the waiter!'));

  // --- Start the App ---
  initializeApp();
});