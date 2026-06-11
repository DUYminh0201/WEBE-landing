/**
 * Admin Dashboard Interactivity & CRUD Controls
 */

// Utility function to compress images before base64 storage
function compressImage(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (!window.db.isAdminLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  // Active state trackers for product creation
  let selectedColors = [];
  let selectedCombos = []; // Array of { minQty, price }
  let selectedImages = [];
  let currentDeleteId = null;

  // DOM Elements
  const btnLogout = document.getElementById('btnLogout');
  const menuItems = document.querySelectorAll('.menu-item');
  const sections = document.querySelectorAll('.dashboard-section');
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  
  // Tables
  const recentProductsTable = document.getElementById('recentProductsTable').querySelector('tbody');
  const allProductsTable = document.getElementById('allProductsTable').querySelector('tbody');

  // Modals
  const productModal = document.getElementById('productModal');
  const deleteModal = document.getElementById('deleteModal');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const btnCloseProductModal = document.getElementById('btnCloseProductModal');
  const btnCancelProductModal = document.getElementById('btnCancelProductModal');
  const btnCloseDeleteModal = document.getElementById('btnCloseDeleteModal');
  const btnCancelDeleteModal = document.getElementById('btnCancelDeleteModal');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');

  // Forms
  const productForm = document.getElementById('productForm');
  const changePasswordForm = document.getElementById('changePasswordForm');
  
  // Form Inputs
  const editProductIdInput = document.getElementById('editProductId');
  const prodNameInput = document.getElementById('prodName');
  const prodCategoryInput = document.getElementById('prodCategory');
  const prodGenderInput = document.getElementById('prodGender');
  const prodSmartCategoryInput = document.getElementById('prodSmartCategory');
  const prodPriceInput = document.getElementById('prodPrice');
  const prodComboPriceInput = document.getElementById('prodComboPrice');
  const prodComboMinQtyInput = document.getElementById('prodComboMinQty');
  const prodStockInput = document.getElementById('prodStock');
  const prodFreeShipThresholdInput = document.getElementById('prodFreeShipThreshold');
  const prodDescInput = document.getElementById('prodDesc');
  const prodColorInput = document.getElementById('prodColorInput');
  const btnAddColor = document.getElementById('btnAddColor');
  const btnAddCombo = document.getElementById('btnAddCombo');
  const comboTagsList = document.getElementById('comboTagsList');
  const colorTagsList = document.getElementById('colorTagsList');
  const colorStockContainer = document.getElementById('colorStockContainer');
  const imageDropzone = document.getElementById('imageDropzone');
  const imageFileInput = document.getElementById('imageFileInput');
  const imagePreviewGrid = document.getElementById('imagePreviewGrid');
  const toastContainer = document.getElementById('toastContainer');

  // Page Header Text mapping for categories
  const pageTitles = {
    'dashboard-section': { title: 'Tổng Quan', sub: 'Xin chào Quản trị viên, đây là số liệu thống kê thời gian thực.' },
    'products-section': { title: 'Quản Lý Sản Phẩm', sub: 'Thêm, sửa, hoặc xóa các sản phẩm trong danh mục của bạn.' },
    'orders-section': { title: 'Quản Lý Đơn Hàng', sub: 'Xem danh sách các đơn hàng và thực hiện đồng bộ với Google Sheets.' },
    'settings-section': { title: 'Thiết Lập Hệ Thống', sub: 'Thay đổi các cấu hình hệ thống và tài khoản quản trị.' }
  };

  /* ==========================================
     TOAST ALERTS UTILITY
     ========================================== */
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' 
      ? `<svg style="width: 20px; height: 20px; flex-shrink: 0;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
      : `<svg style="width: 20px; height: 20px; flex-shrink: 0;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'none';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Custom confirm dialog — works reliably on file:// and http:// (unlike native confirm()).
   * @param {string} title
   * @param {string} message
   * @param {Function} onConfirm  — called when user clicks "Xóa"
   */
  function showConfirmDialog(title, message, onConfirm) {
    // Remove any existing confirm dialog
    const existing = document.getElementById('_adminConfirmDialog');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = '_adminConfirmDialog';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
    `;

    overlay.innerHTML = `
      <div style="
        background: var(--bg-secondary, #1e1e2e);
        border: 1px solid var(--border-color, rgba(255,255,255,0.1));
        border-radius: 16px; padding: 28px 32px; max-width: 380px; width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        animation: fadeInScale 0.18s ease;
      ">
        <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; color: var(--text-primary, #fff);">
          ${title}
        </div>
        <div style="font-size: 0.9rem; color: var(--text-secondary, #aaa); margin-bottom: 24px;">
          ${message}
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button id="_confirmCancelBtn" style="
            padding: 9px 20px; border-radius: 8px; border: 1px solid var(--border-color, rgba(255,255,255,0.1));
            background: transparent; color: var(--text-primary, #fff); cursor: pointer; font-size: 0.9rem;
          ">Hủy</button>
          <button id="_confirmOkBtn" style="
            padding: 9px 20px; border-radius: 8px; border: none;
            background: #ef4444; color: #fff; cursor: pointer; font-size: 0.9rem; font-weight: 600;
          ">Xóa</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#_confirmOkBtn').addEventListener('click', () => {
      overlay.remove();
      onConfirm();
    });
    overlay.querySelector('#_confirmCancelBtn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  /* ==========================================
     AUTHENTICATION & SIDEBAR NAVIGATION
     ========================================== */
  // Logout handler
  btnLogout.addEventListener('click', () => {
    window.db.logoutAdmin();
    showToast('Đã đăng xuất khỏi hệ thống!', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  });

  // Sidebar navigation toggles
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      // Exclude logout footer item
      if (item.id === 'btnLogout') return;

      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const targetSection = item.getAttribute('data-target');
      sections.forEach(sec => {
        if (sec.id === targetSection) {
          sec.classList.add('active');
        } else {
          sec.classList.remove('active');
        }
      });

      // Update titles
      if (pageTitles[targetSection]) {
        pageTitle.textContent = pageTitles[targetSection].title;
        pageSubtitle.textContent = pageTitles[targetSection].sub;
      }
    });
  });

  /* ==========================================
     METRICS & DATA RENDERING
     ========================================== */
  // Helper to format price and multi-combo tiers
  function getPriceDisplayHTML(p) {
    let html = `<strong>Retail: $${parseFloat(p.price).toFixed(2)}</strong>`;
    if (p.combos && p.combos.length > 0) {
      html += '<div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px; font-size: 0.75rem; color: var(--accent);">';
      p.combos.forEach(c => {
        html += `<span style="font-weight: 600; white-space: nowrap;">Combo ${c.minQty}+: $${parseFloat(c.price).toFixed(2)}</span>`;
      });
      html += '</div>';
    } else if (p.comboPrice) {
      html += `<br><span style="font-size: 0.75rem; color: var(--accent); font-weight: 600;">Combo: $${parseFloat(p.comboPrice).toFixed(2)}</span>`;
    }
    return html;
  }

  function renderMetrics() {
    const products = window.db.getProducts();
    
    // Total products
    document.getElementById('metric-total-products').textContent = products.length;
    
    // Total inventory
    const totalStock = products.reduce((acc, p) => acc + parseInt(p.stock || 0), 0);
    document.getElementById('metric-total-stock').textContent = totalStock;

    // Unique Categories
    const categories = new Set(products.map(p => p.category));
    document.getElementById('metric-total-categories').textContent = categories.size;

    // Out of Stock / Low Stock (< 10)
    const lowStockCount = products.filter(p => parseInt(p.stock || 0) < 10).length;
    document.getElementById('metric-low-stock').textContent = lowStockCount;

    // Orders Count Stats
    const orders = window.db.getOrders();
    document.getElementById('metric-total-orders').textContent = orders.length;
    const unsyncedCount = orders.filter(o => !o.synced).length;
    document.getElementById('metric-unsynced-orders').textContent = unsyncedCount;
  }

  function getStockBreakdownText(sizeStocks) {
    if (!sizeStocks) return '';
    const firstKey = Object.keys(sizeStocks)[0];
    const isNested = firstKey && typeof sizeStocks[firstKey] === 'object';
    
    if (isNested) {
      return Object.entries(sizeStocks).map(([color, sizesObj]) => {
        const sizesStr = Object.entries(sizesObj)
          .map(([sz, qty]) => `${sz}:${qty}`)
          .join(', ');
        return `${color} (${sizesStr})`;
      }).join(' | ');
    } else {
      return Object.entries(sizeStocks).map(([sz, qty]) => `${sz}: ${qty}`).join(', ');
    }
  }

  function renderTables() {
    const products = window.db.getProducts();
    
    // Sort products by date (newest first)
    const sortedProducts = [...products].sort((a, b) => b.createdAt - a.createdAt);

    // Render Recent Products (Dashboard Section)
    recentProductsTable.innerHTML = '';
    const recent = sortedProducts.slice(0, 5);
    if (recent.length === 0) {
      recentProductsTable.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">Chưa có sản phẩm nào.</td></tr>`;
    } else {
    const recentRows = [];
      recent.forEach(p => {
        const thumb = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/150';
        const priceLabel = getPriceDisplayHTML(p);
          
        let stockBreakdown = '';
        if (p.sizeStocks) {
          stockBreakdown = '<br><span style="font-size: 0.75rem; color: var(--text-secondary);">' + 
            getStockBreakdownText(p.sizeStocks) + 
            '</span>';
        }
        
        recentRows.push(`
          <tr>
            <td>
              <div class="table-product-info">
                <img src="${thumb}" class="table-product-thumb" alt="${p.name}">
                <span class="table-product-name">${p.name}</span>
              </div>
            </td>
            <td><span class="badge badge-primary">${translateCategory(p.category)}${p.gender ? ` - ${translateGender(p.gender)}` : ''}</span></td>
            <td><strong>${priceLabel}</strong></td>
            <td>${p.stock > 10 ? p.stock : `<span style="color: var(--danger); font-weight: 600;">${p.stock} (Ít hàng)</span>`}${stockBreakdown}</td>
          </tr>
        `);
      });
      recentProductsTable.innerHTML = recentRows.join('');
    }

    // Render All Products (Products Section)
    allProductsTable.innerHTML = '';
    if (sortedProducts.length === 0) {
      allProductsTable.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">Chưa có sản phẩm nào.</td></tr>`;
    } else {
      const allRows = [];
      sortedProducts.forEach(p => {
        const thumb = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/150';
        
        // Colors list
        let colorsHtml = '<div class="color-badge-list" style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">';
        if (p.colors && p.colors.length > 0) {
          p.colors.forEach(c => {
            if (c.startsWith('#')) {
              colorsHtml += `<div class="color-dot" style="background-color: ${c};" title="${c}"></div>`;
            } else {
              const hex = getColorHex(c);
              if (hex) {
                colorsHtml += `<div class="color-dot" style="background-color: ${hex};" title="${c}"></div>`;
              } else {
                colorsHtml += `<span class="size-tag" style="font-size: 0.75rem; padding: 2px 6px; text-transform: capitalize;">${c}</span>`;
              }
            }
          });
        } else {
          colorsHtml += '<span style="color: var(--text-muted); font-size: 0.8rem;">Trống</span>';
        }
        colorsHtml += '</div>';

        // Sizes list
        let sizesHtml = '<div class="size-badge-list">';
        if (p.sizes && p.sizes.length > 0) {
          p.sizes.forEach(s => {
            sizesHtml += `<span class="size-tag">${s}</span>`;
          });
        } else {
          sizesHtml += '<span style="color: var(--text-muted); font-size: 0.8rem;">Trống</span>';
        }
        sizesHtml += '</div>';

        // Stock status
        let stockHtml = p.stock;
        if (p.stock === 0) {
          stockHtml = '<span class="badge badge-danger">Hết hàng</span>';
        } else if (p.stock < 10) {
          stockHtml = `<span class="badge badge-danger" style="background-color: rgba(239, 68, 68, 0.08);">${p.stock} chiếc</span>`;
        } else {
          stockHtml = `<span class="badge badge-success" style="background-color: rgba(16, 185, 129, 0.08);">${p.stock} chiếc</span>`;
        }
        
        let stockBreakdown = '';
        if (p.sizeStocks) {
          stockBreakdown = '<br><span style="font-size: 0.75rem; color: var(--text-secondary);">' + 
            getStockBreakdownText(p.sizeStocks) + 
            '</span>';
        }

        const priceLabel = getPriceDisplayHTML(p);

        allRows.push(`
          <tr>
            <td>
              <div class="table-product-info">
                <img src="${thumb}" class="table-product-thumb" alt="${p.name}">
                <span class="table-product-name">${p.name}</span>
              </div>
            </td>
            <td><span class="badge badge-primary">${translateCategory(p.category)}${p.gender ? ` - ${translateGender(p.gender)}` : ''}</span></td>
            <td><strong>${priceLabel}</strong></td>
            <td>${colorsHtml}</td>
            <td>${sizesHtml}</td>
            <td>${stockHtml}${stockBreakdown}</td>
            <td>
              <div class="table-actions">
                <button class="btn-table-action btn-edit" data-id="${p.id}" title="Sửa">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button class="btn-table-action btn-delete" data-id="${p.id}" data-name="${p.name}" title="Xóa" style="color: var(--danger, #ef4444);">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        `);
      });

      // Set innerHTML once — avoids innerHTML+= destroying event listeners on each iteration
      allProductsTable.innerHTML = allRows.join('');

      // Bind action buttons listener
      document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditProductModal(btn.getAttribute('data-id')));
      });

      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => openDeleteConfirmModal(btn.getAttribute('data-id'), btn.getAttribute('data-name')));
      });
    }
  }

  // Category translation helper
  function translateCategory(cat) {
    const mapping = {
      'Outerwear': 'Áo',
      'Trousers': 'Quần',
      'Footwear': 'Giày',
      'Accessories': 'Phụ kiện'
    };
    return mapping[cat] || cat;
  }

  // Gender translation helper
  function translateGender(gender) {
    const mapping = {
      'Men': 'Nam',
      'Women': 'Nữ',
      'Unisex': 'Unisex'
    };
    return mapping[gender] || gender;
  }

  /* ==========================================
     COLOR & IMAGE PICKER RENDERING & EVENT HANDLERS
     ========================================== */
  // Helper to map color names to hex codes for UI previews
  function getColorHex(colorName) {
    const name = colorName.trim().toLowerCase();
    const map = {
      'đen': '#000000',
      'black': '#000000',
      'trắng': '#ffffff',
      'white': '#ffffff',
      'đỏ': '#ff0000',
      'red': '#ff0000',
      'xanh': '#3b82f6',
      'blue': '#3b82f6',
      'xanh dương': '#3b82f6',
      'xanh lá': '#10b981',
      'green': '#10b981',
      'vàng': '#f59e0b',
      'yellow': '#f59e0b',
      'hồng': '#ec4899',
      'pink': '#ec4899',
      'cam': '#f97316',
      'orange': '#f97316',
      'tím': '#8b5cf6',
      'purple': '#8b5cf6',
      'nâu': '#78350f',
      'brown': '#78350f',
      'xám': '#6b7280',
      'gray': '#6b7280',
      'grey': '#6b7280',
      'xanh navy': '#1e3a8a',
      'navy': '#1e3a8a',
      'be': '#fef3c7',
      'beige': '#fef3c7',
      'kem': '#fffdec',
      'cream': '#fffdec'
    };
    return map[name] || null;
  }

  // Smart Category Change Handler to sync hidden Category and Gender inputs
  if (prodSmartCategoryInput) {
    prodSmartCategoryInput.addEventListener('change', () => {
      const val = prodSmartCategoryInput.value;
      if (val) {
        const parts = val.split('_');
        if (parts.length === 2) {
          if (prodCategoryInput) prodCategoryInput.value = parts[0];
          if (prodGenderInput) prodGenderInput.value = parts[1];
        }
        renderColorStockConfig();
        updateAdminTotalStock();
      }
    });
  }

  // Combo Pricing Tiers Logic
  if (btnAddCombo && comboTagsList) {
    btnAddCombo.addEventListener('click', () => {
      const qtyVal = parseInt(prodComboMinQtyInput.value);
      const priceVal = parseFloat(prodComboPriceInput.value);
      
      if (isNaN(qtyVal) || qtyVal < 2) {
        showToast('Số lượng tối thiểu của Combo phải từ 2 trở lên!', 'error');
        return;
      }
      if (isNaN(priceVal) || priceVal < 0) {
        showToast('Giá Combo phải là số hợp lệ từ 0 trở lên!', 'error');
        return;
      }
      
      const existsIdx = selectedCombos.findIndex(c => c.minQty === qtyVal);
      if (existsIdx !== -1) {
        selectedCombos[existsIdx].price = priceVal;
      } else {
        selectedCombos.push({ minQty: qtyVal, price: priceVal });
      }
      
      selectedCombos.sort((a, b) => a.minQty - b.minQty);
      renderComboTags();
      
      prodComboMinQtyInput.value = '';
      prodComboPriceInput.value = '';
    });
  }

  function renderComboTags() {
    if (!comboTagsList) return;
    comboTagsList.innerHTML = '';
    selectedCombos.forEach((combo, idx) => {
      const item = document.createElement('div');
      item.className = 'color-tag-item';
      item.style.backgroundColor = 'rgba(79, 70, 229, 0.08)';
      item.style.borderColor = 'rgba(79, 70, 229, 0.2)';
      
      item.innerHTML = `
        <span style="font-weight: 600; color: var(--accent); margin-right: 4px;">Combo ${combo.minQty}+ :</span>
        <span style="font-weight: 700;">$${combo.price.toFixed(2)}</span>
        <span class="combo-tag-remove" data-index="${idx}" style="cursor: pointer; margin-left: 8px; font-weight: bold; color: var(--text-muted);">&times;</span>
      `;
      comboTagsList.appendChild(item);
    });
    
    document.querySelectorAll('.combo-tag-remove').forEach(el => {
      el.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        selectedCombos.splice(index, 1);
        renderComboTags();
      });
    });
  }

  // Colors Selector Logic
  btnAddColor.addEventListener('click', () => {
    const colorVal = prodColorInput.value.trim();
    if (colorVal && !selectedColors.includes(colorVal)) {
      selectedColors.push(colorVal);
      renderColorTags();
      renderColorStockConfig();
      updateAdminTotalStock();
      prodColorInput.value = '';
    }
  });

  function renderColorTags() {
    colorTagsList.innerHTML = '';
    selectedColors.forEach((color, idx) => {
      const item = document.createElement('div');
      item.className = 'color-tag-item';
      
      let dotHtml = '';
      if (color.startsWith('#')) {
        dotHtml = `<div class="color-tag-dot" style="background-color: ${color};"></div>`;
      } else {
        const hex = getColorHex(color);
        if (hex) {
          dotHtml = `<div class="color-tag-dot" style="background-color: ${hex};"></div>`;
        }
      }

      item.innerHTML = `
        ${dotHtml}
        <span>${color}</span>
        <span class="color-tag-remove" data-index="${idx}">&times;</span>
      `;
      colorTagsList.appendChild(item);
    });

    // Remove handlers
    document.querySelectorAll('.color-tag-remove').forEach(el => {
      el.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        selectedColors.splice(index, 1);
        renderColorTags();
        renderColorStockConfig();
        updateAdminTotalStock();
      });
    });
  }

  // Drag & Drop Image Logic
  imageDropzone.addEventListener('click', () => imageFileInput.click());

  imageDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageDropzone.classList.add('dragover');
  });

  imageDropzone.addEventListener('dragleave', () => {
    imageDropzone.classList.remove('dragover');
  });

  imageDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    imageDropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  });

  imageFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFilesUpload(e.target.files);
    }
  });

  function handleFilesUpload(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chỉ chọn tệp hình ảnh!', 'error');
        return;
      }
      
      compressImage(file, 800, 800, 0.7)
        .then(compressedBase64 => {
          selectedImages.push(compressedBase64);
          renderImagePreviews();
        })
        .catch(err => {
          console.error("Lỗi nén ảnh:", err);
          showToast('Có lỗi xảy ra khi nén và tải ảnh lên!', 'error');
        });
    });
  }

  function renderImagePreviews() {
    imagePreviewGrid.innerHTML = '';
    selectedImages.forEach((src, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'preview-image-wrapper';
      wrapper.innerHTML = `
        <img src="${src}" alt="preview">
        <span class="preview-image-remove" data-index="${idx}">&times;</span>
      `;
      imagePreviewGrid.appendChild(wrapper);
    });

    // Remove image preview handlers
    document.querySelectorAll('.preview-image-remove').forEach(el => {
      el.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        selectedImages.splice(index, 1);
        renderImagePreviews();
      });
    });
  }

  /* ==========================================
     PRODUCT MODALS (CREATE, UPDATE & DELETE)
     ========================================== */
  // Open Add Product Modal
  btnOpenAddModal.addEventListener('click', () => {
    document.getElementById('modalProductTitle').textContent = 'Thêm Sản Phẩm Mới';
    editProductIdInput.value = '';
    productForm.reset();
    if (prodSmartCategoryInput) {
      prodSmartCategoryInput.value = 'Outerwear_Unisex';
    }
    if (prodCategoryInput) {
      prodCategoryInput.value = 'Outerwear';
    }
    if (prodGenderInput) {
      prodGenderInput.value = 'Unisex';
    }
    selectedColors = [];
    selectedCombos = [];
    renderComboTags();
    selectedImages = [];
    renderColorTags();
    renderImagePreviews();
    renderColorStockConfig();
    updateAdminTotalStock();
    
    productModal.classList.add('active');
  });

  // Open Edit Product Modal
  function openEditProductModal(id) {
    const product = window.db.getProductById(id);
    if (!product) {
      showToast('Không tìm thấy sản phẩm này!', 'error');
      return;
    }

    document.getElementById('modalProductTitle').textContent = 'Chỉnh Sửa Sản Phẩm';
    editProductIdInput.value = product.id;
    prodNameInput.value = product.name;
    prodCategoryInput.value = product.category;
    if (prodGenderInput) {
      prodGenderInput.value = product.gender || 'Unisex';
    }
    if (prodSmartCategoryInput) {
      prodSmartCategoryInput.value = `${product.category}_${product.gender || 'Unisex'}`;
    }
    prodPriceInput.value = product.price;
    if (prodComboPriceInput) {
      prodComboPriceInput.value = product.comboPrice || '';
    }
    if (prodComboMinQtyInput) {
      prodComboMinQtyInput.value = product.comboMinQty || 2;
    }
    prodStockInput.value = product.stock;
    if (prodFreeShipThresholdInput) {
      prodFreeShipThresholdInput.value = product.freeShipThreshold !== undefined && product.freeShipThreshold !== null ? product.freeShipThreshold : '';
    }
    prodDescInput.value = product.description || '';
    
    // Combos
    selectedCombos = [...(product.combos || [])];
    if (selectedCombos.length === 0 && product.comboPrice) {
      selectedCombos.push({ minQty: product.comboMinQty || 2, price: product.comboPrice });
    }
    renderComboTags();

    // Colors
    selectedColors = [...(product.colors || [])];
    renderColorTags();

    // Images
    selectedImages = [...(product.images || [])];
    renderImagePreviews();

    // Populate color-specific stock inputs
    renderColorStockConfig(product.sizeStocks);
    updateAdminTotalStock();

    productModal.classList.add('active');
  }

  // Open Delete Confirm Modal
  function openDeleteConfirmModal(id, name) {
    currentDeleteId = id;
    document.getElementById('deleteProductName').textContent = `"${name}"`;
    deleteModal.classList.add('active');
  }

  // Close Modals
  function closeAllModals() {
    productModal.classList.remove('active');
    deleteModal.classList.remove('active');
    currentDeleteId = null;
  }

  btnCloseProductModal.addEventListener('click', closeAllModals);
  btnCancelProductModal.addEventListener('click', closeAllModals);
  btnCloseDeleteModal.addEventListener('click', closeAllModals);
  btnCancelDeleteModal.addEventListener('click', closeAllModals);

  // Close modals clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === productModal || e.target === deleteModal) {
      closeAllModals();
    }
  });

  /* ==========================================
     CRUD FORM SUBMISSIONS
     ========================================== */
  // Product Save Submit Handler
  productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = prodNameInput.value.trim();
    const category = prodCategoryInput.value;
    const gender = prodGenderInput ? prodGenderInput.value : 'Unisex';
    const price = parseFloat(prodPriceInput.value);
    const comboPrice = prodComboPriceInput ? parseFloat(prodComboPriceInput.value) || 0 : 0;
    const comboMinQty = prodComboMinQtyInput ? parseInt(prodComboMinQtyInput.value) || 2 : 2;
    const description = prodDescInput.value.trim();

    // Assemble dynamic sizes list and sizeStocks nested object
    const sizesSet = new Set();
    const sizeStocks = {};
    let totalStock = 0;

    const colorsToSave = selectedColors.length > 0 ? selectedColors : ['default'];
    const smartCategoryVal = prodSmartCategoryInput ? prodSmartCategoryInput.value : '';
    const sizesList = getSizesListByCategory(smartCategoryVal);

    colorsToSave.forEach(color => {
      sizeStocks[color] = {};
      sizesList.forEach(size => {
        const input = document.querySelector(`.size-stock-field[data-color="${color}"][data-size="${size}"]`);
        if (input && input.value !== '') {
          const qty = parseInt(input.value) || 0;
          sizeStocks[color][size] = qty;
          sizesSet.add(size);
          totalStock += qty;
        }
      });
      // If a color has no sizes defined, we can just delete it or keep an empty object
      if (Object.keys(sizeStocks[color]).length === 0) {
        delete sizeStocks[color];
      }
    });

    const sizes = Array.from(sizesSet);

    // Validations
    if (!name || isNaN(price) || (prodComboPriceInput && isNaN(comboPrice))) {
      showToast('Vui lòng nhập đầy đủ các trường bắt buộc!', 'error');
      return;
    }

    if (sizes.length === 0) {
      showToast('Vui lòng nhập số lượng cho ít nhất một kích thước (size)!', 'error');
      return;
    }

    if (selectedImages.length === 0) {
      showToast('Vui lòng thêm ít nhất một ảnh sản phẩm!', 'error');
      return;
    }

    // Assemble product object
    const freeShipRaw = prodFreeShipThresholdInput ? prodFreeShipThresholdInput.value.trim() : '';
    const freeShipThreshold = freeShipRaw !== '' ? parseFloat(freeShipRaw) : null;

    const productData = {
      name,
      category,
      gender,
      price,
      comboPrice: selectedCombos[0] ? selectedCombos[0].price : 0,
      comboMinQty: selectedCombos[0] ? selectedCombos[0].minQty : 2,
      combos: selectedCombos,
      freeShipThreshold,
      stock: totalStock,
      sizeStocks,
      description,
      colors: selectedColors,
      sizes: sizes,
      images: selectedImages
    };

    const editId = editProductIdInput.value;
    if (editId) {
      productData.id = editId;
    }

    // Save database
    window.db.saveProduct(productData);
    
    closeAllModals();
    renderMetrics();
    renderTables();
    
    showToast(editId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm mới thành công!', 'success');
  });

  // Delete Action Confirm Handler
  btnConfirmDelete.addEventListener('click', () => {
    if (!currentDeleteId) return;

    if (window.db.deleteProduct(currentDeleteId)) {
      showToast('Đã xóa sản phẩm thành công!', 'success');
    } else {
      showToast('Có lỗi xảy ra khi xóa sản phẩm!', 'error');
    }

    closeAllModals();
    renderMetrics();
    renderTables();
  });

  /* ==========================================
     ADMIN PASSWORD UPDATE
     ========================================== */
  changePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newPass = document.getElementById('newPassword').value;
    const confirmNewPass = document.getElementById('confirmNewPassword').value;

    if (newPass.length < 6) {
      showToast('Mật khẩu mới phải từ 6 ký tự trở lên!', 'error');
      return;
    }

    if (newPass !== confirmNewPass) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }

    window.db.changeAdminPassword(newPass);
    showToast('Thay đổi mật khẩu thành công!', 'success');
    changePasswordForm.reset();
  });

  /* ==========================================
     ORDERS MANAGEMENT & GG SHEET SYNC INTERACTIVE LOGIC
     ========================================== */
  const allOrdersTable = document.getElementById('allOrdersTable') ? document.getElementById('allOrdersTable').querySelector('tbody') : null;
  const selectAllOrdersCheckbox = document.getElementById('selectAllOrders');
  
  // Bulk Actions elements
  const btnBulkActions = document.getElementById('btnBulkActions');
  const bulkActionsMenu = document.getElementById('bulkActionsMenu');
  const btnBulkSync = document.getElementById('btnBulkSync');
  const btnBulkMarkSynced = document.getElementById('btnBulkMarkSynced');
  const btnBulkMarkUnsynced = document.getElementById('btnBulkMarkUnsynced');
  const btnBulkDelete = document.getElementById('btnBulkDelete');
  
  // Sheet settings modals
  const sheetSettingsModal = document.getElementById('sheetSettingsModal');
  const btnOpenSheetSettings = document.getElementById('btnOpenSheetSettings');
  const btnCloseSheetSettingsModal = document.getElementById('btnCloseSheetSettingsModal');
  const btnCancelSheetSettings = document.getElementById('btnCancelSheetSettings');
  const sheetSettingsForm = document.getElementById('sheetSettingsForm');
  const googleSheetUrlInput = document.getElementById('googleSheetUrl');
  
  // Code sample modal
  const scriptSampleModal = document.getElementById('scriptSampleModal');
  const btnShowScriptSample = document.getElementById('btnShowScriptSample');
  const btnCloseScriptSampleModal = document.getElementById('btnCloseScriptSampleModal');
  const btnCopyScriptCode = document.getElementById('btnCopyScriptCode');
  const appsScriptCodeSampleText = document.getElementById('appsScriptCodeSample');

  // Load and render orders
  function renderOrdersTable() {
    if (!allOrdersTable) return;
    const orders = window.db.getOrders();
    const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);
    
    allOrdersTable.innerHTML = '';
    
    if (sortedOrders.length === 0) {
      allOrdersTable.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-secondary);">Chưa có đơn đặt hàng nào.</td></tr>`;
      return;
    }
    
    const rows = [];
    sortedOrders.forEach(order => {
      // Customer details column
      const customerInfo = `
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem;">
          <strong>${order.customerName}</strong>
          <span>SĐT: ${order.customerPhone}</span>
          <span style="color: var(--text-secondary); max-width: 250px; white-space: normal; word-break: break-all;">Đ/C: ${order.customerAddress}</span>
        </div>
      `;
      
      // Products list summary
      let productsHtml = '<div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem;">';
      order.items.forEach(item => {
        const colorLabel = item.color !== 'default' 
          ? `<span class="color-dot" style="background-color: ${item.color}; display: inline-block; vertical-align: middle; width: 10px; height: 10px; margin-right: 4px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2);" title="${item.color}"></span>`
          : '<span style="color: var(--text-muted);">Mặc định</span>';
        productsHtml += `
          <div>
            • ${item.name} (${colorLabel} | Size: <span class="size-tag">${item.size}</span>) x <strong>${item.qty}</strong>
          </div>
        `;
      });
      productsHtml += '</div>';
      
      // Sync badge
      const syncBadge = order.synced 
        ? `<span class="badge badge-success" style="background-color: rgba(16, 185, 129, 0.08); display: flex; align-items: center; gap: 4px; width: fit-content;">
            <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
            Đã đồng bộ
           </span>`
        : `<span class="badge" style="background-color: rgba(245, 158, 11, 0.08); color: var(--warning); display: flex; align-items: center; gap: 4px; width: fit-content;">
            <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5"></path></svg>
            Chưa đồng bộ
           </span>`;

      // Actions (Single Sync + Delete Order option)
      const actionBtn = order.synced 
        ? `<button class="btn-table-action btn-sync-single" data-id="${order.id}" disabled title="Đã đồng bộ" style="opacity: 0.4; cursor: not-allowed;">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
           </button>`
        : `<button class="btn-table-action btn-sync-single" data-id="${order.id}" title="Đồng bộ ngay">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5"></path></svg>
           </button>`;

      const deleteBtn = `<button class="btn-table-action btn-delete-order" data-id="${order.id}" title="Xóa đơn hàng" style="color: var(--danger, #ef4444);">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
         </button>`;

      rows.push(`
        <tr class="order-row ${order.synced ? 'synced' : 'unsynced'}">
          <td><input type="checkbox" class="order-checkbox" data-id="${order.id}"></td>
          <td><strong>#${order.id.replace('ORD_', '')}</strong></td>
          <td>${customerInfo}</td>
          <td>${productsHtml}</td>
          <td><strong>$${parseFloat(order.totalAmount).toFixed(2)}</strong></td>
          <td>${new Date(order.createdAt).toLocaleString('vi-VN')}</td>
          <td>${syncBadge}</td>
          <td>
            <div class="table-actions">
              ${actionBtn}
              ${deleteBtn}
            </div>
          </td>
        </tr>
      `);
    });

    // Set innerHTML once — avoids the innerHTML+= loop that destroys event listeners
    allOrdersTable.innerHTML = rows.join('');
    
    // Bind checkbox listeners to update state if they click select-all or single select
    document.querySelectorAll('.order-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const checkedCount = document.querySelectorAll('.order-checkbox:checked').length;
        const totalCheckboxes = document.querySelectorAll('.order-checkbox').length;
        if (selectAllOrdersCheckbox) selectAllOrdersCheckbox.checked = checkedCount === totalCheckboxes && totalCheckboxes > 0;
        updateBulkActionsState();
      });
    });

    // Bind sync single order listeners
    document.querySelectorAll('.btn-sync-single').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        syncOrders([id]);
      });
    });

    // Bind delete order listeners
    document.querySelectorAll('.btn-delete-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const shortId = id.replace('ORD_', '');
        showConfirmDialog(
          `Xóa đơn hàng #${shortId}?`,
          'Thao tác này không thể hoàn tác.',
          () => {
            if (window.db.deleteOrder(id)) {
              showToast('Đã xóa đơn hàng thành công!', 'success');
            } else {
              showToast('Có lỗi xảy ra khi xóa đơn hàng!', 'error');
            }
            renderMetrics();
            renderOrdersTable();
          }
        );
      });
    });

    // Reset bulk actions state on render
    updateBulkActionsState();
  }

  // Helper to update bulk actions dropdown button state and count
  function updateBulkActionsState() {
    const checkedCount = document.querySelectorAll('.order-checkbox:checked').length;
    if (btnBulkActions) {
      btnBulkActions.disabled = checkedCount === 0;
      const span = btnBulkActions.querySelector('span');
      if (span) {
        span.textContent = `Thao tác hàng loạt (${checkedCount})`;
      }
    }
  }

  // Handle select-all checkbox change
  if (selectAllOrdersCheckbox) {
    selectAllOrdersCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.querySelectorAll('.order-checkbox').forEach(cb => {
        cb.checked = isChecked;
      });
      updateBulkActionsState();
    });
  }

  // Open sheets settings modal
  if (btnOpenSheetSettings) {
    btnOpenSheetSettings.addEventListener('click', () => {
      googleSheetUrlInput.value = window.db.getGoogleSheetsUrl();
      sheetSettingsModal.classList.add('active');
    });
  }

  function closeSheetSettingsModal() {
    sheetSettingsModal.classList.remove('active');
    sheetSettingsForm.reset();
  }

  if (btnCloseSheetSettingsModal) btnCloseSheetSettingsModal.addEventListener('click', closeSheetSettingsModal);
  if (btnCancelSheetSettings) btnCancelSheetSettings.addEventListener('click', closeSheetSettingsModal);
  if (sheetSettingsModal) {
    sheetSettingsModal.addEventListener('click', (e) => {
      if (e.target === sheetSettingsModal) {
        closeSheetSettingsModal();
      }
    });
  }

  // Save sheets configuration URL
  if (sheetSettingsForm) {
    sheetSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = googleSheetUrlInput.value.trim();
      window.db.saveGoogleSheetsUrl(url);
      showToast('Cấu hình Google Sheets đã được lưu thành công!', 'success');
      closeSheetSettingsModal();
    });
  }

  // Script Sample Modals
  if (btnShowScriptSample) {
    btnShowScriptSample.addEventListener('click', () => {
      scriptSampleModal.classList.add('active');
    });
  }

  function closeScriptSampleModal() {
    scriptSampleModal.classList.remove('active');
  }

  if (btnCloseScriptSampleModal) btnCloseScriptSampleModal.addEventListener('click', closeScriptSampleModal);
  if (scriptSampleModal) {
    scriptSampleModal.addEventListener('click', (e) => {
      if (e.target === scriptSampleModal) {
        closeScriptSampleModal();
      }
    });
  }

  // Copy code sample to clipboard
  if (btnCopyScriptCode) {
    btnCopyScriptCode.addEventListener('click', () => {
      appsScriptCodeSampleText.select();
      appsScriptCodeSampleText.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(appsScriptCodeSampleText.value)
        .then(() => {
          showToast('Đã sao chép mã nguồn Apps Script vào bộ nhớ tạm!', 'success');
        })
        .catch(() => {
          showToast('Không thể sao chép tự động, vui lòng tự bôi đen và sao chép!', 'error');
        });
    });
  }

  // Execute sync function
  async function syncOrders(orderIds) {
    const validOrderIds = orderIds.filter(id => {
      const order = window.db.getOrderById(id);
      return order && !order.synced;
    });

    if (validOrderIds.length === 0) {
      showToast('Không có đơn hàng nào cần đồng bộ trong danh sách đã chọn!', 'error');
      return;
    }

    const sheetUrl = window.db.getGoogleSheetsUrl();

    // If no Google Sheet Webhook configured, offer simulated sync
    if (!sheetUrl) {
      const confirmMock = confirm(
        'Bạn chưa cấu hình URL Google Sheets. Bạn có muốn GIẢ LẬP ĐỒNG BỘ thành công cho các đơn hàng chưa đồng bộ đã chọn để kiểm tra giao diện?'
      );
      if (confirmMock) {
        validOrderIds.forEach(id => {
          const order = window.db.getOrderById(id);
          if (order) {
            order.synced = true;
            window.db.saveOrder(order);
          }
        });
        showToast(`[Giả Lập] Đồng bộ thành công ${validOrderIds.length} đơn hàng!`, 'success');
        renderMetrics();
        renderOrdersTable();
      }
      return;
    }

    // Perform actual sync
    const btnTarget = document.getElementById('btnBulkSync') || btnBulkActions;
    const originalBtnHtml = btnTarget ? btnTarget.innerHTML : '';
    if (btnTarget) {
      btnTarget.disabled = true;
      btnTarget.innerHTML = `
        <svg style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 4px; animation: spin 1s linear infinite;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5"></path>
        </svg>
        Đang đồng bộ...
      `;
    }

    let successCount = 0;
    let failCount = 0;

    for (let id of validOrderIds) {
      const order = window.db.getOrderById(id);
      if (!order) continue;

      try {
        await fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });

        // Set synced to true
        order.synced = true;
        window.db.saveOrder(order);
        successCount++;
      } catch (err) {
        console.error(`Fetch error syncing order ${id}:`, err);
        failCount++;
      }
    }

    // Restore button
    if (btnTarget) {
      btnTarget.disabled = false;
      btnTarget.innerHTML = originalBtnHtml;
    }

    if (successCount > 0) {
      showToast(`Đã đồng bộ thành công ${successCount} đơn hàng lên Google Sheets!`, 'success');
    }
    if (failCount > 0) {
      showToast(`Không thể đồng bộ ${failCount} đơn hàng do lỗi mạng!`, 'error');
    }

    // Uncheck select-all checkbox
    if (selectAllOrdersCheckbox) selectAllOrdersCheckbox.checked = false;

    // Refresh view
    renderMetrics();
    renderOrdersTable();
  }

  // Helper to get checked order IDs
  function getSelectedOrderIds() {
    const ids = [];
    document.querySelectorAll('.order-checkbox:checked').forEach(cb => {
      ids.push(cb.getAttribute('data-id'));
    });
    return ids;
  }

  // Toggle Bulk Actions dropdown menu visibility
  if (btnBulkActions && bulkActionsMenu) {
    btnBulkActions.addEventListener('click', (e) => {
      e.stopPropagation();
      bulkActionsMenu.classList.toggle('active');
      const arrowIcon = document.getElementById('arrowIcon');
      if (arrowIcon) {
        arrowIcon.style.transform = bulkActionsMenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });

    document.addEventListener('click', () => {
      bulkActionsMenu.classList.remove('active');
      const arrowIcon = document.getElementById('arrowIcon');
      if (arrowIcon) {
        arrowIcon.style.transform = 'rotate(0deg)';
      }
    });
  }

  // Hook Bulk Sync menu option click
  if (btnBulkSync) {
    btnBulkSync.addEventListener('click', () => {
      const ids = getSelectedOrderIds();
      syncOrders(ids);
    });
  }

  // Hook Bulk Mark Synced menu option click
  if (btnBulkMarkSynced) {
    btnBulkMarkSynced.addEventListener('click', () => {
      const ids = getSelectedOrderIds();
      if (ids.length === 0) return;

      let successCount = 0;
      ids.forEach(id => {
        const order = window.db.getOrderById(id);
        if (order && !order.synced) {
          order.synced = true;
          window.db.saveOrder(order);
          successCount++;
        }
      });

      showToast(`Đã đánh dấu đồng bộ ${successCount} đơn hàng thành công!`, 'success');
      if (selectAllOrdersCheckbox) selectAllOrdersCheckbox.checked = false;
      renderMetrics();
      renderOrdersTable();
    });
  }

  // Hook Bulk Mark Unsynced menu option click
  if (btnBulkMarkUnsynced) {
    btnBulkMarkUnsynced.addEventListener('click', () => {
      const ids = getSelectedOrderIds();
      if (ids.length === 0) return;

      let successCount = 0;
      ids.forEach(id => {
        const order = window.db.getOrderById(id);
        if (order && order.synced) {
          order.synced = false;
          window.db.saveOrder(order);
          successCount++;
        }
      });

      showToast(`Đã hủy trạng thái đồng bộ ${successCount} đơn hàng!`, 'success');
      if (selectAllOrdersCheckbox) selectAllOrdersCheckbox.checked = false;
      renderMetrics();
      renderOrdersTable();
    });
  }

  // Hook Bulk Delete menu option click
  if (btnBulkDelete) {
    btnBulkDelete.addEventListener('click', () => {
      const ids = getSelectedOrderIds();
      if (ids.length === 0) return;

      if (confirm(`Bạn có chắc chắn muốn xóa ${ids.length} đơn đặt hàng đã chọn không? Thao tác này không thể hoàn tác.`)) {
        let successCount = 0;
        ids.forEach(id => {
          if (window.db.deleteOrder(id)) {
            successCount++;
          }
        });
        showToast(`Đã xóa thành công ${successCount}/${ids.length} đơn hàng!`, 'success');

        if (selectAllOrdersCheckbox) selectAllOrdersCheckbox.checked = false;
        renderMetrics();
        renderOrdersTable();
      }
    });
  }

  // Initial Load calls
  renderMetrics();
  renderTables();
  renderOrdersTable();

  // Listen to Firestore real-time database updates
  document.addEventListener('db-updated', (e) => {
    renderMetrics();
    renderTables();
    renderOrdersTable();
  });

  // Helper to recalculate total stock dynamically
  function updateAdminTotalStock() {
    let total = 0;
    document.querySelectorAll('.size-stock-field').forEach(input => {
      total += parseInt(input.value) || 0;
    });
    if (prodStockInput) prodStockInput.value = total;
  }

  // Helper to determine sizes by category
  function getSizesListByCategory(smartCategoryVal) {
    if (!smartCategoryVal) return ['S', 'M', 'L', 'XL', '2XL', '3XL'];
    if (smartCategoryVal.startsWith('Footwear')) {
      return ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    } else if (smartCategoryVal.startsWith('Accessories')) {
      return ['Free Size'];
    } else {
      return ['S', 'M', 'L', 'XL', '2XL', '3XL'];
    }
  }

  function renderColorStockConfig(existingSizeStocks = null) {
    if (!colorStockContainer) return;
    
    // Read current input values first (to preserve what they have typed)
    const currentValues = {};
    document.querySelectorAll('.size-stock-field').forEach(input => {
      const color = input.getAttribute('data-color');
      const size = input.getAttribute('data-size');
      const val = input.value;
      if (!currentValues[color]) currentValues[color] = {};
      currentValues[color][size] = val;
    });

    colorStockContainer.innerHTML = '';
    
    const smartCategoryVal = prodSmartCategoryInput ? prodSmartCategoryInput.value : '';
    const sizesList = getSizesListByCategory(smartCategoryVal);

    // If no colors are configured, show a "default" block
    const colorsToRender = selectedColors.length > 0 ? selectedColors : ['default'];

    colorsToRender.forEach(color => {
      const block = document.createElement('div');
      block.className = 'color-stock-block';
      
      const displayName = color === 'default' ? 'Mặc định (Không chia màu)' : `Màu: ${color}`;
      
      let gridHtml = '';
      sizesList.forEach(size => {
        // Find existing value
        let val = '';
        if (existingSizeStocks) {
          if (existingSizeStocks[color] && existingSizeStocks[color][size] !== undefined) {
            val = existingSizeStocks[color][size];
          } else if (existingSizeStocks[size] !== undefined && (color === 'default' || color === 'Mặc định')) {
            // legacy flat sizeStocks compatibility
            val = existingSizeStocks[size];
          }
        } else if (currentValues[color] && currentValues[color][size] !== undefined) {
          val = currentValues[color][size];
        }
        
        gridHtml += `
          <div class="size-stock-input-wrapper">
            <span class="size-stock-label">${size}</span>
            <input type="number" class="size-stock-field" data-color="${color}" data-size="${size}" placeholder="SL" min="0" value="${val !== null && val !== undefined ? val : ''}">
          </div>
        `;
      });

      block.innerHTML = `
        <h4 class="color-stock-title">
          <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/></svg>
          <span>${displayName}</span>
        </h4>
        <div class="color-stock-grid">
          ${gridHtml}
        </div>
      `;
      colorStockContainer.appendChild(block);
    });

    // Bind inputs to recalculate total stock on change
    document.querySelectorAll('.size-stock-field').forEach(input => {
      input.addEventListener('input', updateAdminTotalStock);
    });
  }

  // Listen to database errors
  document.addEventListener('db-error', (e) => {
    showToast(e.detail.message, 'error');
  });
});
