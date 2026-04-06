from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

# ==========================================
# CATEGORY SCHEMAS
# ==========================================
class CategoryBase(BaseModel):
    name: str

class CategoryResponse(CategoryBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# AUTHOR SCHEMAS
# ==========================================
class AuthorBase(BaseModel):
    name: str

class AuthorResponse(AuthorBase):
    author_id: UUID
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# PUBLISHER SCHEMAS
# ==========================================
class PublisherBase(BaseModel):
    name: str

class PublisherResponse(PublisherBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# USER SCHEMAS
# ==========================================
class UserBase(BaseModel):
    email: EmailStr
    fullname: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    avatar_image: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# PRODUCT (BOOK) SCHEMAS
# ==========================================
class ProductBase(BaseModel):
    name: str
    price: Decimal
    quantity: int
    publisher_year: Optional[int] = None
    image: Optional[str] = None
    publisher_id: Optional[UUID] = None

class ProductCreate(ProductBase):
    category_ids: Optional[List[UUID]] = []
    author_ids: Optional[List[UUID]] = []

class ProductResponse(ProductBase):
    id: UUID
    categories: List[CategoryResponse] = []
    authors: List[AuthorResponse] = []
    publisher: Optional[PublisherResponse] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# BILL (ORDER) SCHEMAS
# ==========================================
class BillDetailResponse(BaseModel):
    product_id: UUID
    quantity: int
    price: Decimal
    model_config = ConfigDict(from_attributes=True)

class BillResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    date_create: datetime
    total_price: Decimal
    fullname: str
    address: str
    phone_number: str
    payment_method: str
    details: List[BillDetailResponse] = []
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# DASHBOARD SCHEMAS
# ==========================================
class DashboardStats(BaseModel):
    total_products: int
    total_users: int
    total_orders: int
    total_revenue: float