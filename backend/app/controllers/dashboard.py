from fastapi import APIRouter, Depends, HTTPException, status
from typing import List  
from datetime import datetime   
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from app.core.database import get_db
from app.models.models import Product, User, Category, Author, Publisher, Bill, Role, StaffSchedule, SalaryPayment
from app.schemas.schemas import (
    ProductCreate, ProductResponse, 
    UserCreate, UserResponse,
    CategoryResponse, AuthorResponse, PublisherResponse
)
from app.core.security import get_password_hash
from app.schemas import schemas

router = APIRouter(prefix="/api/admin", tags=["Dashboard"])

# ==========================================
# 1. API THỐNG KÊ (Cho trang chủ Admin)
# ==========================================
@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_revenue = db.query(func.sum(Bill.total_price)).scalar() or 0
    return {
        "total_products": db.query(Product).count(),
        "total_users": db.query(User).count(),
        "total_orders": db.query(Bill).count(),
        "total_revenue": float(total_revenue)
    }

# ==========================================
# 2. QUẢN LÝ SÁCH (PRODUCTS)
# ==========================================

@router.get("/books", response_model=List[ProductResponse])
def get_all_books(db: Session = Depends(get_db)):
    return db.query(Product).all()

@router.post("/books", response_model=ProductResponse)
def create_book(product_in: ProductCreate, db: Session = Depends(get_db)):
    # 1. Tách các ID quan hệ ra khỏi dữ liệu chính
    data = product_in.model_dump(exclude={"category_ids", "author_ids"})
    new_product = Product(**data)

    # 2. Gắn Thể loại (Many-to-Many)
    if product_in.category_ids:
        categories = db.query(Category).filter(Category.id.in_(product_in.category_ids)).all()
        new_product.categories.extend(categories)

    # 3. Gắn Tác giả (Many-to-Many)
    if product_in.author_ids:
        authors = db.query(Author).filter(Author.author_id.in_(product_in.author_ids)).all()
        new_product.authors.extend(authors)

    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/books/{book_id}", response_model=ProductResponse)
def update_book(book_id: UUID, product_in: ProductCreate, db: Session = Depends(get_db)):
    book = db.query(Product).filter(Product.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Không tìm thấy sách")

    # Cập nhật thông tin cơ bản
    data = product_in.model_dump(exclude={"category_ids", "author_ids"})
    for key, value in data.items():
        setattr(book, key, value)

    # Cập nhật quan hệ Many-to-Many (Xóa cũ - Thêm mới)
    book.categories.clear()
    book.authors.clear()
    
    if product_in.category_ids:
        book.categories = db.query(Category).filter(Category.id.in_(product_in.category_ids)).all()
    if product_in.author_ids:
        book.authors = db.query(Author).filter(Author.author_id.in_(product_in.author_ids)).all()

    db.commit()
    db.refresh(book)
    return book

@router.delete("/books/{book_id}")
def delete_book(book_id: UUID, db: Session = Depends(get_db)):
    book = db.query(Product).filter(Product.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Sách không tồn tại")
    
    db.delete(book)
    db.commit()
    return {"message": "Đã xóa sách thành công"}

# ==========================================
# 3. QUẢN LÝ NGƯỜI DÙNG (USERS)
# ==========================================

@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/users", response_model=UserResponse)
def create_admin_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
    
    user_data = user.model_dump()
    # QUAN TRỌNG: Bảo mật mật khẩu trước khi lưu
    user_data["password"] = get_password_hash(user_data["password"])
    
    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ==========================================
# 4. TIỆN ÍCH (Dùng cho Dropdown ở Frontend)
# ==========================================

@router.get("/publishers", response_model=List[PublisherResponse])
def get_all_publishers(db: Session = Depends(get_db)):
    return db.query(Publisher).all()

@router.get("/categories", response_model=List[CategoryResponse])
def get_all_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/authors", response_model=List[AuthorResponse])
def get_all_authors(db: Session = Depends(get_db)):
    return db.query(Author).all()

@router.get("/orders", response_model=List[schemas.BillResponse]) # Bạn cần tạo thêm BillResponse schema
def get_orders(db: Session = Depends(get_db)):
    # joinedload giúp lấy luôn cả bảng bill_detail trong 1 lần gọi API
    return db.query(Bill).options(joinedload(Bill.details)).all()

@router.delete("/orders/{order_id}")
def delete_order(order_id: UUID, db: Session = Depends(get_db)):
    order = db.query(Bill).filter(Bill.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Đơn hàng không tồn tại")
    
    # Xóa chi tiết đơn hàng trước (nếu database chưa đặt ON DELETE CASCADE)
    db.query(BillDetail).filter(BillDetail.bill_id == order_id).delete()
    
    db.delete(order)
    db.commit()
    return {"message": "Đã xóa đơn hàng thành công"}

@router.get("/staff")
def get_all_staff(db: Session = Depends(get_db)):
    # Lấy những user có role là 'staff'
    staff_role = db.query(Role).filter(Role.name == "staff").first()
    return db.query(User).filter(User.role_id == staff_role.id).all()

@router.get("/staff/{staff_id}/schedule")
def get_staff_schedule(staff_id: UUID, db: Session = Depends(get_db)):
    return db.query(StaffSchedule).filter(StaffSchedule.user_id == staff_id).all()

@router.post("/staff/{staff_id}/schedule")
def update_staff_schedule(staff_id: UUID, schedule_data: List[dict], db: Session = Depends(get_db)):
    # Xóa lịch cũ và ghi đè lịch mới
    db.query(StaffSchedule).filter(StaffSchedule.user_id == staff_id).delete()
    for item in schedule_data:
        new_shift = StaffSchedule(user_id=staff_id, day_of_week=item['day'], shift_type=item['shift'])
        db.add(new_shift)
    db.commit()
    return {"message": "Cập nhật lịch thành công"}

@router.post("/staff/{staff_id}/pay")
def pay_salary(staff_id: UUID, amount: float, db: Session = Depends(get_db)):
    new_payment = SalaryPayment(user_id=staff_id, amount=amount, month_year=datetime.now().strftime("%m-%Y"))
    db.add(new_payment)
    db.commit()
    return {"message": "Xác nhận thanh toán lương thành công"}