document.addEventListener('DOMContentLoaded', () => {

  // --- DOM Elements ---
  const welcomeView = document.getElementById('welcome-view');
  const menuView = document.getElementById('menu-view');
  const loadingOverlay = document.getElementById('loading-overlay'); // New loader element
  const arLauncher = document.getElementById('ar-launcher');

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

    if (items[0].model.glb) {
      preloadModel(items[0].model.glb);
    }

    items.forEach(item => {
      const col = document.createElement('div');
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

  // --- AR and Performance Functions ---
  function launchAR(item) {
    if (!item?.model?.glb) {
      alert('AR model not available for this item.');
      return;
    }
    
    // **FIX:** Show the loading indicator immediately on click
    loadingOverlay.classList.remove('d-none');

    arLauncher.src = item.model.glb;
    arLauncher.iosSrc = item.model.usdz || '';
    
    // This starts the background loading and AR activation
    arLauncher.activateAR();
  }

  function preloadModel(modelUrl) {
    const existingLink = document.querySelector(`link[href="${modelUrl}"]`);
    if (existingLink) return;

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
      launchAR(item);
    }
  });
  
  // **FIX:** Listen for model-viewer events to hide the loader
  arLauncher.addEventListener('ar-status', (event) => {
    // Hide the loading overlay when the AR session starts OR if it fails
    if (event.detail.status === 'session-started' || event.detail.status === 'failed') {
      loadingOverlay.classList.add('d-none');
    }
  });

  backBtn.addEventListener('click', showWelcomeView);
  waiterBtn.addEventListener('click', () => alert('Calling the waiter!'));

  // --- Start the App ---
  initializeApp();
});