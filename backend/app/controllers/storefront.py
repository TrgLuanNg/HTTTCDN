from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from uuid import UUID
from pydantic import BaseModel

from app.core.database import get_db
from app.models.models import Bill, BillDetail, Product, User
from app.schemas.schemas import ProductResponse
from app.core.security import get_current_user
from app.services.email import send_order_confirmation

# Schema nhận dữ liệu giỏ hàng từ Frontend
class CartItem(BaseModel):
    product_id: UUID
    quantity: int

class CheckoutRequest(BaseModel):
    address: str
    phone_number: str
    items: List[CartItem]

router = APIRouter(prefix="/store", tags=["Storefront"])

@router.get("/books", response_model=List[ProductResponse])
def get_books(search: str = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    
    if search:
        search_query = " & ".join(search.split()) + ":*"
        query = query.filter(
            text("search_vector @@ to_tsquery('simple', immutable_unaccent(:search))")
        ).params(search=search_query)
        
    return query.all()

@router.get("/books/{book_id}", response_model=ProductResponse)
def get_book_detail(book_id: UUID, db: Session = Depends(get_db)):
    book = db.query(Product).filter(Product.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.post("/checkout")
async def checkout(
    request: CheckoutRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    total_price = 0
    bill_details = []

    for item in request.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} is unavailable or out of stock")
        
        price = product.price - (product.price * (product.discount / 100))
        total_price += price * item.quantity
        
        product.quantity -= item.quantity # Trừ tồn kho
        
        bill_details.append(
            BillDetail(product_id=product.id, quantity=item.quantity, price=price)
        )

    new_bill = Bill(
        user_id=current_user.id,
        total_price=total_price,
        address=request.address,
        fullname=current_user.fullname,
        phone_number=request.phone_number
    )
    
    db.add(new_bill)
    db.flush() 

    for detail in bill_details:
        detail.bill_id = new_bill.id
        db.add(detail)

    db.commit()
    db.refresh(new_bill)

    # Gọi hàm gửi mail bất đồng bộ
    await send_order_confirmation(
        email_to=current_user.email, 
        bill_id=str(new_bill.id), 
        total_price=float(new_bill.total_price)
    )

    return {"message": "Checkout successful", "bill_id": new_bill.id}