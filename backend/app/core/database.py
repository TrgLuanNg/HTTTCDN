# backend/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Nhớ thay chữ 'postgres' và 'matkhau_cua_ban' bằng user và password pgAdmin của máy bạn nhé
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:dgnchitg@localhost/bookstore_htttdn"

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