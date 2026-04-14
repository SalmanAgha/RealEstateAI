from typing import Dict, Any


def _dti_subscore(dti: float) -> int:
    """DTI subscore: 0–100, weight 40%"""
    if dti < 0.30:
        return 95
    elif dti <= 0.40:
        return 75
    elif dti <= 0.45:
        return 45
    else:
        return 15


def _ltv_subscore(ltv: float) -> int:
    """LTV subscore: 0–100, weight 30%"""
    if ltv <= 0.80:
        return 95
    elif ltv <= 0.90:
        return 75
    elif ltv <= 0.95:
        return 40
    else:
        return 10


def _credit_subscore(credit_score: int) -> int:
    """Credit subscore: 0–100, weight 20%"""
    if credit_score >= 750:
        return 95
    elif credit_score >= 700:
        return 80
    elif credit_score >= 650:
        return 55
    else:
        return 25


def _savings_subscore(savings_buffer: float) -> int:
    """Savings buffer subscore: 0–100, weight 10%"""
    if savings_buffer >= 12:
        return 95
    elif savings_buffer >= 6:
        return 75
    elif savings_buffer >= 3:
        return 45
    else:
        return 20


def predict_approval(
    dti: float,
    ltv: float,
    credit_score: int,
    savings_buffer: float
) -> Dict[str, Any]:
    """
    Weighted scoring-based approval engine.
    DTI 40%, LTV 30%, Credit 20%, Savings 10%.
    Hard override caps applied for extreme risk metrics.
    Output probability capped at 95 (never 100%).
    """
    dti_s = _dti_subscore(dti)
    ltv_s = _ltv_subscore(ltv)
    credit_s = _credit_subscore(credit_score)
    savings_s = _savings_subscore(savings_buffer)

    # Weighted composite score (0–100)
    score = dti_s * 0.4 + ltv_s * 0.3 + credit_s * 0.2 + savings_s * 0.1

    # Hard override penalties (cap score)
    if dti > 0.45:
        score = min(score, 45)
    if ltv > 0.95:
        score = min(score, 40)
    if savings_buffer < 3:
        score = min(score, 55)
    if credit_score < 600:
        score = min(score, 35)

    # Final cap: never exceed 95
    approval_probability = min(round(score), 95)

    # Decision mapping
    if approval_probability >= 85:
        decision = "likely"
    elif approval_probability >= 70:
        decision = "acceptable"
    elif approval_probability >= 55:
        decision = "borderline"
    else:
        decision = "risky"

    # Confidence logic
    risk_count = sum([
        dti > 0.40,
        ltv > 0.90,
        savings_buffer < 6,
        credit_score < 650
    ])
    if risk_count == 0:
        confidence = "high"
    elif risk_count == 1:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "approval_probability": float(approval_probability),
        "decision": decision,
        "confidence": confidence,
        "subscores": {
            "dti_score": dti_s,
            "ltv_score": ltv_s,
            "credit_score": credit_s,
            "savings_score": savings_s
        }
    }
