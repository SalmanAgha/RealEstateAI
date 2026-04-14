import random
from sqlalchemy.orm import Session
from database import SessionLocal, User, MortgageAnalysis, init_db
from services.financial_engine import calculate_monthly_payment, mock_interest_rate
from services.risk_engine import evaluate_risk

def seed_data():
    init_db()
    db = SessionLocal()
    
    employment_types = ["full-time", "part-time", "self-employed"]
    locations = ["Berlin", "Munich", "Hamburg", "Frankfurt", "Stuttgart"]
    
    print(f"Seeding 50 realistic user profiles...")
    
    for i in range(50):
        # Generate realistic user data
        income = random.randint(3000, 12000)
        expenses = random.randint(1500, int(income * 0.6))
        savings = random.randint(10000, 150000)
        credit_score = random.randint(500, 850)
        existing_debt = random.randint(0, 1500)
        prop_price = random.randint(200000, 800000)
        down_payment = random.randint(int(prop_price * 0.05), int(prop_price * 0.3))
        
        user = User(
            user_id_ext=f"user_{i:03d}",
            monthly_income=income,
            monthly_expenses=expenses,
            savings=savings,
            employment_type=random.choice(employment_types),
            credit_score=credit_score,
            existing_debt=existing_debt
        )
        db.add(user)
        db.flush() # get id
        
        # Create an analysis for this user
        loan_amount = prop_price - down_payment
        rate = mock_interest_rate(credit_score)
        payment = calculate_monthly_payment(loan_amount, rate, 30)
        
        risk = evaluate_risk(payment, existing_debt, income, loan_amount, prop_price, savings, expenses)
        
        analysis = MortgageAnalysis(
            user_id=user.id,
            loan_amount=loan_amount,
            monthly_payment=payment,
            dti=risk['dti'],
            ltv=risk['ltv'],
            affordability=risk['affordability'],
            risk_score=risk['score'],
            risk_flags=",".join(risk['risk_flags']),
            explanation="Seeded analysis record."
        )
        db.add(analysis)
        
    db.commit()
    print("Done! 50 users and analyses profiles seeded.")
    db.close()

if __name__ == "__main__":
    seed_data()
