from typing import Dict, List


def evaluate_decision_justification(
    dti: float,
    ltv: float,
    credit_score: int,
    savings_buffer: float,
    loan_amount: float = 0,
    down_payment: float = 0,
    property_price: float = 0,
    monthly_payment: float = 0,
    monthly_income: float = 0,
    annual_interest_rate: float = 0
) -> Dict[str, List[str]]:
    """
    Deterministic decision justification.
    Always produces at least one concern — even strong profiles have minor advisory notes.
    Recommendations are specific and causal, not generic.
    """
    positives: List[str] = []
    concerns: List[str] = []
    recommendations: List[str] = []

    dti_pct = dti * 100
    ltv_pct = ltv * 100

    # ── DTI ────────────────────────────────────────────────────────────────
    if dti < 0.25:
        positives.append(
            f"Debt-to-income ratio of {dti_pct:.1f}% is well below the 30% comfort threshold, "
            "indicating strong income coverage relative to obligations."
        )
    elif dti < 0.30:
        positives.append(
            f"Debt-to-income ratio of {dti_pct:.1f}% is below the 30% comfort threshold, "
            "indicating healthy income-to-debt balance."
        )
    elif dti <= 0.40:
        positives.append(
            f"Debt obligations at {dti_pct:.1f}% DTI remain within acceptable range "
            "but reduce future affordability headroom."
        )
    elif dti <= 0.45:
        concerns.append(
            f"Debt-to-income ratio of {dti_pct:.1f}% is elevated and approaching the 45% hard lender limit."
        )
    else:
        concerns.append(
            f"Debt-to-income ratio of {dti_pct:.1f}% exceeds the 45% threshold used by most lenders."
        )

    # ── LTV ────────────────────────────────────────────────────────────────
    if ltv < 0.70:
        positives.append(
            f"Loan-to-value of {ltv_pct:.1f}% reflects strong equity position, "
            "qualifying for preferred rate tiers and minimal lender exposure."
        )
    elif ltv <= 0.80:
        positives.append(
            f"Loan-to-value ratio of {ltv_pct:.1f}% supports lender confidence through lower leverage and adequate equity."
        )
    elif ltv <= 0.90:
        positives.append(
            f"Loan-to-value of {ltv_pct:.1f}% is within acceptable range, "
            "though it may attract marginally higher pricing."
        )
        concerns.append(
            f"LTV above 80% increases lender sensitivity to property value fluctuations."
        )
    elif ltv <= 0.95:
        concerns.append(
            f"Loan-to-value of {ltv_pct:.1f}% is elevated and may require stricter pricing or additional documentation."
        )
    else:
        concerns.append(
            f"High leverage at {ltv_pct:.1f}% LTV significantly increases lender exposure "
            "and may require mortgage insurance."
        )

    # ── Credit Score ────────────────────────────────────────────────────────
    if credit_score >= 800:
        positives.append(
            f"Credit score of {credit_score} is exceptional, "
            "placing the applicant in the top risk tier for preferential pricing."
        )
    elif credit_score >= 750:
        positives.append(
            f"Credit score of {credit_score} supports low-risk repayment behavior "
            "and qualifies for preferred rate tiers."
        )
        # Always note room for improvement at this level
        concerns.append(
            f"Credit score of {credit_score} qualifies for preferred rates but is not yet at the ≥800 tier "
            "where the absolute best pricing becomes available."
        )
    elif credit_score >= 700:
        positives.append(
            f"Credit score of {credit_score} meets standard eligibility criteria for most mortgage products."
        )
        concerns.append(
            f"Credit score of {credit_score} is good but not top-tier; some lenders may apply a rate premium."
        )
    elif credit_score >= 650:
        concerns.append(
            f"Credit score of {credit_score} is fair and may result in higher pricing or additional collateral requirements."
        )
    else:
        concerns.append(
            f"Credit score of {credit_score} falls below the preferred minimum of 650 for standard lending products."
        )

    # ── Savings Buffer ──────────────────────────────────────────────────────
    if savings_buffer >= 18:
        positives.append(
            f"Savings buffer of {savings_buffer:.1f} months provides exceptional post-closing resilience "
            "and materially reduces default risk."
        )
    elif savings_buffer >= 12:
        positives.append(
            f"Savings buffer of {savings_buffer:.1f} months materially reduces short-term repayment stress risk."
        )
    elif savings_buffer >= 6:
        positives.append(
            f"Savings buffer of {savings_buffer:.1f} months provides adequate post-closing liquidity cushion."
        )
        concerns.append(
            f"Savings buffer below 12 months means limited resilience if income is interrupted for extended periods."
        )
    elif savings_buffer >= 3:
        concerns.append(
            f"Savings buffer of {savings_buffer:.1f} months is below the recommended 6-month standard."
        )
    else:
        concerns.append(
            f"Savings buffer of {savings_buffer:.1f} months is critically low "
            "and may trigger lender concern about ability to weather short-term income disruption."
        )

    # ── Always add at least one concern for strong profiles ─────────────────
    if len(concerns) == 0:
        concerns.append(
            f"Loan size of €{loan_amount:,.0f} at {annual_interest_rate:.1f}% interest "
            "remains sensitive to rate increases; a 1% rate rise would add "
            f"approximately €{loan_amount * 0.01 / 12:,.0f}/month to repayments."
            if loan_amount > 0 else
            "All key metrics are within preferred thresholds, though rate sensitivity should be monitored."
        )

    # ── Causal Recommendations ──────────────────────────────────────────────
    if ltv_pct > 70 and property_price > 0 and down_payment > 0:
        target_dp = property_price * 0.30
        if target_dp > down_payment:
            recommendations.append(
                f"Increasing down payment from €{down_payment:,.0f} to €{target_dp:,.0f} "
                f"would reduce LTV from {ltv_pct:.1f}% to 70%, "
                "improving pricing eligibility to the preferred rate bracket."
            )
        else:
            additional_dp = property_price * 0.20 - down_payment
            if additional_dp > 0:
                recommendations.append(
                    f"Adding €{additional_dp:,.0f} to the down payment would bring "
                    f"LTV below {(1 - 0.20)*100:.0f}%, reducing lender exposure significantly."
                )

    if dti_pct > 25 and monthly_income > 0:
        income_for_dti25 = (monthly_payment * 4) if monthly_payment > 0 else monthly_income
        if income_for_dti25 > monthly_income:
            recommendations.append(
                f"Reducing discretionary debt by €{(dti - 0.25) * monthly_income:,.0f}/month "
                f"would bring DTI from {dti_pct:.1f}% to 25%, the optimal lender threshold."
            )

    if savings_buffer < 12:
        months_needed = 12 - savings_buffer
        # Rough savings target
        recommendations.append(
            f"Building savings by an estimated {months_needed:.0f} additional months of expenses "
            "would reach the 12-month buffer standard, significantly improving lender confidence."
        )

    if credit_score < 800:
        recommendations.append(
            f"Improving credit score from {credit_score} toward 800+ would unlock the "
            f"best pricing tier, potentially reducing the interest rate by 0.2–0.4%."
        )

    if not recommendations:
        recommendations.append(
            "Maintain current financial profile — all key metrics are within or exceeding preferred thresholds."
        )

    return {
        "positives": positives,
        "concerns": concerns,
        "recommendations": recommendations
    }
