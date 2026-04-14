from .interest_rate_engine import get_interest_rate
from .mortgage_payment_engine import compute_monthly_payment
from typing import Dict


def compute_financial_metrics(
    property_price: float,
    down_payment: float,
    credit_score: int,
    term_years: int,
    monthly_income: float,
    existing_debt: float,
    total_savings: float,
    monthly_expenses: float
) -> Dict[str, float]:
    """
    Computes all core mortgage financial metrics deterministically.
    Uses credit_score-based interest rate and LTV-adjusted rate.
    """
    if property_price <= 0:
        raise ValueError("property_price must be > 0")

    loan_amount = property_price - down_payment
    if loan_amount <= 0:
        raise ValueError("loan_amount must be > 0 (down_payment must be less than property_price)")

    # LTV (needed to determine interest rate adjustment)
    ltv = loan_amount / property_price

    # Get interest rate using credit score + LTV
    annual_rate = get_interest_rate(credit_score, ltv)

    # Monthly payment using amortization
    monthly_payment = compute_monthly_payment(loan_amount, annual_rate, term_years)

    # DTI: (monthly_payment + existing_debt) / monthly_income
    dti = (monthly_payment + existing_debt) / monthly_income if monthly_income > 0 else 1.0

    # Savings buffer: total_savings / monthly_expenses
    savings_buffer = total_savings / monthly_expenses if monthly_expenses > 0 else 0.0

    return {
        "loan_amount": round(loan_amount, 2),
        "annual_interest_rate": annual_rate,
        "monthly_payment": round(monthly_payment, 2),
        "dti": round(dti, 4),
        "ltv": round(ltv, 4),
        "savings_buffer": round(savings_buffer, 2)
    }
