from typing import List, Dict, Any
from .financial_metrics import compute_financial_metrics
from .approval_engine import predict_approval


def _build_metrics_snapshot(
    property_price: float,
    down_payment: float,
    credit_score: int,
    term_years: int,
    monthly_income: float,
    existing_debt: float,
    total_savings: float,
    monthly_expenses: float
) -> Dict[str, Any]:
    """Helper: compute metrics + approval for a given parameter set."""
    m = compute_financial_metrics(
        property_price, down_payment, credit_score, term_years,
        monthly_income, existing_debt, total_savings, monthly_expenses
    )
    a = predict_approval(m["dti"], m["ltv"], credit_score, m["savings_buffer"])
    return {
        "loan_amount": m["loan_amount"],
        "monthly_payment": m["monthly_payment"],
        "dti": m["dti"],
        "ltv": m["ltv"],
        "savings_buffer": m["savings_buffer"],
        "annual_interest_rate": m["annual_interest_rate"],
        "approval_probability": a["approval_probability"],
        "decision": a["decision"]
    }


def generate_scenarios(
    property_price: float,
    down_payment: float,
    credit_score: int,
    monthly_income: float,
    existing_debt: float,
    total_savings: float,
    monthly_expenses: float,
    term_years: int = 30
) -> List[Dict[str, Any]]:
    """
    Generates exactly 3 deterministic scenarios with full before/after metrics.
    Scenario 1: Conservative — increase down payment by €15,000
    Scenario 2: Term Optimization — shorten term to 20 years
    Scenario 3: Price Sensitivity — property price decreases by 10%
    """
    base = _build_metrics_snapshot(
        property_price, down_payment, credit_score, term_years,
        monthly_income, existing_debt, total_savings, monthly_expenses
    )

    scenarios = []

    # --- Scenario 1: Conservative (Higher Down Payment) ---
    new_down = down_payment + 15000
    s1 = _build_metrics_snapshot(
        property_price, new_down, credit_score, term_years,
        monthly_income, existing_debt, total_savings, monthly_expenses
    )
    ltv_delta_s1 = (s1["ltv"] - base["ltv"]) * 100
    pay_delta_s1 = s1["monthly_payment"] - base["monthly_payment"]
    prob_delta_s1 = int(s1["approval_probability"] - base["approval_probability"])

    impact_s1 = [
        f"LTV reduced from {base['ltv']*100:.1f}% to {s1['ltv']*100:.1f}% ({ltv_delta_s1:+.1f}pp)",
        f"Monthly payment changed by €{pay_delta_s1:+.0f} (from €{base['monthly_payment']:,.0f} to €{s1['monthly_payment']:,.0f})",
        f"Approval probability changed from {int(base['approval_probability'])}% to {int(s1['approval_probability'])}% ({prob_delta_s1:+d}pp)"
    ]

    scenarios.append({
        "scenario": "Conservative",
        "label": "Higher Down Payment",
        "input_changes": [f"Down payment increased from €{down_payment:,.0f} to €{new_down:,.0f}"],
        "metrics_before": {k: base[k] for k in ["loan_amount", "monthly_payment", "dti", "ltv", "approval_probability"]},
        "metrics_after": {k: s1[k] for k in ["loan_amount", "monthly_payment", "dti", "ltv", "approval_probability"]},
        "impact_summary": impact_s1,
        "interpretation": "Higher upfront equity lowers lender exposure, reduces the loan principal, and typically improves approval strength."
    })

    # --- Scenario 2: Term Optimization (Shorter Loan Term) ---
    short_term = 20
    s2 = _build_metrics_snapshot(
        property_price, down_payment, credit_score, short_term,
        monthly_income, existing_debt, total_savings, monthly_expenses
    )
    dti_delta_s2 = (s2["dti"] - base["dti"]) * 100
    pay_delta_s2 = s2["monthly_payment"] - base["monthly_payment"]
    prob_delta_s2 = int(s2["approval_probability"] - base["approval_probability"])
    base_total_interest = base["monthly_payment"] * term_years * 12 - base["loan_amount"]
    s2_total_interest = s2["monthly_payment"] * short_term * 12 - s2["loan_amount"]
    interest_saved = base_total_interest - s2_total_interest

    impact_s2 = [
        f"Monthly payment increased by €{pay_delta_s2:+.0f} (from €{base['monthly_payment']:,.0f} to €{s2['monthly_payment']:,.0f})",
        f"DTI changed from {base['dti']*100:.1f}% to {s2['dti']*100:.1f}% ({dti_delta_s2:+.1f}pp)",
        f"Total interest saved over loan life: €{interest_saved:,.0f}",
        f"Approval probability changed from {int(base['approval_probability'])}% to {int(s2['approval_probability'])}% ({prob_delta_s2:+d}pp)"
    ]

    scenarios.append({
        "scenario": "Term Optimization",
        "label": "Shorter 20-Year Term",
        "input_changes": [f"Loan term reduced from {term_years} years to {short_term} years"],
        "metrics_before": {k: base[k] for k in ["loan_amount", "monthly_payment", "dti", "ltv", "approval_probability"]},
        "metrics_after": {k: s2[k] for k in ["loan_amount", "monthly_payment", "dti", "ltv", "approval_probability"]},
        "impact_summary": impact_s2,
        "interpretation": "Shorter terms reduce total interest cost substantially but increase monthly obligations. Approval depends on whether elevated payments push DTI above threshold."
    })

    # --- Scenario 3: Price Sensitivity (Lower Property Price) ---
    lower_price = property_price * 0.90
    s3 = _build_metrics_snapshot(
        lower_price, down_payment, credit_score, term_years,
        monthly_income, existing_debt, total_savings, monthly_expenses
    )
    ltv_delta_s3 = (s3["ltv"] - base["ltv"]) * 100
    pay_delta_s3 = s3["monthly_payment"] - base["monthly_payment"]
    prob_delta_s3 = int(s3["approval_probability"] - base["approval_probability"])

    impact_s3 = [
        f"Loan amount reduced from €{base['loan_amount']:,.0f} to €{s3['loan_amount']:,.0f}",
        f"LTV changed from {base['ltv']*100:.1f}% to {s3['ltv']*100:.1f}% ({ltv_delta_s3:+.1f}pp)",
        f"Monthly payment reduced by €{abs(pay_delta_s3):.0f} (from €{base['monthly_payment']:,.0f} to €{s3['monthly_payment']:,.0f})",
        f"Approval probability changed from {int(base['approval_probability'])}% to {int(s3['approval_probability'])}% ({prob_delta_s3:+d}pp)"
    ]

    scenarios.append({
        "scenario": "Price Sensitivity",
        "label": "10% Lower Property Price",
        "input_changes": [f"Property price reduced from €{property_price:,.0f} to €{lower_price:,.0f} (10% decrease)"],
        "metrics_before": {k: base[k] for k in ["loan_amount", "monthly_payment", "dti", "ltv", "approval_probability"]},
        "metrics_after": {k: s3[k] for k in ["loan_amount", "monthly_payment", "dti", "ltv", "approval_probability"]},
        "impact_summary": impact_s3,
        "interpretation": "A lower purchase price with unchanged down payment directly reduces loan exposure. Both LTV and monthly costs improve, generally increasing lender confidence."
    })

    return scenarios
