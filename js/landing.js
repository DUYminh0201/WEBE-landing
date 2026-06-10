/**
 * Storefront Landing Page Interactivity, Cart Drawer & Quick View Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  // States
  let activeFilter = 'all';
  let activeQuickViewProduct = null;
  let qvSelectedColor = null;
  let qvSelectedSize = null;
  
  // Cart state stored in localStorage
  let cart = JSON.parse(localStorage.getItem('fashion_store_cart')) || [];

  // DOM Elements
  const navbar = document.getElementById('navbar');
  const productsGrid = document.getElementById('productsGrid');
  const filterTabs = document.querySelectorAll('.filter-tabs .filter-tab');
  const navFilterLinks = document.querySelectorAll('.nav-links .nav-link');
  const footerFilterLinks = document.querySelectorAll('.footer-links .footer-link');
  const toastContainer = document.getElementById('toastContainer');

  // Cart Drawer Elements
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const btnOpenCart = document.getElementById('btnOpenCart');
  const btnCloseCart = document.getElementById('btnCloseCart');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartShipping = document.getElementById('cartShipping');
  const cartTotal = document.getElementById('cartTotal');
  const cartBadge = document.getElementById('cartBadge');
  const btnCheckout = document.getElementById('btnCheckout');

  // Checkout Modal Elements
  const checkoutModal = document.getElementById('checkoutModal');
  const btnCloseCheckoutModal = document.getElementById('btnCloseCheckoutModal');
  const btnCancelCheckout = document.getElementById('btnCancelCheckout');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutSubtotal = document.getElementById('checkoutSubtotal');
  const checkoutShipping = document.getElementById('checkoutShipping');
  const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');

  // Language Selector Elements
  const btnLangSelector = document.getElementById('btnLangSelector');
  const langDropdown = document.getElementById('langDropdown');
  const langWelcomeModal = document.getElementById('langWelcomeModal');

  // Quick View Modal Elements
  const quickViewModal = document.getElementById('quickViewModal');
  const btnCloseQVModal = document.getElementById('btnCloseQVModal');
  const qvMainImage = document.getElementById('qvMainImage');
  const qvThumbs = document.getElementById('qvThumbs');
  const qvCategory = document.getElementById('qvCategory');
  const qvTitle = document.getElementById('qvTitle');
  const qvPrice = document.getElementById('qvPrice');
  const qvDesc = document.getElementById('qvDesc');
  const qvColorsContainer = document.getElementById('qvColorsContainer');
  const qvSizesContainer = document.getElementById('qvSizesContainer');
  const qvStockInfo = document.getElementById('qvStockInfo');
  const btnQVAddToCart = document.getElementById('btnQVAddToCart');

  // Newsletter
  const newsletterForm = document.getElementById('newsletterForm');

  /* ==========================================
     TRANSLATION SYSTEM DICTIONARY (VI, EN, KM)
     ========================================== */
  const TRANSLATIONS = {
    vi: {
      nav_all: "Tất Cả",
      nav_outerwear: "Áo Khoác",
      nav_trousers: "Quần",
      nav_streetwear: "Streetwear",
      nav_footwear: "Giày Dép",
      hero_badge_new: "WEBE",
      hero_badge_season: "BST THỜI TRANG ĐƯƠNG ĐẠI UNISEX 2026",
      hero_title: 'Định Hình<br><span class="text-gold">Phong Cách</span><br>Đương Đại',
      hero_desc: "Tinh tế trong từng đường kim mũi chỉ, tối giản trong ngôn ngữ thiết kế. Trải nghiệm chất lượng may mặc cao cấp vượt trội từ WEBE.",
      hero_buy_now: "Mua Ngay",
      feat1_title: "Vận Chuyển Hỏa Tốc",
      feat1_desc: "Giao hàng miễn phí toàn quốc cho hóa đơn từ $40. Đóng gói hộp quà tặng cao cấp bảo vệ sản phẩm tối đa.",
      feat2_title: "Chất Liệu Cao Cấp",
      feat2_desc: "Cam kết sử dụng nguồn chất liệu bền vững như Organic Cotton, len tự nhiên và lụa tơ tằm thượng hạng cực kỳ thân thiện làn da.",
      feat3_title: "Thiết Kế Độc Quyền",
      feat3_desc: "Từng thiết kế đều được phác thảo và chế tác giới hạn, đảm bảo phom dáng chuẩn chỉnh tôn đường nét người mặc.",
      coll_title: "Sản Phẩm Nổi Bật",
      coll_desc: "Chọn lọc những thiết kế đặc sắc nhất cho cả nam và nữ, từ áo sơ mi, áo khoác cho tới giày da sang trọng.",
      coll_tab_all: "Tất cả",
      coll_tab_outer: "Áo khoác",
      coll_tab_trousers: "Quần",
      coll_tab_street: "Streetwear",
      coll_tab_footwear: "Giày dép",
      coll_tab_acc: "Phụ kiện",
      cart_title: "Giỏ Hàng Của Bạn",
      cart_empty: "Giỏ hàng của bạn đang trống",
      cart_continue: "Tiếp Tục Mua Sắm",
      cart_subtotal: "Tạm tính:",
      cart_shipping: "Phí vận chuyển:",
      cart_total: "Tổng thanh toán:",
      cart_free: "Miễn phí",
      cart_checkout: "Thanh Toán Ngay",
      qv_color: "Màu sắc:",
      qv_size: "Kích cỡ:",
      qv_stock_out: "Sản phẩm hiện đang hết hàng",
      qv_stock_left: "Còn lại trong kho:",
      qv_stock_unit: "sản phẩm",
      qv_add_to_cart: "Thêm Vào Giỏ Hàng",
      qv_stock_out_btn: "Hết Hàng",
      check_title: "Thông Tin Giao Hàng",
      check_name: "Họ và Tên *",
      check_name_ph: "Nhập họ và tên đầy đủ",
      check_phone: "Số Điện Thoại *",
      check_phone_ph: "Nhập số điện thoại liên hệ",
      check_address: "Địa Chỉ Giao Hàng *",
      check_address_ph: "Nhập địa chỉ giao nhận chi tiết",
      check_total: "Tổng thanh toán:",
      check_cancel: "Hủy",
      check_confirm: "Xác Nhận Đặt Hàng",
      foot_about_title: "WEBE",
      foot_about_desc: "Nhà may đo và cung cấp các giải pháp thời trang đô thị tối giản hàng đầu. Định hình xu hướng thiết kế cao cấp và độc bản.",
      foot_coll_title: "Bộ Sưu Tập",
      foot_links_outer: "Áo khoác nam nữ",
      foot_links_trousers: "Quần thiết kế",
      foot_links_street: "Streetwear độc bản",
      foot_links_footwear: "Giày da cao cấp",
      foot_info_title: "Thông Tin",
      foot_links_brand: "Về thương hiệu",
      foot_links_ship: "Chính sách vận chuyển",
      foot_links_refund: "Đổi trả & hoàn tiền",
      foot_news_title: "Nhận Bản Tin",
      foot_news_desc: "Đăng ký nhận thông tin về các bộ sưu tập mới và ưu đãi đặc quyền sớm nhất.",
      foot_news_ph: "Địa chỉ email của bạn",
      foot_news_btn: "Đăng Ký",
      foot_copy: "&copy; 2026 WEBE. Tất cả quyền được bảo lưu.",
      foot_credit: "Thiết kế bởi Đội ngũ kỹ sư sáng tạo của Google DeepMind.",
      toast_added: "Đã thêm sản phẩm vào giỏ hàng!",
      toast_limit: "Không thể thêm! Giới hạn hàng tồn trong kho chỉ còn {stock} chiếc.",
      toast_limit_short: "Không thể thêm! Chỉ còn {stock} chiếc.",
      toast_select_color: "Vui lòng chọn màu sắc sản phẩm!",
      toast_select_size: "Vui lòng chọn kích cỡ (size) sản phẩm!",
      toast_success_order: "Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.",
      toast_sub_success: "Đăng ký bản tin thành công! Cảm ơn bạn.",
      cat_outerwear: "Áo khoác",
      cat_trousers: "Quần",
      cat_streetwear: "Đồ dạo phố",
      cat_footwear: "Giày dép",
      cat_accessories: "Phụ kiện",
      badge_out: "Hết hàng",
      badge_low: "Sắp hết",
      badge_new: "Mới",
      products_empty: "Không có sản phẩm nào thuộc danh mục này.",
      card_quick_view: "Xem Nhanh",
      qv_no_desc: "Chưa có mô tả chi tiết cho sản phẩm này.",
      qv_no_color: "Freesize / Không chia màu",
      qv_no_size: "Freesize / Một kích cỡ",
      toast_limit_update: "Rất tiếc! Số lượng hàng tồn trong kho chỉ còn {stock} chiếc.",
      toast_required_fields: "Vui lòng điền đầy đủ các thông tin bắt buộc!",
      qv_combo_price: "Combo (từ {qty} cái): {price}/ {qty} cái",
      card_combo_price: "Combo ({qty}+): {price}/ {qty} cái",
      cart_default_color: "Mặc định"
    },
    en: {
      nav_all: "All",
      nav_outerwear: "Outerwear",
      nav_trousers: "Trousers",
      nav_streetwear: "Streetwear",
      nav_footwear: "Footwear",
      hero_badge_new: "WEBE",
      hero_badge_season: "UNISEX CONTEMPORARY COLLECTION 2026",
      hero_title: 'Define<br><span class="text-gold">Contemporary</span><br>Style',
      hero_desc: "Exquisite details, minimalist aesthetics. Experience the premium apparel craftsmanship from WEBE.",
      hero_buy_now: "Shop Now",
      feat1_title: "Express Delivery",
      feat1_desc: "Free nationwide shipping for orders over $40. Premium gift packaging included for product protection.",
      feat2_title: "Premium Materials",
      feat2_desc: "Committed to sustainable materials such as Organic Cotton, natural wool and premium silk.",
      feat3_title: "Exclusive Design",
      feat3_desc: "Each design is sketched and crafted in limited quantities, ensuring perfect fit and silhouette.",
      coll_title: "Featured Products",
      coll_desc: "Curated selections of premium apparel for both men and women, from shirts and outerwear to sleek leather shoes.",
      coll_tab_all: "All",
      coll_tab_outer: "Outerwear",
      coll_tab_trousers: "Trousers",
      coll_tab_street: "Streetwear",
      coll_tab_footwear: "Footwear",
      coll_tab_acc: "Accessories",
      cart_title: "Your Shopping Cart",
      cart_empty: "Your cart is currently empty",
      cart_continue: "Continue Shopping",
      cart_subtotal: "Subtotal:",
      cart_shipping: "Shipping Fee:",
      cart_total: "Total Payment:",
      cart_free: "Free",
      cart_checkout: "Checkout Now",
      qv_color: "Color:",
      qv_size: "Size:",
      qv_stock_out: "This product is currently out of stock",
      qv_stock_left: "Left in stock:",
      qv_stock_unit: "items",
      qv_add_to_cart: "Add To Cart",
      qv_stock_out_btn: "Out of Stock",
      check_title: "Delivery Information",
      check_name: "Full Name *",
      check_name_ph: "Enter your full name",
      check_phone: "Phone Number *",
      check_phone_ph: "Enter contact number",
      check_address: "Shipping Address *",
      check_address_ph: "Enter detailed delivery address",
      check_total: "Total Payment:",
      check_cancel: "Cancel",
      check_confirm: "Confirm Order",
      foot_about_title: "WEBE",
      foot_about_desc: "Premium contemporary fashion tailor. Defining unique and limited design trends.",
      foot_coll_title: "Collections",
      foot_links_outer: "Outerwear Collection",
      foot_links_trousers: "Tailored Trousers",
      foot_links_street: "Limited Streetwear",
      foot_links_footwear: "Premium Footwear",
      foot_info_title: "Information",
      foot_links_brand: "Our Story",
      foot_links_ship: "Shipping Policy",
      foot_links_refund: "Return & Refund Policy",
      foot_news_title: "Newsletter",
      foot_news_desc: "Subscribe to receive news on new drops and early access to exclusive campaigns.",
      foot_news_ph: "Your email address",
      foot_news_btn: "Subscribe",
      foot_copy: "&copy; 2026 WEBE. All rights reserved.",
      foot_credit: "Designed by Google DeepMind Creative Engineering Team.",
      toast_added: "Product added to cart!",
      toast_limit: "Cannot add! Warehouse limit is only {stock} items.",
      toast_limit_short: "Cannot add! Only {stock} items left.",
      toast_select_color: "Please select a product color!",
      toast_select_size: "Please select a product size!",
      toast_success_order: "Order placed successfully! Your order is being processed.",
      toast_sub_success: "Newsletter subscription successful! Thank you.",
      cat_outerwear: "Outerwear",
      cat_trousers: "Trousers",
      cat_streetwear: "Streetwear",
      cat_footwear: "Footwear",
      cat_accessories: "Accessories",
      badge_out: "Out of stock",
      badge_low: "Low stock",
      badge_new: "New",
      products_empty: "No products found in this category.",
      card_quick_view: "Quick View",
      qv_no_desc: "No detailed description available for this product.",
      qv_no_color: "Freesize / No color options",
      qv_no_size: "Freesize / One size",
      toast_limit_update: "Sorry! The stock limit in warehouse is only {stock} items.",
      toast_required_fields: "Please fill in all required fields!",
      qv_combo_price: "Combo (from {qty} pcs): {price}/ {qty} pcs",
      card_combo_price: "Combo ({qty}+): {price}/ {qty} pcs",
      cart_default_color: "Default"
    },
    km: {
      nav_all: "ទាំងអស់",
      nav_outerwear: "អាវធំ",
      nav_trousers: "ខោវែង",
      nav_streetwear: "យុវវ័យ",
      nav_footwear: "ស្បែកជើង",
      hero_badge_new: "WEBE",
      hero_badge_season: "បណ្តុំសម្លៀកបំពាក់យូនីសេក ២០២៦",
      hero_title: 'កំណត់<br><span class="text-gold">ស្ទីលបច្ចុប្បន្ន</span><br>ភាពទាន់សម័យ',
      hero_desc: "រចនាបថប្រណិត ភាពសាមញ្ញបំផុត។ ទទួលបានបទពិសោធន៍សម្លៀកបំពាក់គុណភាពខ្ពស់ពី WEBE។",
      hero_buy_now: "ទិញឥឡូវនេះ",
      feat1_title: "ដឹកជញ្ជូនរហ័ស",
      feat1_desc: "ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំងប្រទេសសម្រាប់ការបញ្ជាទិញចាប់ពី $40 ឡើងទៅ។ ខ្ចប់ក្នុងប្រអប់កាដូដ៏ប្រណិត។",
      feat2_title: "វត្ថុធាតុដើមប្រណិត",
      feat2_desc: "ប្តេជ្ញาប្រើប្រាស់វត្ថុធាតុដើមប្រកបដោយនិរន្តរភាពដូចជា Organic Cotton, រោមចៀមធម្មជាតិ និងសូត្រលំដាប់ខ្ពស់។",
      feat3_title: "រចនាផ្តាច់មុខ",
      feat3_desc: "រាល់ការរចនាទាំងអស់ត្រូវបានគូរ និងកែច្នៃមានកំណត់ ធានាបាននូវរូបរាងស្អាតសាកសមនឹងរាងកាយ។",
      coll_title: "ផលិតផលលេចធ្លោ",
      coll_desc: "ការជ្រើសរើសសំលៀកបំពាក់លំដាប់ខ្ពស់សម្រាប់បុរសនិងនារី ពីអាវសណ្តែក អាវធំ រហូតដល់ស្បែកជើងស្បែកដ៏ប្រណិត។",
      coll_tab_all: "ទាំងអស់",
      coll_tab_outer: "អាវធំ",
      coll_tab_trousers: "ខោវែង",
      coll_tab_street: "យុវវ័យ",
      coll_tab_footwear: "ស្បែកជើង",
      coll_tab_acc: "គ្រឿងបន្លាស់",
      cart_title: "កន្ត្រកទិញទំនិញរបស់អ្នក",
      cart_empty: "កន្ត្រកទិញទំនិញរបស់អ្នកទទេរ",
      cart_continue: "បន្តការទិញទំនិញ",
      cart_subtotal: "សរុបបណ្តោះអាសន្ន:",
      cart_shipping: "តម្លៃដឹកជញ្ជូន:",
      cart_total: "ការទូទាត់សរុប:",
      cart_free: "ឥតគិតថ្លៃ",
      cart_checkout: "ទូទាត់ឥឡូវនេះ",
      qv_color: "ពណ៌:",
      qv_size: "ទំហំ:",
      qv_stock_out: "ផលិតផលនេះអស់ពីស្តុកហើយ",
      qv_stock_left: "នៅសល់ក្នុងស្តុក:",
      qv_stock_unit: "ផលិតផល",
      qv_add_to_cart: "បន្ថែមទៅកន្ត្រក",
      qv_stock_out_btn: "អស់ពីស្តុក",
      check_title: "ព័ត៌មានដឹកជញ្ជូន",
      check_name: "ឈ្មោះពេញ *",
      check_name_ph: "បញ្ចូលឈ្មោះពេញរបស់អ្នក",
      check_phone: "លេខទូរស័ព្ទ *",
      check_phone_ph: "បញ្ចូលលេខទូរស័ព្ទទាក់ទង",
      check_address: "អាសយដ្ឋានដឹកជញ្ជូន *",
      check_address_ph: "បញ្ចូលអាសយដ្ឋានដឹកជញ្ជូនលម្អិត",
      check_total: "ការទូទាត់សរុប:",
      check_cancel: "បោះបង់",
      check_confirm: "បញ្ជាក់ការបញ្ជាទិញ",
      foot_about_title: "WEBE",
      foot_about_desc: "ហាងកាត់ដេរ និងផ្តល់ជូននូវម៉ូដសម្លៀកបំពាក់ទាន់សម័យដ៏លេចធ្លោ។ កំណត់និន្នាការរចនាប្លែកៗ。",
      foot_coll_title: "បណ្តុំម៉ូដសម្លៀកបំពាក់",
      foot_links_outer: "អាវធំបុរសនារី",
      foot_links_trousers: "ខោរចនាពិសេស",
      foot_links_street: "សម្លៀកបំពាក់យុវវ័យប្លែកៗ",
      foot_links_footwear: "ស្បែកជើងស្បែកប្រណិត",
      foot_info_title: "ព័ត៌មាន",
      foot_links_brand: "អំពីយីហោ",
      foot_links_ship: "គោលការណ៍ដឹកជញ្ជូន",
      foot_links_refund: "គោលការណ៍ប្តូរប្រាក់វិញ",
      foot_news_title: "ទទួលព្រឹត្តិបត្រព័ត៌មាន",
      foot_news_desc: "ចុះឈ្មោះដើម្បីទទួលបានព័ត៌មានអំពីបណ្តុំថ្មីៗ និងការផ្តល់ជូនផ្តាច់មុខមុនគេ។",
      foot_news_ph: "អាសយដ្ឋានអ៊ីមែលរបស់អ្នក",
      foot_news_btn: "ចុះឈ្មោះ",
      foot_copy: "&copy; ២០២៦ WEBE. រក្សាសិទ្ធិគ្រប់យ៉ាង។",
      foot_credit: "រចនាដោយ ក្រុមវិស្វករច្នៃប្រឌិតរបស់ Google DeepMind។",
      toast_added: "បានបន្ថែមផលិតផលទៅកន្ត្រកហើយ!",
      toast_limit: "មិនអាចបន្ថែមបានទេ! ដែនកំណត់ស្តុកនៅសល់ត្រឹមតែ {stock} គ្រឿងប៉ុណ្ហោះ។",
      toast_limit_short: "មិនអាចបន្ថែមបានទេ! នៅសល់តែ {stock} គ្រឿងប៉ុណ្ហោះ។",
      toast_select_color: "សូមជ្រើសរើសពណ៌ផលិតផល!",
      toast_select_size: "សូមជ្រើសរើសទំហំផលិតផល!",
      toast_success_order: "ការបញ្ជាទិញបានជោគជ័យ! ការបញ្ជាទិញរបស់អ្នកកំពុងដំណើរការ។",
      toast_sub_success: "បានចុះឈ្មោះទទួលព្រឹត្តិបត្រជោគជ័យ! សូមអរគុណ។",
      cat_outerwear: "អាវធំ",
      cat_trousers: "ខោវែង",
      cat_streetwear: "យុវវ័យ",
      cat_footwear: "ស្បែកជើង",
      cat_accessories: "គ្រឿងបន្លាស់",
      badge_out: "អស់ស្តុក",
      badge_low: "ជិតអស់",
      badge_new: "ថ្មី",
      products_empty: "រកមិនឃើញផលិតផលនៅក្នុងប្រភេទនេះទេ",
      card_quick_view: "មើលរហ័ស",
      qv_no_desc: "មិនមានការពិពណ៌នាច្បាស់លាស់សម្រាប់ផលិតផលនេះទេ",
      qv_no_color: "Freesize / គ្មានជម្រើសពណ៌",
      qv_no_size: "Freesize / ទំហំតែមួយ",
      toast_limit_update: "សុំទោស! ដែនកំណត់ស្តុកនៅក្នុងឃ្លាំងគឺត្រឹមតែ {stock} គ្រឿងប៉ុណ្ហោះ។",
      toast_required_fields: "សូមបំពេញព័ត៌មានដែលត្រូវការទាំងអស់!",
      qv_combo_price: "Combo (ចាប់ពី {qty} គ្រឿង): {price}/ {qty} គ្រឿង",
      card_combo_price: "Combo ({qty}+): {price}/ {qty} គ្រឿង",
      cart_default_color: "លំនាំដើម"
    }
  };

  // Helper to translate static layout
  function applyTranslations(lang) {
    // Save to localStorage
    localStorage.setItem('fashion_store_lang', lang);
    
    // Find all elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        el.innerHTML = TRANSLATIONS[lang][key];
      }
    });

    // Update input placeholders
    const custName = document.getElementById('custName');
    const custPhone = document.getElementById('custPhone');
    const custAddress = document.getElementById('custAddress');
    const emailInput = document.querySelector('.newsletter-form input');

    if (custName) custName.placeholder = TRANSLATIONS[lang].check_name_ph;
    if (custPhone) custPhone.placeholder = TRANSLATIONS[lang].check_phone_ph;
    if (custAddress) custAddress.placeholder = TRANSLATIONS[lang].check_address_ph;
    if (emailInput) emailInput.placeholder = TRANSLATIONS[lang].foot_news_ph;

    // Sync active classes in dropdown list
    document.querySelectorAll('.lang-option-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Get dynamic translated text helper
  function getTranslationText(key, replacements = {}) {
    const lang = localStorage.getItem('fashion_store_lang') || 'vi';
    let text = TRANSLATIONS[lang]?.[key] || key;
    for (let placeholder in replacements) {
      text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return text;
  }

  /* ==========================================
     LANGUAGE SELECTION EVENT LISTENERS
     ========================================== */
  // Toggle dropdown
  if (btnLangSelector && langDropdown) {
    btnLangSelector.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
    });
  }

  // Dropdown options click
  document.querySelectorAll('.lang-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang');
      applyTranslations(selectedLang);
      renderProducts();
      renderCart();
      langDropdown.classList.remove('active');
      
      let switchMsg = 'Đã đổi ngôn ngữ sang Tiếng Việt';
      if (selectedLang === 'en') switchMsg = 'Language switched to English';
      if (selectedLang === 'km') switchMsg = 'ភាសាត្រូវបានប្តូរទៅជាភាសាខ្មែរ';
      showToast(switchMsg, 'success');
    });
  });

  // Welcome modal options click
  document.querySelectorAll('.welcome-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang');
      applyTranslations(selectedLang);
      renderProducts();
      renderCart();
      if (langWelcomeModal) {
        langWelcomeModal.classList.remove('active');
      }
      
      let selectMsg = 'Đã chọn Tiếng Việt';
      if (selectedLang === 'en') selectMsg = 'English selected';
      if (selectedLang === 'km') selectMsg = 'ភាសាខ្មែរត្រូវបានជ្រើសរើស';
      showToast(selectMsg, 'success');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (langDropdown && langDropdown.classList.contains('active')) {
      if (!langDropdown.contains(e.target) && e.target !== btnLangSelector && !btnLangSelector.contains(e.target)) {
        langDropdown.classList.remove('active');
      }
    }
  });

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

  /* ==========================================
     NAVBAR GLASS EFFECT ON SCROLL
     ========================================== */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* ==========================================
     RENDER PRODUCTS GRID
     ========================================== */
  function renderProducts() {
    const products = window.db.getProducts();
    
    // Filter logic
    const filteredProducts = activeFilter === 'all' 
      ? products 
      : products.filter(p => p.category === activeFilter);

    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
      productsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-secondary);">
        ${getTranslationText('products_empty')}
      </div>`;
      return;
    }

    filteredProducts.forEach(p => {
      const mainImage = (p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/400x500';
      
      // Stock status badge
      let badgeHtml = '';
      if (p.stock === 0) {
        badgeHtml = `<span class="badge badge-danger product-card-badge">${getTranslationText('badge_out')}</span>`;
      } else if (p.stock < 10) {
        badgeHtml = `<span class="badge badge-danger product-card-badge" style="background-color: rgba(214,175,87,0.85); color: #000;">${getTranslationText('badge_low')}</span>`;
      } else if (Date.now() - p.createdAt < 7 * 24 * 60 * 60 * 1000) {
        badgeHtml = `<span class="badge badge-primary product-card-badge">${getTranslationText('badge_new')}</span>`;
      }

      // Sizes display (join top 3 size tags)
      const sizesLabel = p.sizes && p.sizes.length > 0 
        ? p.sizes.slice(0, 3).join(', ') + (p.sizes.length > 3 ? '+' : '')
        : 'Freesize';

      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-img-wrapper">
          ${badgeHtml}
          <img src="${mainImage}" class="product-card-img" alt="${p.name}">
          <div class="product-card-overlay">
            <button class="btn btn-primary btn-quickview" data-id="${p.id}" style="padding: 10px 20px; font-size: 0.8rem;">${getTranslationText('card_quick_view')}</button>
          </div>
        </div>
        <div class="product-card-info">
          <span class="product-card-category">${translateCategory(p.category)}</span>
          <h3 class="product-card-title">${p.name}</h3>
          <div class="product-card-price-variants">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span class="product-card-price">$${parseFloat(p.price).toFixed(2)}</span>
              ${p.comboPrice ? `<span style="font-size: 0.75rem; color: var(--accent); font-weight: 600;">${getTranslationText('card_combo_price', { price: `$${parseFloat(p.comboPrice).toFixed(2)}`, qty: p.comboMinQty || 2 })}</span>` : ''}
            </div>
            <div class="product-card-variants">
              <span class="product-card-sizes">${sizesLabel}</span>
            </div>
          </div>
        </div>
      `;

      productsGrid.appendChild(card);
    });

    // Add event listeners for quickview buttons and images
    document.querySelectorAll('.btn-quickview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openQuickView(btn.getAttribute('data-id'));
      });
    });

    document.querySelectorAll('.product-card').forEach((card, idx) => {
      card.addEventListener('click', () => {
        const id = card.querySelector('.btn-quickview').getAttribute('data-id');
        openQuickView(id);
      });
    });
  }

  // Filter tabs click handler
  function updateActiveFilter(filter) {
    activeFilter = filter;
    
    // Sync tabs
    filterTabs.forEach(tab => {
      if (tab.getAttribute('data-filter') === filter) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Sync header links
    navFilterLinks.forEach(link => {
      if (link.getAttribute('data-filter') === filter) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    renderProducts();
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      updateActiveFilter(tab.getAttribute('data-filter'));
    });
  });

  navFilterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      updateActiveFilter(link.getAttribute('data-filter'));
      // Scroll to collection section smoothly
      document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
    });
  });

  footerFilterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      updateActiveFilter(link.getAttribute('data-filter'));
      document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
    });
  });

  function translateCategory(cat) {
    const lang = localStorage.getItem('fashion_store_lang') || 'vi';
    const key = 'cat_' + cat.toLowerCase();
    return TRANSLATIONS[lang]?.[key] || cat;
  }

  function renderQuickViewSizes(product, selectedColor) {
    qvSizesContainer.innerHTML = '';
    
    if (product.sizes && product.sizes.length > 0) {
      product.sizes.forEach(size => {
        const option = document.createElement('div');
        option.className = 'size-option';
        option.textContent = size;
        if (qvSelectedSize === size) {
          option.classList.add('active');
        }

        let sizeStock = 0;
        if (selectedColor) {
          // If we have a selected color
          if (product.sizeStocks && product.sizeStocks[selectedColor] !== undefined) {
            sizeStock = product.sizeStocks[selectedColor][size] || 0;
          } else if (product.sizeStocks && product.sizeStocks[size] !== undefined && (selectedColor === 'default' || selectedColor === 'Mặc định')) {
            // Fallback for flat structure
            sizeStock = product.sizeStocks[size] || 0;
          }
        } else {
          // Sum across all colors
          if (product.sizeStocks) {
            // Check if nested structure
            const firstKey = Object.keys(product.sizeStocks)[0];
            const isNested = firstKey && typeof product.sizeStocks[firstKey] === 'object';
            if (isNested) {
              Object.keys(product.sizeStocks).forEach(col => {
                sizeStock += (product.sizeStocks[col][size] || 0);
              });
            } else {
              // Flat structure
              sizeStock = product.sizeStocks[size] || 0;
            }
          } else {
            sizeStock = product.stock;
          }
        }

        if (sizeStock === 0) {
          option.classList.add('disabled');
          option.title = getTranslationText('badge_out');
          // If this size was selected, deselect it since it's out of stock for this color
          if (qvSelectedSize === size) {
            qvSelectedSize = null;
            qvStockInfo.innerHTML = `${getTranslationText('qv_stock_left')} <span style="font-weight: 600; color: var(--text-primary);">${product.stock} ${getTranslationText('qv_stock_unit')}</span>`;
          }
        } else {
          option.addEventListener('click', () => {
            document.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            qvSelectedSize = size;
            
            // Show stock for the selected size dynamically
            qvStockInfo.innerHTML = `${getTranslationText('qv_stock_left')} <span style="font-weight: 600; color: var(--text-primary);">${sizeStock} ${getTranslationText('qv_stock_unit')}</span>`;
          });
        }
        qvSizesContainer.appendChild(option);
      });
    } else {
      qvSizesContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.9rem;">${getTranslationText('qv_no_size')}</span>`;
      qvSelectedSize = 'Freesize';
    }
  }

  /* ==========================================
     QUICK VIEW MODAL CONTROLS
     ========================================== */
  function openQuickView(id) {
    const product = window.db.getProductById(id);
    if (!product) return;

    activeQuickViewProduct = product;
    qvSelectedColor = null;
    qvSelectedSize = null;

    // Set Text Parameters
    qvCategory.textContent = translateCategory(product.category);
    qvTitle.textContent = product.name;
    if (product.comboPrice) {
      const retailPriceFormatted = `$${parseFloat(product.price).toFixed(2)}`;
      const comboPriceFormatted = `$${parseFloat(product.comboPrice).toFixed(2)}`;
      const comboText = getTranslationText('qv_combo_price', { price: comboPriceFormatted, qty: product.comboMinQty || 2 });
      qvPrice.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span>${retailPriceFormatted}</span>
          <span style="font-size: 0.95rem; color: var(--accent); font-weight: 600; display: block;">${comboText}</span>
        </div>
      `;
    } else {
      qvPrice.textContent = `$${parseFloat(product.price).toFixed(2)}`;
    }
    qvDesc.textContent = product.description || getTranslationText('qv_no_desc');
    
    // Stock configuration
    if (product.stock === 0) {
      qvStockInfo.innerHTML = `<span style="color: var(--danger); font-weight: 600;">${getTranslationText('qv_stock_out')}</span>`;
      btnQVAddToCart.disabled = true;
      btnQVAddToCart.textContent = getTranslationText('qv_stock_out_btn');
    } else {
      qvStockInfo.innerHTML = `${getTranslationText('qv_stock_left')} <span style="font-weight: 600; color: var(--text-primary);">${product.stock} ${getTranslationText('qv_stock_unit')}</span>`;
      btnQVAddToCart.disabled = false;
      btnQVAddToCart.textContent = getTranslationText('qv_add_to_cart');
    }

    // Set Image Gallery
    const images = product.images && product.images.length > 0 
      ? product.images 
      : ['https://via.placeholder.com/400x500'];
    
    qvMainImage.src = images[0];

    // Populate thumbnails
    qvThumbs.innerHTML = '';
    images.forEach((img, index) => {
      const thumb = document.createElement('img');
      thumb.className = `gallery-thumb ${index === 0 ? 'active' : ''}`;
      thumb.src = img;
      thumb.alt = `thumb-${index}`;
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        qvMainImage.src = img;
      });
      qvThumbs.appendChild(thumb);
    });

    // Populate Color Options
    qvColorsContainer.innerHTML = '';
    if (product.colors && product.colors.length > 0) {
      product.colors.forEach(color => {
        const option = document.createElement('div');
        if (color.startsWith('#')) {
          option.className = 'color-option';
          option.innerHTML = `<div class="color-inner" style="background-color: ${color};"></div>`;
        } else {
          option.className = 'color-option-text';
          option.textContent = color;
        }
        option.addEventListener('click', () => {
          document.querySelectorAll('.color-option, .color-option-text').forEach(o => o.classList.remove('active'));
          option.classList.add('active');
          qvSelectedColor = color;
          renderQuickViewSizes(product, qvSelectedColor);
        });
        qvColorsContainer.appendChild(option);
      });
    } else {
      qvColorsContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.9rem;">${getTranslationText('qv_no_color')}</span>`;
      qvSelectedColor = 'default';
    }

    // Populate Size Buttons
    renderQuickViewSizes(product, qvSelectedColor);

    quickViewModal.classList.add('active');
  }

  function closeQVModal() {
    quickViewModal.classList.remove('active');
    activeQuickViewProduct = null;
    qvSelectedColor = null;
    qvSelectedSize = null;
  }

  btnCloseQVModal.addEventListener('click', closeQVModal);
  
  // Close clicking outside modal container
  quickViewModal.addEventListener('click', (e) => {
    if (e.target === quickViewModal) {
      closeQVModal();
    }
  });

  /* ==========================================
     CART DRAWER LOGIC
     ========================================== */
  function openCart() {
    renderCart();
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  }

  function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
  }

  btnOpenCart.addEventListener('click', openCart);
  btnCloseCart.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function saveCart() {
    localStorage.setItem('fashion_store_cart', JSON.stringify(cart));
    updateCartBadge();
  }

  function updateCartBadge() {
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    cartBadge.textContent = totalQty;
    if (totalQty > 0) {
      cartBadge.style.display = 'flex';
    } else {
      cartBadge.style.display = 'none';
    }
  }

  function addToCart(product, color, size, qty = 1) {
    // Generate a unique cart item identity based on product ID, color, and size
    const cartItemId = `${product.id}_${color}_${size}`;
    const existingIndex = cart.findIndex(item => item.id === cartItemId);

    let sizeStock = product.stock; // fallback
    if (product.sizeStocks) {
      if (product.sizeStocks[color] !== undefined) {
        sizeStock = product.sizeStocks[color][size] || 0;
      } else if (product.sizeStocks[size] !== undefined && (color === 'default' || color === 'Mặc định')) {
        sizeStock = product.sizeStocks[size] || 0;
      }
    }

    if (existingIndex !== -1) {
      // Validate inventory limit
      const newQty = cart[existingIndex].qty + qty;
      if (newQty > sizeStock) {
        showToast(getTranslationText('toast_limit', {stock: sizeStock}), 'error');
        return false;
      }
      cart[existingIndex].qty = newQty;
    } else {
      // Validate inventory
      if (qty > sizeStock) {
        showToast(getTranslationText('toast_limit_short', {stock: sizeStock}), 'error');
        return false;
      }
      
      const thumb = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/150';
      cart.push({
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: thumb,
        color: color,
        size: size,
        qty: qty
      });
    }

    saveCart();
    renderCart();
    return true;
  }

  function updateCartItemQty(id, newQty) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    const dbProduct = window.db.getProductById(cart[itemIndex].productId);
    if (!dbProduct) return;

    const color = cart[itemIndex].color;
    let sizeStock = dbProduct.stock; // fallback
    if (dbProduct.sizeStocks) {
      if (dbProduct.sizeStocks[color] !== undefined) {
        sizeStock = dbProduct.sizeStocks[color][size] || 0;
      } else if (dbProduct.sizeStocks[size] !== undefined && (color === 'default' || color === 'Mặc định')) {
        sizeStock = dbProduct.sizeStocks[size] || 0;
      }
    }

    if (newQty > sizeStock) {
      showToast(getTranslationText('toast_limit_update', {stock: sizeStock}), 'error');
      return;
    }

    if (newQty <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].qty = newQty;
    }

    saveCart();
    renderCart();
  }

  function calculateCartTotal() {
    const prodQtyMap = {};
    cart.forEach(item => {
      prodQtyMap[item.productId] = (prodQtyMap[item.productId] || 0) + item.qty;
    });

    let total = 0;
    const processedProducts = new Set();
    cart.forEach(item => {
      if (processedProducts.has(item.productId)) return;
      processedProducts.add(item.productId);

      const dbProduct = window.db.getProductById(item.productId);
      const qty = prodQtyMap[item.productId];
      const minQty = dbProduct && dbProduct.comboMinQty ? parseInt(dbProduct.comboMinQty) : 2;

      if (dbProduct && dbProduct.comboPrice && qty >= minQty) {
        const bundles = Math.floor(qty / minQty);
        const single = qty % minQty;
        total += (bundles * parseFloat(dbProduct.comboPrice)) + (single * parseFloat(dbProduct.price));
      } else {
        cart.filter(i => i.productId === item.productId).forEach(i => {
          total += parseFloat(i.price) * i.qty;
        });
      }
    });
    return total;
  }

  function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path>
          </svg>
          <p>${getTranslationText('cart_empty')}</p>
          <button class="btn btn-secondary" id="btnContinueShopping" style="margin-top: 16px;">${getTranslationText('cart_continue')}</button>
        </div>
      `;

      // bind continue shopping click
      document.getElementById('btnContinueShopping').addEventListener('click', closeCart);
      cartSubtotal.textContent = '$0.00';
      return;
    }

    const prodQtyMap = {};
    cart.forEach(item => {
      prodQtyMap[item.productId] = (prodQtyMap[item.productId] || 0) + item.qty;
    });

    cart.forEach(item => {
      const dbProduct = window.db.getProductById(item.productId);
      const totalProductQty = prodQtyMap[item.productId];
      const minQty = dbProduct && dbProduct.comboMinQty ? parseInt(dbProduct.comboMinQty) : 2;
      const isCombo = dbProduct && dbProduct.comboPrice && totalProductQty >= minQty;

      let colorLabel = `<span>${getTranslationText('cart_default_color')}</span>`;
      if (item.color !== 'default') {
        if (item.color.startsWith('#')) {
          colorLabel = `<div class="cart-item-color-dot" style="background-color: ${item.color};" title="${item.color}"></div>`;
        } else {
          colorLabel = `<span class="size-tag" style="background: var(--bg-primary); text-transform: capitalize;">${item.color}</span>`;
        }
      }

      let priceDisplay = '';
      if (isCombo) {
        const bundles = Math.floor(totalProductQty / minQty);
        const single = totalProductQty % minQty;
        const totalProductPrice = (bundles * parseFloat(dbProduct.comboPrice)) + (single * parseFloat(dbProduct.price));
        
        // Average unit price to apportion this line total
        const avgUnitPrice = totalProductPrice / totalProductQty;
        const lineTotal = avgUnitPrice * item.qty;
        const lineRetailTotal = parseFloat(item.price) * item.qty;

        priceDisplay = `
          <div style="display: flex; flex-direction: column;">
            <span class="cart-item-price" style="color: var(--accent); font-weight: 700;">$${lineTotal.toFixed(2)} <span style="font-size: 0.65rem; font-weight: 600; padding: 2px 4px; background: rgba(79, 70, 229, 0.1); border-radius: 4px; margin-left: 2px; vertical-align: middle; display: inline-block;">Giá Combo</span></span>
            <span style="font-size: 0.75rem; text-decoration: line-through; color: var(--text-muted);">$${lineRetailTotal.toFixed(2)}</span>
          </div>
        `;
      } else {
        const lineRetailTotal = parseFloat(item.price) * item.qty;
        priceDisplay = `<span class="cart-item-price">$${lineRetailTotal.toFixed(2)}</span>`;
      }

      const cartItemDiv = document.createElement('div');
      cartItemDiv.className = 'cart-item';
      cartItemDiv.innerHTML = `
        <img src="${item.image}" class="cart-item-img" alt="${item.name}">
        <div class="cart-item-info">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h4 class="cart-item-title">${item.name}</h4>
            <span class="cart-item-remove" data-id="${item.id}">&times;</span>
          </div>
          
          <div class="cart-item-meta">
            <span>${getTranslationText('qv_color')}</span> ${colorLabel}
            <span>${getTranslationText('qv_size')}</span> <span class="size-tag" style="background: var(--bg-primary);">${item.size}</span>
          </div>

          <div class="cart-item-price-qty">
            ${priceDisplay}
            
            <div class="qty-selector">
              <span class="qty-btn qty-minus" data-id="${item.id}">-</span>
              <span class="qty-val">${item.qty}</span>
              <span class="qty-btn qty-plus" data-id="${item.id}">+</span>
            </div>
          </div>
        </div>
      `;

      cartItemsContainer.appendChild(cartItemDiv);
    });

    const subtotal = calculateCartTotal();
    const shippingFee = subtotal < 40 ? 2 : 0;
    const finalTotal = subtotal + shippingFee;

    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartShipping) {
      cartShipping.textContent = shippingFee === 0 
        ? getTranslationText('cart_free') 
        : `$${shippingFee.toFixed(2)}`;
    }
    if (cartTotal) {
      cartTotal.textContent = `$${finalTotal.toFixed(2)}`;
    }

    // Hook listeners
    document.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cart.find(i => i.id === id);
        if (item) updateCartItemQty(id, item.qty - 1);
      });
    });

    document.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = cart.find(i => i.id === id);
        if (item) updateCartItemQty(id, item.qty + 1);
      });
    });

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        updateCartItemQty(btn.getAttribute('data-id'), 0);
      });
    });
  }

  /* ==========================================
     ADD TO CART SUBMIT IN QUICK VIEW
     ========================================== */
  btnQVAddToCart.addEventListener('click', () => {
    if (!activeQuickViewProduct) return;

    if (!qvSelectedColor) {
      showToast(getTranslationText('toast_select_color'), 'error');
      return;
    }

    if (!qvSelectedSize) {
      showToast(getTranslationText('toast_select_size'), 'error');
      return;
    }

    const success = addToCart(activeQuickViewProduct, qvSelectedColor, qvSelectedSize, 1);
    if (success) {
      showToast(getTranslationText('toast_added'), 'success');
      closeQVModal();
      setTimeout(openCart, 300); // Open the drawer after adding item
    }
  });

  /* ==========================================
     CHECKOUT CONFIRMATION FLOW
     ========================================== */
  btnCheckout.addEventListener('click', () => {
    if (cart.length === 0) return;

    const subtotal = calculateCartTotal();
    const shippingFee = subtotal < 40 ? 2 : 0;
    const finalTotal = subtotal + shippingFee;

    if (checkoutSubtotal) checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (checkoutShipping) {
      checkoutShipping.textContent = shippingFee === 0 
        ? getTranslationText('cart_free') 
        : `$${shippingFee.toFixed(2)}`;
    }
    if (checkoutTotalAmount) checkoutTotalAmount.textContent = `$${finalTotal.toFixed(2)}`;

    // Open checkout modal
    checkoutModal.classList.add('active');
  });

  // Close checkout modal
  function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    checkoutForm.reset();
  }

  btnCloseCheckoutModal.addEventListener('click', closeCheckoutModal);
  btnCancelCheckout.addEventListener('click', closeCheckoutModal);
  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
      closeCheckoutModal();
    }
  });

  // Handle order submission
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (!name || !phone || !address) {
      showToast(getTranslationText('toast_required_fields'), 'error');
      return;
    }

    const subtotal = calculateCartTotal();
    const shippingFee = subtotal < 40 ? 2 : 0;
    const finalTotal = subtotal + shippingFee;

    // Calculate total quantity per productId in cart to determine combo price status
    const prodQtyMap = {};
    cart.forEach(item => {
      prodQtyMap[item.productId] = (prodQtyMap[item.productId] || 0) + item.qty;
    });

    // Create order object (write actual price paid)
    const orderData = {
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      items: cart.map(item => {
        const dbProduct = window.db.getProductById(item.productId);
        const totalProductQty = prodQtyMap[item.productId];
        const minQty = dbProduct && dbProduct.comboMinQty ? parseInt(dbProduct.comboMinQty) : 2;
        const isCombo = dbProduct && dbProduct.comboPrice && totalProductQty >= minQty;
        
        let actualPrice = parseFloat(item.price);
        if (isCombo) {
          const bundles = Math.floor(totalProductQty / minQty);
          const single = totalProductQty % minQty;
          const totalProductPrice = (bundles * parseFloat(dbProduct.comboPrice)) + (single * parseFloat(dbProduct.price));
          actualPrice = totalProductPrice / totalProductQty;
        }
        
        return {
          ...item,
          price: actualPrice
        };
      }),
      subtotal: subtotal,
      shippingFee: shippingFee,
      totalAmount: finalTotal
    };

    // Save order to mock database
    window.db.saveOrder(orderData);

    // Reduce product inventory stock
    cart.forEach(item => {
      const product = window.db.getProductById(item.productId);
      if (product) {
        if (product.sizeStocks) {
          if (product.sizeStocks[item.color] !== undefined) {
            product.sizeStocks[item.color][item.size] = Math.max(0, (product.sizeStocks[item.color][item.size] || 0) - item.qty);
          } else if (product.sizeStocks[item.size] !== undefined && (item.color === 'default' || item.color === 'Mặc định')) {
            product.sizeStocks[item.size] = Math.max(0, product.sizeStocks[item.size] - item.qty);
          }
          // Recalculate total product stock
          let totalStock = 0;
          const firstKey = Object.keys(product.sizeStocks)[0];
          const isNested = firstKey && typeof product.sizeStocks[firstKey] === 'object';
          if (isNested) {
            Object.keys(product.sizeStocks).forEach(col => {
              Object.values(product.sizeStocks[col]).forEach(q => {
                totalStock += q;
              });
            });
          } else {
            totalStock = Object.values(product.sizeStocks).reduce((sum, q) => sum + q, 0);
          }
          product.stock = totalStock;
        } else {
          product.stock = Math.max(0, product.stock - item.qty);
        }
        window.db.saveProduct(product);
      }
    });

    // Clear cart
    cart = [];
    saveCart();
    renderCart();
    closeCart();
    closeCheckoutModal();

    showToast(getTranslationText('toast_success_order'), 'success');

    // Refresh products view
    renderProducts();
  });

  /* ==========================================
     NEWSLETTER SUBMIT CONFIRMATION
     ========================================== */
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast(getTranslationText('toast_sub_success'), 'success');
    newsletterForm.reset();
  });

  // Initial runs
  updateCartBadge();
  
  // Initialize language selection
  const savedLang = localStorage.getItem('fashion_store_lang');
  if (!savedLang) {
    if (langWelcomeModal) {
      langWelcomeModal.classList.add('active');
    }
    applyTranslations('vi');
  } else {
    applyTranslations(savedLang);
  }

  renderProducts();

  // Listen to Firestore real-time database updates
  document.addEventListener('db-updated', (e) => {
    if (e.detail.type === 'products') {
      renderProducts();
    }
  });

  // Listen to database errors
  document.addEventListener('db-error', (e) => {
    showToast(e.detail.message, 'error');
  });
});
