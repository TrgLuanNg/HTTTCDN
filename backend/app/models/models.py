# backend/app/models/models.py
import uuid
import datetime
from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, Text, Table
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from sqlalchemy.orm import relationship
from app.core.database import Base
from sqlalchemy import DateTime
from sqlalchemy.sql import func

# ==========================================
# BẢNG TRUNG GIAN (Many-to-Many)
# ==========================================
product_categories = Table(
    'product_categories', Base.metadata,
    Column('product_id', UUID(as_uuid=True), ForeignKey('products.id', ondelete="CASCADE"), primary_key=True),
    Column('category_id', UUID(as_uuid=True), ForeignKey('category.id', ondelete="CASCADE"), primary_key=True)
)

product_authors = Table(
    'product_authors', Base.metadata,
    Column('author_id', UUID(as_uuid=True), ForeignKey('author.author_id', ondelete="CASCADE"), primary_key=True),
    Column('product_id', UUID(as_uuid=True), ForeignKey('products.id', ondelete="CASCADE"), primary_key=True)
)

# ==========================================
# CÁC BẢNG CHÍNH (Models)
# ==========================================
class Category(Base):
    __tablename__ = "category"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    
    # Quan hệ n-n với Products
    products = relationship("Product", secondary=product_categories, back_populates="categories")

class Author(Base):
    __tablename__ = "author"
    author_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    
    # Quan hệ n-n với Products
    products = relationship("Product", secondary=product_authors, back_populates="authors")

class Publisher(Base):
    __tablename__ = "publisher"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    
    # Quan hệ 1-n với Products
    products = relationship("Product", back_populates="publisher")

class Product(Base):
    __tablename__ = "products"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    publisher_id = Column(UUID(as_uuid=True), ForeignKey("publisher.id"))
    name = Column(String(255), nullable=False)
    image = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    discount = Column(Numeric(5, 2), default=0)
    quantity = Column(Integer, default=0)
    publisher_year = Column(Integer)
    
    # SQLAlchemy không hỗ trợ quản lý cột GENERATED ALWAYS AS trực tiếp, 
    # nên ta chỉ cần định nghĩa nó để đọc dữ liệu (không insert/update)
    search_vector = Column(TSVECTOR, server_default=None)

    # Khai báo các mối quan hệ
    publisher = relationship("Publisher", back_populates="products")
    categories = relationship("Category", secondary=product_categories, back_populates="products")
    authors = relationship("Author", secondary=product_authors, back_populates="products")

class Role(Base):
    __tablename__ = "role"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)

class User(Base):
    __tablename__ = "user"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("role.id"))
    fullname = Column(String(150))
    address = Column(Text)
    avatar_image = Column(Text)
    phone_number = Column(String(20))
    gender = Column(String(10))
    role = relationship("Role")

class Bill(Base):
    __tablename__ = "bill"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"))
    staff_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=True)
    date_create = Column(DateTime(timezone=True), server_default=func.now())
    total_price = Column(Numeric(12, 2), nullable=False)
    address = Column(Text)
    fullname = Column(String(150))
    phone_number = Column(String(20))
    payment_method = Column(String(50))
    
    details = relationship("BillDetail", back_populates="bill")

class BillDetail(Base):
    __tablename__ = "bill_detail"
    bill_id = Column(UUID(as_uuid=True), ForeignKey("bill.id", ondelete="CASCADE"), primary_key=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), primary_key=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)

    # Quan hệ ngược lại với Bill và Product
    bill = relationship("Bill", back_populates="details")
    product = relationship("Product")

class StaffSchedule(Base):
    __tablename__ = "staff_schedule"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"))
    day_of_week = Column(String(20)) # T2 -> CN
    shift_type = Column(String(20))   # Sáng, Chiều, Tối

class SalaryPayment(Base):
    __tablename__ = "salary_payments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"))
    amount = Column(Numeric(15, 2))
    # Dùng datetime.datetime.utcnow nếu bạn import datetime
    payment_date = Column(DateTime, default=datetime.datetime.utcnow) 
    month_year = Column(String(7))