from typing import List, Dict, Any
from .financial_engine import calculate_monthly_payment, mock_interest_rate

def generate_mortgage_options(
    property_price: float,
    down_payment: float,
    credit_score: int
) -> List[Dict[str, Any]]:
    """
    Generates conservative, balanced, and aggressive mortgage options.
    """
    options = []
    
    # 1. Conservative (higher down payment if possible, standard 30yr)
    cons_loan_amount = property_price - (down_payment * 1.2) # simulate putting more down
    cons_rate = mock_interest_rate(credit_score)
    cons_term = 30
    cons_payment = calculate_monthly_payment(max(0, cons_loan_amount), cons_rate, cons_term)
    
    options.append({
        "type": "conservative",
        "loan_amount": round(cons_loan_amount, 2),
        "interest_rate": cons_rate,
        "term_years": cons_term,
        "monthly_payment": cons_payment,
        "description": "Lower loan-to-value (LTV) for maximum safety."
    })
    
    # 2. Balanced (base case)
    bal_loan_amount = property_price - down_payment
    bal_rate = mock_interest_rate(credit_score)
    bal_term = 25
    bal_payment = calculate_monthly_payment(max(0, bal_loan_amount), bal_rate, bal_term)
    
    options.append({
        "type": "balanced",
        "loan_amount": round(bal_loan_amount, 2),
        "interest_rate": bal_rate,
        "term_years": bal_term,
        "monthly_payment": bal_payment,
        "description": "Standard term for quicker equity build."
    })
    
    # 3. Aggressive (minimal down payment, maybe 40yr?)
    agg_loan_amount = property_price - (down_payment * 0.8) # simulate putting less down
    agg_rate = mock_interest_rate(credit_score) + 0.5 # higher interest for less down
    agg_term = 25
    agg_payment = calculate_monthly_payment(max(0, agg_loan_amount), agg_rate, agg_term)
    
    options.append({
        "type": "aggressive",
        "loan_amount": round(agg_loan_amount, 2),
        "interest_rate": agg_rate,
        "term_years": agg_term,
        "monthly_payment": agg_payment,
        "description": "Higher leverage to maximize initial cash liquidity."
    })
    
    return options
