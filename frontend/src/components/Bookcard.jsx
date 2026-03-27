import { Link } from 'react-router-dom';

export default function BookCard({ book, onAddToCart }) {
  return (
    <div className="col">
      <div className="book-card position-relative">
        {/* Sử dụng Property `book` để hiển thị dữ liệu */}
        <Link to={`/book/${book.id}`} className="book-img-container">
            <img src={book.image || 'https://via.placeholder.com/200x300'} className="book-img" alt={book.name} />
            <div className="overlay"></div>
        </Link>
        <div className="card-body">
            <Link to={`/book/${book.id}`} className="book-title">{book.name}</Link>
            <div className="d-flex justify-content-between align-items-end mt-3">
                <span className="book-price">${book.price}</span>
                
                {/* Nút bấm để gọi Event */}
                <button 
                    className="btn btn-outline-dark btn-sm rounded-pill px-3"
                    onClick={() => {
                      console.log("1. Component Con (BookCard): Nút đã được bấm, đang gọi hàm onAddToCart...");
                      onAddToCart(book);
                    }}
                >
                    <i className="fas fa-cart-plus"></i>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}