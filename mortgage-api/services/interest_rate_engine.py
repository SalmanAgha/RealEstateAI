def get_interest_rate(credit_score: int, ltv: float = None) -> float:
    """
    Deterministic interest rate based on credit score bracket + LTV adjustment.
    credit >= 800 -> 3.4%
    750-799 -> 3.6%
    700-749 -> 3.9%
    650-699 -> 4.3%
    < 650   -> 4.9%
    Then: LTV > 0.9 -> +0.3%, LTV < 0.8 -> -0.1%
    """
    if credit_score >= 800:
        base_rate = 3.4
    elif credit_score >= 750:
        base_rate = 3.6
    elif credit_score >= 700:
        base_rate = 3.9
    elif credit_score >= 650:
        base_rate = 4.3
    else:
        base_rate = 4.9

    # LTV adjustment
    if ltv is not None:
        if ltv > 0.9:
            base_rate += 0.3
        elif ltv < 0.8:
            base_rate -= 0.1

    return round(base_rate, 2)
