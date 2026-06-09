/**
 * Firebase Firestore Configuration & Initialization
 * 
 * HƯỚNG DẪN CẤU HÌNH CLOUD DATABASE TẬP TRUNG (MIỄN PHÍ):
 * 1. Truy cập https://console.firebase.google.com và đăng nhập tài khoản Google.
 * 2. Click "Add project" để tạo dự án mới (ví dụ đặt tên: "webe-fashion").
 * 3. Sau khi dự án tạo xong, click vào biểu tượng Web (</>) ở trang tổng quan để đăng ký ứng dụng Web.
 * 4. Copy đối tượng cấu hình firebaseConfig hiển thị trên màn hình và thay thế vào đây.
 * 5. Truy cập menu bên trái "Build" > "Firestore Database" và click "Create database".
 * 6. Chọn vị trí máy chủ, ở bước Bảo mật (Rules) chọn "Start in test mode" (Hoặc chuyển sang chế độ cho phép đọc ghi: allow read, write: if true;).
 * 7. Thay đổi các chuỗi placeholder dưới đây bằng các khóa thật của bạn. Hệ thống sẽ tự động chuyển từ LocalStorage sang Cloud Database Firestore thời gian thực!
 */

const firebaseConfig = {
  apiKey: "AIzaSyCWRqPfY_xyyWZ9tIlsBZ8LJfQDY2qaJf4",
  authDomain: "webefashion-278a3.firebaseapp.com",
  projectId: "webefashion-278a3",
  storageBucket: "webefashion-278a3.firebasestorage.app",
  messagingSenderId: "661522155842",
  appId: "1:661522155842:web:c975b69ff39095834f60db",
  measurementId: "G-2PGLZQN1CQ"
};

// Kiểm tra xem cấu hình có phải là thật hay vẫn là placeholder
const isFirebasePlaceholder = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey === "YOUR_API_KEY" || 
  firebaseConfig.apiKey.trim() === "";

window.firebaseEnabled = false;
window.firebaseDb = null;

if (!isFirebasePlaceholder) {
  try {
    // Khởi tạo Firebase App
    firebase.initializeApp(firebaseConfig);
    
    // Khởi tạo Firestore và bật tính năng lưu trữ offline cục bộ để tăng tốc
    const firestore = firebase.firestore();
    
    window.firebaseDb = firestore;
    window.firebaseEnabled = true;
    console.log("🔥 Firebase Firestore connected successfully. Real-time sync enabled.");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase. Falling back to LocalStorage:", error);
  }
} else {
  console.log("ℹ️ Firebase config is default placeholder. App is running in LocalStorage fallback mode.");
}
