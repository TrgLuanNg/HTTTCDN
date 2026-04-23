import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import Navbar from '../../components/Navbar.jsx';
import BookCard from '../../components/Bookcard.jsx';

export default function SearchBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [toastVisible, setToastVisible] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'name';
    const filter = searchParams.get('filter') || 'all';
    
    setSearchQuery(query);
    setSortBy(sort);
    setFilterBy(filter);
    
    if (query) {
      searchBooks(query, sort, filter);
    } else {
      // Nếu không có query, load tất cả sách
      loadAllBooks(sort, filter);
    }
  }, [searchParams]);

  const loadAllBooks = async (sort = 'name', filter = 'all') => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/api/store/books');
      let filteredBooks = response.data;
      
      // Áp dụng bộ lọc
      if (filter !== 'all') {
        filteredBooks = filteredBooks.filter(book => {
          const price = parseFloat(book.price);
          switch(filter) {
            case 'under-50':
              return price < 50000;
            case '50-100':
              return price >= 50000 && price <= 100000;
            case 'over-100':
              return price > 100000;
            case 'in-stock':
              return book.quantity > 0;
            default:
              return true;
          }
        });
      }
      
      // Áp dụng sắp xếp
      filteredBooks.sort((a, b) => {
        switch(sort) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price-low':
            return parseFloat(a.price) - parseFloat(b.price);
          case 'price-high':
            return parseFloat(b.price) - parseFloat(a.price);
          case 'newest':
            return new Date(b.publisher_year || 0) - new Date(a.publisher_year || 0);
          default:
            return 0;
        }
      });
      
      setBooks(filteredBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async (query, sort = 'name', filter = 'all') => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/api/store/books?search=${encodeURIComponent(query)}`);
      let filteredBooks = response.data;
      
      // Áp dụng bộ lọc
      if (filter !== 'all') {
        filteredBooks = filteredBooks.filter(book => {
          const price = parseFloat(book.price);
          switch(filter) {
            case 'under-50':
              return price < 50;
            case '50-100':
              return price >= 50 && price <= 100;
            case 'over-100':
              return price > 100;
            case 'in-stock':
              return book.quantity > 0;
            default:
              return true;
          }
        });
      }
      
      // Áp dụng sắp xếp
      filteredBooks.sort((a, b) => {
        switch(sort) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price-low':
            return parseFloat(a.price) - parseFloat(b.price);
          case 'price-high':
            return parseFloat(b.price) - parseFloat(a.price);
          case 'newest':
            return new Date(b.publisher_year || 0) - new Date(a.publisher_year || 0);
          default:
            return 0;
        }
      });
      
      setBooks(filteredBooks);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    params.set('sort', sortBy);
    params.set('filter', filterBy);
    setSearchParams(params);
  };

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
  };

  const handleFilterChange = (newFilter) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', newFilter);
    setSearchParams(params);
  };

  const addToCart = (book) => {
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
        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="mb-5">
          <div className="row">
            <div className="col-12">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "#2c3e50", textAlign: "center" }}>
                Tìm Kiếm Sách
              </h2>
              <div style={{ width: "60px", height: "3px", background: "#c0392b", margin: "15px auto" }}></div>
            </div>
          </div>
          
          {/* Form tìm kiếm */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Tìm kiếm theo tên sách, tác giả..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-dark" type="submit">
                    <i className="fas fa-search me-2"></i>Tìm kiếm
                  </button>
                </div>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select" 
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="name">Sắp xếp theo tên</option>
                  <option value="price-low">Giá: Thấp đến cao</option>
                  <option value="price-high">Giá: Cao đến thấp</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select" 
                  value={filterBy}
                  onChange={(e) => handleFilterChange(e.target.value)}
                >
                  <option value="all">Tất cả sách</option>
                  <option value="under-50">Dưới $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="over-100">Trên $100</option>
                  <option value="in-stock">Còn hàng</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        )}

        {/* Kết quả tìm kiếm */}
        {!loading && (
          <>
            {searchQuery && (
              <div className="mb-4">
                <h5>Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong></h5>
                <p>Tìm thấy {books.length} kết quả</p>
              </div>
            )}

            {books.length > 0 ? (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {books.map(item => (
                  <BookCard 
                    key={item.id} 
                    book={item} 
                    onAddToCart={addToCart} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">
                  {searchQuery ? `Không tìm thấy sách nào phù hợp với "${searchQuery}"` : 'Không có sách nào'}
                </h5>
                <p className="text-muted">Thử tìm kiếm với từ khóa khác</p>
              </div>
            )}
          </>
        )}
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
