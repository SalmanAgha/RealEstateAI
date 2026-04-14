from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Use same DB but maybe different app flow
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mortgage.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "mortgage_users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id_ext = Column(String, unique=True, index=True) # external ID
    monthly_income = Column(Float)
    monthly_expenses = Column(Float)
    savings = Column(Float)
    employment_type = Column(String)
    credit_score = Column(Integer)
    existing_debt = Column(Float)
    
    analyses = relationship("MortgageAnalysis", back_populates="user")

class MortgageAnalysis(Base):
    __tablename__ = "mortgage_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("mortgage_users.id"))
    loan_amount = Column(Float)
    monthly_payment = Column(Float)
    dti = Column(Float)
    ltv = Column(Float)
    affordability = Column(String)
    risk_score = Column(Integer)
    risk_flags = Column(String) # comma separated
    explanation = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="analyses")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
