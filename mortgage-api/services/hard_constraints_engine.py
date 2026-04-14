from typing import Dict, Any, List


def evaluate_hard_constraints(
    dti: float,
    ltv: float,
    savings_buffer: float,
    credit_score: int
) -> Dict[str, Any]:
    """
    Evaluate hard lending constraints — binary pass/fail with values.
    These represent non-negotiable underwriting thresholds.
    """
    constraints: List[Dict[str, Any]] = []

    # DTI must be under 45%
    dti_pass = dti <= 0.45
    constraints.append({
        "name": "DTI under 45%",
        "threshold": 0.45,
        "value": round(dti, 4),
        "display_value": f"{dti*100:.1f}%",
        "status": "pass" if dti_pass else "fail",
        "note": "Maximum allowable debt-to-income ratio"
    })

    # LTV must be under 95%
    ltv_pass = ltv <= 0.95
    constraints.append({
        "name": "LTV under 95%",
        "threshold": 0.95,
        "value": round(ltv, 4),
        "display_value": f"{ltv*100:.1f}%",
        "status": "pass" if ltv_pass else "fail",
        "note": "Lenders rarely finance above 95% of property value"
    })

    # Minimum savings buffer of 3 months
    savings_pass = savings_buffer >= 3
    constraints.append({
        "name": "Minimum 3-month savings buffer",
        "threshold": 3.0,
        "value": round(savings_buffer, 1),
        "display_value": f"{savings_buffer:.1f} months",
        "status": "pass" if savings_pass else "fail",
        "note": "Minimum post-closing liquidity requirement"
    })

    # Credit score must be at least 600
    credit_pass = credit_score >= 600
    constraints.append({
        "name": "Credit score above 600",
        "threshold": 600,
        "value": credit_score,
        "display_value": str(credit_score),
        "status": "pass" if credit_pass else "fail",
        "note": "Minimum credit threshold for standard mortgage products"
    })

    overall_pass = all(c["status"] == "pass" for c in constraints)

    return {
        "constraints": constraints,
        "overall_status": "pass" if overall_pass else "fail"
    }
