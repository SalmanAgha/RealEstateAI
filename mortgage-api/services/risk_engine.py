from typing import Dict, Any, List


def evaluate_risk(
    dti: float,
    ltv: float,
    savings_buffer: float,
    credit_score: int
) -> Dict[str, Any]:
    """
    Structured lender risk assessment.
    Each dimension classified with readable label and numeric value.
    """

    # DTI classification
    if dti < 0.30:
        dti_level = "Safe"
    elif dti <= 0.40:
        dti_level = "Moderate"
    elif dti <= 0.45:
        dti_level = "Elevated"
    else:
        dti_level = "High Risk"

    # LTV classification
    if ltv <= 0.80:
        ltv_level = "Safe"
    elif ltv <= 0.90:
        ltv_level = "Acceptable"
    elif ltv <= 0.95:
        ltv_level = "Elevated"
    else:
        ltv_level = "High Risk"

    # Savings buffer classification
    if savings_buffer >= 12:
        savings_level = "Strong"
    elif savings_buffer >= 6:
        savings_level = "Adequate"
    elif savings_buffer >= 3:
        savings_level = "Weak"
    else:
        savings_level = "Very Weak"

    # Credit score classification
    if credit_score >= 750:
        credit_level = "Excellent"
    elif credit_score >= 700:
        credit_level = "Good"
    elif credit_score >= 650:
        credit_level = "Fair"
    else:
        credit_level = "Risky"

    # Overall risk summary
    high_count = sum([
        dti_level in ("Elevated", "High Risk"),
        ltv_level in ("Elevated", "High Risk"),
        savings_level in ("Weak", "Very Weak"),
        credit_level in ("Fair", "Risky")
    ])

    if high_count >= 2:
        overall_risk = "high"
    elif high_count == 1:
        overall_risk = "medium"
    else:
        overall_risk = "low"

    risk_flags: List[Dict[str, Any]] = [
        {"type": "DTI", "label": "Debt-to-Income Ratio", "value": round(dti, 4), "display": f"{dti*100:.1f}%", "level": dti_level},
        {"type": "LTV", "label": "Loan-to-Value Ratio", "value": round(ltv, 4), "display": f"{ltv*100:.1f}%", "level": ltv_level},
        {"type": "SAVINGS", "label": "Savings Buffer", "value": round(savings_buffer, 1), "display": f"{savings_buffer:.1f} months", "level": savings_level},
        {"type": "CREDIT", "label": "Credit Score", "value": credit_score, "display": str(credit_score), "level": credit_level},
    ]

    return {
        "risk_flags": risk_flags,
        "overall_risk": overall_risk
    }
