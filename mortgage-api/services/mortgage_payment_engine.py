import math


def compute_monthly_payment(loan_amount: float, annual_rate_pct: float, term_years: int) -> float:
    """
    Standard amortization formula:
    M = P * (r * (1+r)^n) / ((1+r)^n - 1)
    P = loan amount
    r = monthly interest rate (annual_rate_pct / 12 / 100)
    n = term_years * 12
    """
    if loan_amount <= 0:
        return 0.0

    r = annual_rate_pct / 12 / 100
    n = term_years * 12

    if r == 0:
        return round(loan_amount / n, 2)

    payment = (loan_amount * r * math.pow(1 + r, n)) / (math.pow(1 + r, n) - 1)
    return round(payment, 2)
