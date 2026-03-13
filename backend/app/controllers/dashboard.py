from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.models import Product, User, Category, Author
from app.schemas.schemas import ProductCreate, ProductResponse, UserCreate, UserResponse

router = APIRouter(prefix="/admin", tags=["Dashboard"])

@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(**user.model_dump())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/books", response_model=ProductResponse)
def create_book(product_in: ProductCreate, db: Session = Depends(get_db)):
    data = product_in.model_dump(exclude={"category_ids", "author_ids"})
    new_product = Product(**data)

    if product_in.category_ids:
        categories = db.query(Category).filter(Category.id.in_(product_in.category_ids)).all()
        new_product.categories.extend(categories)

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
        raise HTTPException(status_code=404, detail="Book not found")

    data = product_in.model_dump(exclude={"category_ids", "author_ids"})
    for key, value in data.items():
        setattr(book, key, value)

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
        raise HTTPException(status_code=404, detail="Book not found")
    
    db.delete(book)
    db.commit()
    return {"message": "Book deleted successfully"}