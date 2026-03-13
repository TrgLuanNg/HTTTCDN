from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.controllers import storefront, dashboard, auth

app = FastAPI(title="Bookstore API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(storefront.router)
app.include_router(dashboard.router)