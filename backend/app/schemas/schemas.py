# backend/app/schemas/schemas.py
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

# ==========================================
# 1. SCHEMAS CHO CATEGORY & AUTHOR (Dùng để hiển thị lồng ghép)
# ==========================================
class CategoryResponse(BaseModel):
    id: UUID
    name: str
    model_config = ConfigDict(from_attributes=True) # Giúp Pydantic đọc được dữ liệu từ SQLAlchemy

class AuthorResponse(BaseModel):
    author_id: UUID
    name: str
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 2. SCHEMAS CHO USER (Tài khoản)
# ==========================================
class UserBase(BaseModel):
    email: EmailStr # Tự động validate chuẩn email có @
    fullname: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None

# Schema dùng khi Khách hàng Đăng ký (Cần password)
class UserCreate(UserBase):
    password: str

# Schema dùng khi trả dữ liệu về cho Frontend (KHÔNG có password)
class UserResponse(UserBase):
    id: UUID
    role_id: Optional[UUID] = None
    avatar_image: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 3. SCHEMAS CHO PRODUCT (Sách)
# ==========================================
class ProductBase(BaseModel):
    name: str
    price: Decimal
    discount: Optional[Decimal] = 0
    quantity: Optional[int] = 0
    publisher_year: Optional[int] = None

# Schema dùng khi Admin thêm sách mới
class ProductCreate(ProductBase):
    publisher_id: UUID
    category_ids: List[UUID] = [] # Nhận một mảng ID các thể loại
    author_ids: List[UUID] = []   # Nhận một mảng ID các tác giả
    image: Optional[str] = None

# Schema dùng khi trả dữ liệu sách về cho Frontend (Có kèm chi tiết Thể loại và Tác giả)
class ProductResponse(ProductBase):
    id: UUID
    publisher_id: Optional[UUID] = None
    image: Optional[str] = None
    
    # Hiển thị luôn danh sách thể loại và tác giả của cuốn sách đó
    categories: List[CategoryResponse] = []
    authors: List[AuthorResponse] = []
    
    model_config = ConfigDict(from_attributes=True)