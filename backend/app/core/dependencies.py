from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.models import User, Role

def get_admin_user(current_user: User = Depends(get_current_user)):
    # Thay 'admin' bằng tên role thực tế trong DB của bạn
    if current_user.role.name != "admin": 
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ Admin mới được truy cập")
    return current_user

def get_staff_or_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role.name not in ["admin", "staff"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không có quyền truy cập")
    return current_user