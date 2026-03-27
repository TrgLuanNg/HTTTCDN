// File: src/pages/storefront/StoreFrontHome.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Navbar from '../../components/Navbar.jsx';
import BookCard from '../../components/Bookcard.jsx'; // Nhúng User Control vừa tạo

export default function StorefrontHome() {
  const [books, setBooks] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    axiosClient.get('/store/books')
      .then(response => setBooks(response.data))
      .catch(error => console.error(error));
  }, []);

  // Đây là hàm xử lý sự kiện (Event Handler)
  const addToCart = (book) => {
    console.log("2. Component Cha (StoreFront): Nhận được tín hiệu từ con, đang xử lý sách:", book.name);
    let cart = JSON.parse(localStorage.getItem("BOOK_CART")) || [];
    let item = cart.find(x => x.id === book.id);
    
    if (item) {
        if (item.quantity >= book.quantity) {
            alert("Đã đạt giới hạn số lượng trong kho!");
            return;
        }
        item.quantity++;
    } else {
        cart.push({ 
            id: book.id, 
            name: book.name, 
            price: book.price, 
            image: book.image, 
            quantity: 1, 
            maxStock: book.quantity 
        });
    }
    
    localStorage.setItem("BOOK_CART", JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <>
      <Navbar />
      <div className="container pb-3">
        <div className="mb-5 text-center">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "#2c3e50" }}>Sách Nổi Bật</h2>
            <div style={{ width: "60px", height: "3px", background: "#c0392b", margin: "15px auto" }}></div>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {books.map(item => (
            /* Sử dụng User Control ở đây!
              - Truyền Property: book={item}
              - Gắn Event Delegate: onAddToCart={addToCart}
            */
            <BookCard 
                key={item.id} 
                book={item} 
                onAddToCart={addToCart} 
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="container text-center">
            &copy; 2025 - TheLibrary - Mang tri thức đến mọi nhà
        </div>
      </footer>

      {/* Toast Thông báo */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#27ae60', color: 'white', padding: '12px 25px', borderRadius: '4px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', zIndex: 9999, fontWeight: 500 }}>
          <i className="fas fa-check me-2"></i> Đã thêm vào giỏ
        </div>
      )}
    </>
  );
}