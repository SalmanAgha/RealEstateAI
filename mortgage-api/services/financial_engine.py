import math

def calculate_monthly_payment(loan_amount: float, annual_interest_rate: float, term_years: int) -> float:
    """
    Standard amortization formula.
    P = loan_amount
    r = monthly interest rate (annual_interest_rate / 12 / 100)
    n = number of months (term_years * 12)
    """
    if loan_amount <= 0:
        return 0.0
    
    monthly_rate = annual_interest_rate / 12 / 100
    num_months = term_years * 12
    
    if monthly_rate == 0:
        return loan_amount / num_months
        
    payment = (loan_amount * monthly_rate * math.pow(1 + monthly_rate, num_months)) / (math.pow(1 + monthly_rate, num_months) - 1)
    return round(payment, 2)

def mock_interest_rate(credit_score: int) -> float:
    """
    Mock interest rate based on credit score.
    Higher credit score = lower interest rate.
    """
    if credit_score >= 800:
        return 3.5
    elif credit_score >= 740:
        return 3.8
    elif credit_score >= 670:
        return 4.2
    elif credit_score >= 580:
        return 5.5
    else:
        return 7.0
