# backend/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Thay đổi thông tin đăng nhập PostgreSQL của bạn vào đây
SQLALCHEMY_DATABASE_URL = "postgresql://bookstore_admin:matkhau_cua_ban_123@localhost:5432/bookstore_db"

# Khởi tạo Engine kết nối
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Tạo Session để thực hiện các phiên làm việc (query, insert, update)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class để các Model kế thừa
Base = declarative_base()

# Dependency để sử dụng trong FastAPI (mở session khi có request, đóng khi xong)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()