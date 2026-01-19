from app.config import settings
from app.db import Base, SessionLocal, engine
from app.models import Role, User
from app.security import get_password_hash


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    existing = db.query(User).filter(User.email == settings.admin_seed_email).first()
    if existing:
        print("Admin already exists")
        db.close()
        return

    user = User(email=settings.admin_seed_email, password_hash=get_password_hash(settings.admin_seed_password), role=Role.admin)
    db.add(user)
    db.commit()
    print(f"Seeded admin user {settings.admin_seed_email}")
    db.close()


if __name__ == "__main__":
    seed()
