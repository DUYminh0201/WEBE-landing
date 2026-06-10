/**
 * Database and Session Management Module (Local Storage Mock DB)
 */

const DB_PRODUCTS_KEY = 'fashion_store_products';
const DB_ADMIN_KEY = 'fashion_store_admin';

// Default mock products to seed the DB
const DEFAULT_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Oversized Premium Velvet Bomber',
    description: 'Elevate your urban style with our signature Oversized Velvet Bomber Jacket. Featuring heavy-duty gunmetal zipper detailing, double-stitched ribbed trims, and a luxurious quilted interior lining for superior warmth. Perfectly pairs with relaxed denim or structured trousers.',
    price: 189.00,
    comboPrice: 159.00,
    category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Đen', 'Xanh Navy', 'Nâu'],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeStocks: {
      'Đen': { S: 2, M: 3, L: 2, XL: 1 },
      'Xanh Navy': { S: 2, M: 3, L: 2, XL: 1 },
      'Nâu': { S: 2, M: 2, L: 2, XL: 2 }
    },
    stock: 24,
    createdAt: new Date('2026-05-01').getTime()
  },
  {
    id: 'prod_2',
    name: 'Minimalist Sand Linen Trousers',
    description: 'Crafted from a premium lightweight linen-cotton blend. Designed with a clean-front waistband, adjustable internal drawstrings, and a modern relaxed straight-leg drape. Ideal for warm weather sophistication and off-duty elegance.',
    price: 95.00,
    comboPrice: 79.00,
    category: 'Trousers',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Be', 'Trắng', 'Đen'],
    sizes: ['XS', 'S', 'M', 'L'],
    sizeStocks: {
      'Be': { XS: 1, S: 2, M: 1, L: 1 },
      'Trắng': { XS: 1, S: 1, M: 2, L: 1 },
      'Đen': { XS: 1, S: 1, M: 2, L: 1 }
    },
    stock: 15,
    createdAt: new Date('2026-05-15').getTime()
  },
  {
    id: 'prod_3',
    name: 'Signature Gold-Trim Hooded Knit',
    description: 'A heavyweight french terry knit hoodie defined by subtle hand-stitched gold accents on the drawstrings and emblem. Boasts a dropped shoulder silhouette and double-lined hood for the ultimate structural fit.',
    price: 125.00,
    comboPrice: 99.00,
    category: 'Streetwear',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Đen', 'Trắng', 'Vàng Gold'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizeStocks: {
      'Đen': { S: 3, M: 4, L: 3, XL: 2, XXL: 2 },
      'Trắng': { S: 4, M: 4, L: 3, XL: 2, XXL: 1 },
      'Vàng Gold': { S: 3, M: 4, L: 4, XL: 2, XXL: 1 }
    },
    stock: 42,
    createdAt: new Date('2026-06-01').getTime()
  },
  {
    id: 'prod_4',
    name: 'Sleek Leather Chelsea Boots',
    description: 'Constructed from full-grain Italian calfskin leather. Built with comfortable elastic side panels, a pull-loop, and a robust stacked leather sole with rubber grip. A versatile classic designed to age beautifully.',
    price: 240.00,
    comboPrice: 210.00,
    category: 'Footwear',
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800'
    ],
    colors: ['Nâu Sẫm', 'Đen'],
    sizes: ['M', 'L', 'XL'],
    sizeStocks: {
      'Nâu Sẫm': { M: 1, L: 2, XL: 1 },
      'Đen': { M: 1, L: 2, XL: 1 }
    },
    stock: 8,
    createdAt: new Date('2026-06-05').getTime()
  }
];

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

// Initialize DB if not set
function initDB() {
  if (!localStorage.getItem(DB_PRODUCTS_KEY)) {
    localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  } else {
    // Migration: make sure all products in local storage have sizeStocks and comboPrice
    try {
      const products = JSON.parse(localStorage.getItem(DB_PRODUCTS_KEY)) || [];
      let migrated = false;
      products.forEach(p => {
        if (p.price && !p.comboPrice) {
          p.comboPrice = Math.round(p.price * 0.85);
          migrated = true;
        }
        
        // Ensure sizeStocks structure is nested under color names
        if (!p.sizeStocks) {
          p.sizeStocks = {};
          if (p.sizes && p.sizes.length > 0) {
            const defaultStock = Math.floor(p.stock / p.sizes.length);
            const flatStocks = {};
            p.sizes.forEach((size, index) => {
              if (index === p.sizes.length - 1) {
                flatStocks[size] = p.stock - (defaultStock * index);
              } else {
                flatStocks[size] = defaultStock;
              }
            });
            
            if (p.colors && p.colors.length > 0) {
              p.colors.forEach(col => {
                p.sizeStocks[col] = { ...flatStocks };
              });
            } else {
              p.sizeStocks['default'] = { ...flatStocks };
            }
          } else {
            p.sizeStocks['default'] = {};
          }
          migrated = true;
        } else {
          // If sizeStocks is flat, nest it
          const keys = Object.keys(p.sizeStocks);
          const firstKey = keys[0];
          const isNested = firstKey && typeof p.sizeStocks[firstKey] === 'object';
          
          if (keys.length > 0 && !isNested) {
            const flatStocks = { ...p.sizeStocks };
            p.sizeStocks = {};
            if (p.colors && p.colors.length > 0) {
              p.colors.forEach(col => {
                p.sizeStocks[col] = { ...flatStocks };
              });
            } else {
              p.sizeStocks['default'] = { ...flatStocks };
            }
            migrated = true;
          }
        }
      });
      if (migrated) {
        localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(products));
      }
    } catch (e) {
      console.error("Failed to migrate products storage:", e);
    }
  }
  if (!localStorage.getItem(DB_ADMIN_KEY)) {
    localStorage.setItem(DB_ADMIN_KEY, JSON.stringify(DEFAULT_ADMIN));
  }
}

// Ensure database is initialized
initDB();

// Caches for Firestore Database (real-time sync)
const dbCaches = {
  products: [],
  orders: [],
  settings: { googleSheetsUrl: '', adminPassword: 'admin123' }
};

if (window.firebaseEnabled) {
  // 1. Seed Firestore with default products if empty and not seeded before
  window.firebaseDb.collection('settings').doc('global').get().then(doc => {
    const isSeeded = doc.exists && doc.data().seeded;
    if (!isSeeded) {
      window.firebaseDb.collection('products').get().then(snapshot => {
        if (snapshot.empty) {
          console.log("🌱 Seeding Firestore with default products...");
          DEFAULT_PRODUCTS.forEach(p => {
            const pId = p.id;
            const data = { ...p };
            delete data.id;
            window.firebaseDb.collection('products').doc(pId).set(data);
          });
          // Mark as seeded
          window.firebaseDb.collection('settings').doc('global').set({ seeded: true }, { merge: true });
        }
      });
    }
  });

  // 2. Real-time products sync
  window.firebaseDb.collection('products').onSnapshot(snapshot => {
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    dbCaches.products = products;
    document.dispatchEvent(new CustomEvent('db-updated', { detail: { type: 'products', data: products } }));
  }, error => {
    console.error("Firestore products sync error:", error);
  });

  // 3. Real-time orders sync
  window.firebaseDb.collection('orders').onSnapshot(snapshot => {
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    orders.sort((a, b) => b.createdAt - a.createdAt);
    dbCaches.orders = orders;
    document.dispatchEvent(new CustomEvent('db-updated', { detail: { type: 'orders', data: orders } }));
  }, error => {
    console.error("Firestore orders sync error:", error);
  });

  // 4. Real-time settings sync
  window.firebaseDb.collection('settings').doc('global').onSnapshot(doc => {
    if (doc.exists) {
      dbCaches.settings = doc.data();
    } else {
      window.firebaseDb.collection('settings').doc('global').set({
        googleSheetsUrl: localStorage.getItem('fashion_store_google_sheets_url') || '',
        adminPassword: 'admin123'
      });
    }
    document.dispatchEvent(new CustomEvent('db-updated', { detail: { type: 'settings', data: dbCaches.settings } }));
  }, error => {
    console.error("Firestore settings sync error:", error);
  });
}

const db = {
  // PRODUCTS CRUD
  getProducts() {
    if (window.firebaseEnabled) {
      return dbCaches.products;
    }
    return JSON.parse(localStorage.getItem(DB_PRODUCTS_KEY)) || [];
  },

  getProductById(id) {
    if (window.firebaseEnabled) {
      return dbCaches.products.find(p => p.id === id) || null;
    }
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  saveProduct(product) {
    if (window.firebaseEnabled) {
      const data = { ...product };
      let pId = product.id;
      if (pId) {
        delete data.id;
        data.updatedAt = Date.now();
        // Merge with existing cached product fields to preserve createdAt, etc.
        const existing = this.getProductById(pId);
        const finalData = { ...existing, ...data };
        delete finalData.id;
        // Overwrite without merge:true to correctly delete removed fields (like sizeStocks color keys)
        window.firebaseDb.collection('products').doc(pId).set(finalData)
          .catch(error => {
            console.error("Failed to save product to Firestore:", error);
            document.dispatchEvent(new CustomEvent('db-error', { detail: { message: "Lỗi lưu dữ liệu: " + error.message } }));
          });
      } else {
        pId = 'prod_' + Math.random().toString(36).substr(2, 9);
        product.id = pId;
        delete data.id;
        data.createdAt = Date.now();
        window.firebaseDb.collection('products').doc(pId).set(data)
          .catch(error => {
            console.error("Failed to add product to Firestore:", error);
            document.dispatchEvent(new CustomEvent('db-error', { detail: { message: "Lỗi thêm sản phẩm: " + error.message } }));
          });
      }
      return product;
    }

    const products = this.getProducts();
    if (product.id) {
      // Update
      const index = products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products[index] = {
          ...products[index],
          ...product,
          updatedAt: Date.now()
        };
      }
    } else {
      // Create new
      product.id = 'prod_' + Math.random().toString(36).substr(2, 9);
      product.createdAt = Date.now();
      products.push(product);
    }
    
    localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(products));
    return product;
  },

  deleteProduct(id) {
    if (window.firebaseEnabled) {
      window.firebaseDb.collection('products').doc(id).delete()
        .catch(error => {
          console.error("Failed to delete product from Firestore:", error);
          document.dispatchEvent(new CustomEvent('db-error', { detail: { message: "Lỗi xóa sản phẩm: " + error.message } }));
        });
      return true;
    }

    let products = this.getProducts();
    const originalLength = products.length;
    products = products.filter(p => p.id !== id);
    localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(products));
    return products.length < originalLength;
  },

  // AUTHENTICATION & SESSION
  isAdminLoggedIn() {
    return sessionStorage.getItem('admin_session') === 'active';
  },

  loginAdmin(username, password) {
    if (window.firebaseEnabled) {
      const pass = dbCaches.settings.adminPassword || 'admin123';
      if (username.trim() === 'admin' && password === pass) {
        sessionStorage.setItem('admin_session', 'active');
        return true;
      }
      return false;
    }

    const adminCredentials = JSON.parse(localStorage.getItem(DB_ADMIN_KEY));
    if (
      adminCredentials.username === username.trim() &&
      adminCredentials.password === password
    ) {
      sessionStorage.setItem('admin_session', 'active');
      return true;
    }
    return false;
  },

  logoutAdmin() {
    sessionStorage.removeItem('admin_session');
  },

  changeAdminPassword(newPassword) {
    if (window.firebaseEnabled) {
      window.firebaseDb.collection('settings').doc('global').set({
        adminPassword: newPassword
      }, { merge: true })
        .catch(error => {
          console.error("Failed to change password in Firestore:", error);
          document.dispatchEvent(new CustomEvent('db-error', { detail: { message: "Lỗi đổi mật khẩu: " + error.message } }));
        });
      return true;
    }

    const adminCredentials = JSON.parse(localStorage.getItem(DB_ADMIN_KEY)) || DEFAULT_ADMIN;
    adminCredentials.password = newPassword;
    localStorage.setItem(DB_ADMIN_KEY, JSON.stringify(adminCredentials));
    return true;
  },

  // ORDERS MANAGEMENT
  getOrders() {
    if (window.firebaseEnabled) {
      return dbCaches.orders;
    }
    return JSON.parse(localStorage.getItem('fashion_store_orders')) || [];
  },

  getOrderById(id) {
    if (window.firebaseEnabled) {
      return dbCaches.orders.find(o => o.id === id) || null;
    }
    const orders = this.getOrders();
    return orders.find(o => o.id === id) || null;
  },

  saveOrder(order) {
    if (window.firebaseEnabled) {
      const data = { ...order };
      let oId = order.id;
      if (oId) {
        delete data.id;
        data.updatedAt = Date.now();
        window.firebaseDb.collection('orders').doc(oId).set(data, { merge: true })
          .catch(error => {
            console.error("Failed to save order to Firestore:", error);
            document.dispatchEvent(new CustomEvent('db-error', { detail: { message: "Lỗi lưu đơn hàng: " + error.message } }));
          });
      } else {
        oId = 'ord_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        order.id = oId;
        delete data.id;
        data.createdAt = Date.now();
        data.synced = false;
        window.firebaseDb.collection('orders').doc(oId).set(data)
          .catch(error => {
            console.error("Failed to create order in Firestore:", error);
            document.dispatchEvent(new CustomEvent('db-error', { detail: { message: "Lỗi đặt hàng: " + error.message } }));
          });
      }
      return order;
    }

    const orders = this.getOrders();
    if (order.id) {
      const idx = orders.findIndex(o => o.id === order.id);
      if (idx !== -1) {
        orders[idx] = {
          ...orders[idx],
          ...order,
          updatedAt: Date.now()
        };
      }
    } else {
      order.id = 'ord_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      order.createdAt = Date.now();
      order.synced = false;
      orders.push(order);
    }
    localStorage.setItem('fashion_store_orders', JSON.stringify(orders));
    return order;
  },

  deleteOrder(id) {
    if (window.firebaseEnabled) {
      window.firebaseDb.collection('orders').doc(id).delete()
        .catch(error => {
          console.error("Failed to delete order from Firestore:", error);
          document.dispatchEvent(new CustomEvent('db-error', { detail: { message: "Lỗi xóa đơn hàng: " + error.message } }));
        });
      return true;
    }

    let orders = this.getOrders();
    const originalLength = orders.length;
    orders = orders.filter(o => o.id !== id);
    localStorage.setItem('fashion_store_orders', JSON.stringify(orders));
    return orders.length < originalLength;
  },

  getGoogleSheetsUrl() {
    if (window.firebaseEnabled) {
      return dbCaches.settings.googleSheetsUrl || '';
    }
    return localStorage.getItem('fashion_store_google_sheets_url') || '';
  },

  saveGoogleSheetsUrl(url) {
    if (window.firebaseEnabled) {
      window.firebaseDb.collection('settings').doc('global').set({
        googleSheetsUrl: url.trim()
      }, { merge: true })
        .catch(error => {
          console.error("Failed to save Google Sheets URL to Firestore:", error);
          document.dispatchEvent(new CustomEvent('db-error', { detail: { message: "Lỗi lưu cấu hình Google Sheets: " + error.message } }));
        });
      return true;
    }

    localStorage.setItem('fashion_store_google_sheets_url', url.trim());
    return true;
  }
};

// Export to window object for access across HTML scripts
window.db = db;
