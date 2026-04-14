from typing import List, Dict, Any, Tuple
from .financial_metrics import compute_financial_metrics
from .approval_engine import predict_approval


def _recompute(
    property_price: float,
    down_payment: float,
    credit_score: int,
    monthly_income: float,
    existing_debt: float,
    total_savings: float,
    monthly_expenses: float,
    term_years: int = 30
) -> Dict[str, Any]:
    """Helper: full recompute of metrics + approval."""
    m = compute_financial_metrics(
        property_price, down_payment, credit_score, term_years,
        monthly_income, existing_debt, total_savings, monthly_expenses
    )
    a = predict_approval(m["dti"], m["ltv"], credit_score, m["savings_buffer"])
    return {**m, "approval_probability": a["approval_probability"]}


def run_sensitivity_analysis(
    property_price: float,
    down_payment: float,
    credit_score: int,
    monthly_income: float,
    existing_debt: float,
    total_savings: float,
    monthly_expenses: float,
    current_approval_prob: float,
    term_years: int = 30
) -> List[Dict[str, Any]]:
    """
    Sensitivity analysis: 3 deterministic test cases with full recomputation.
    Uses continuous scoring so deltas are real — not zero-locked by buckets.
    Case A: +10% income
    Case B: -10% property price
    Case C: +€10,000 down payment
    """
    base = _recompute(
        property_price, down_payment, credit_score,
        monthly_income, existing_debt, total_savings, monthly_expenses, term_years
    )
    base_prob = base["approval_probability"]

    results = []

    # Case A: Increase income by 10%
    a = _recompute(
        property_price, down_payment, credit_score,
        monthly_income * 1.10, existing_debt, total_savings, monthly_expenses, term_years
    )
    delta_a = round(a["approval_probability"] - base_prob, 1)
    results.append({
        "change": "Increase income by 10%",
        "before_approval": round(base_prob, 1),
        "after_approval": round(a["approval_probability"], 1),
        "delta": delta_a,
        "delta_display": f"{delta_a:+.1f}%",
        "metric_effects": [
            f"DTI reduced from {base['dti']*100:.1f}% to {a['dti']*100:.1f}%",
            f"Monthly income increased from €{monthly_income:,.0f} to €{monthly_income*1.10:,.0f}"
        ]
    })

    # Case B: Decrease property price by 10%
    new_price = property_price * 0.90
    b = _recompute(
        new_price, down_payment, credit_score,
        monthly_income, existing_debt, total_savings, monthly_expenses, term_years
    )
    delta_b = round(b["approval_probability"] - base_prob, 1)
    results.append({
        "change": "Decrease property price by 10%",
        "before_approval": round(base_prob, 1),
        "after_approval": round(b["approval_probability"], 1),
        "delta": delta_b,
        "delta_display": f"{delta_b:+.1f}%",
        "metric_effects": [
            f"Loan amount reduced from €{base['loan_amount']:,.0f} to €{b['loan_amount']:,.0f}",
            f"LTV improved from {base['ltv']*100:.1f}% to {b['ltv']*100:.1f}%",
            f"Monthly payment reduced from €{base['monthly_payment']:,.0f} to €{b['monthly_payment']:,.0f}"
        ]
    })

    # Case C: Increase down payment by €10,000
    new_down = down_payment + 10000
    c = _recompute(
        property_price, new_down, credit_score,
        monthly_income, existing_debt, total_savings, monthly_expenses, term_years
    )
    delta_c = round(c["approval_probability"] - base_prob, 1)
    results.append({
        "change": "Increase down payment by €10,000",
        "before_approval": round(base_prob, 1),
        "after_approval": round(c["approval_probability"], 1),
        "delta": delta_c,
        "delta_display": f"{delta_c:+.1f}%",
        "metric_effects": [
            f"Loan amount reduced from €{base['loan_amount']:,.0f} to €{c['loan_amount']:,.0f}",
            f"LTV improved from {base['ltv']*100:.1f}% to {c['ltv']*100:.1f}%",
            f"Monthly payment reduced from €{base['monthly_payment']:,.0f} to €{c['monthly_payment']:,.0f}"
        ]
    })

    return results


def build_sensitivity_ranking(sensitivity_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Decision Sensitivity Ranking — sorts levers by impact and explains priority.
    This is the 'killer feature': shows which action moves the needle most.
    """
    ranked = sorted(sensitivity_results, key=lambda x: abs(x["delta"]), reverse=True)

    ranking = []
    for i, item in enumerate(ranked):
        delta = item["delta"]
        abs_delta = abs(delta)

        if abs_delta >= 5:
            impact_level = "High Impact"
            impact_color = "green"
        elif abs_delta >= 2:
            impact_level = "Moderate Impact"
            impact_color = "amber"
        elif abs_delta > 0:
            impact_level = "Low Impact"
            impact_color = "gray"
        else:
            impact_level = "No Impact (at ceiling)"
            impact_color = "gray"

        ranking.append({
            "rank": i + 1,
            "action": item["change"],
            "delta": delta,
            "delta_display": item["delta_display"],
            "impact_level": impact_level,
            "impact_color": impact_color,
            "primary_driver": item["metric_effects"][0] if item["metric_effects"] else ""
        })

    return ranking
