from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME="email_cua_ban@gmail.com",
    MAIL_PASSWORD="mat_khau_ung_dung_google",
    MAIL_FROM="email_cua_ban@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_order_confirmation(email_to: EmailStr, bill_id: str, total_price: float):
    html = f"""
    <h3>Cảm ơn bạn đã mua sách!</h3>
    <p>Mã đơn hàng: <b>{bill_id}</b></p>
    <p>Tổng thanh toán: <b>${total_price}</b></p>
    """
    
    message = MessageSchema(
        subject="Xác nhận đơn hàng - Bookstore",
        recipients=[email_to],
        body=html,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)