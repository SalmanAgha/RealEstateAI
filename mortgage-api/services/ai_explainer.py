import os
import json
from typing import Dict, Any, List

try:
    from openai import OpenAI
    _openai_available = True
except ImportError:
    _openai_available = False


SYSTEM_PROMPT = """You are a professional mortgage advisor operating in Germany.
You must provide conservative, precise, and explainable financial guidance.

Rules:
- Use ONLY the supplied metrics and classifications — do not invent numbers.
- Do not change the approval probability.
- Do not give generic motivational advice.
- Reference DTI, LTV, savings buffer, and approval status explicitly with their actual values.
- Keep language professional and decision-oriented.
- Every sentence must reference a specific number or threshold.

You MUST return a valid JSON object with exactly these fields:
{
  "summary": "<one paragraph case summary referencing loan amount, DTI, LTV, savings buffer>",
  "risk_analysis": "<one paragraph analyzing DTI, LTV, credit, and savings risk levels>",
  "approval_reasoning": "<one paragraph explaining why the decision is what it is, referencing scores>",
  "recommendations": ["<specific action 1>", "<specific action 2>", "<specific action 3>"]
}

Do not wrap in markdown. Return raw JSON only."""


class AIExplainer:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if _openai_available and self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def generate_explanation(
        self,
        user_data: Dict[str, Any],
        results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generates structured AI explanation using only computed metrics.
        Falls back to deterministic output if no API key.
        """
        if not self.client:
            return self._fallback_explanation(user_data, results)

        finance = results.get("finance", {})
        approval = results.get("approval", {})
        decision_just = results.get("decision_justification", {})

        payload = {
            "loan_amount": finance.get("loan_amount"),
            "monthly_payment": finance.get("monthly_payment"),
            "annual_interest_rate": finance.get("annual_interest_rate"),
            "dti": finance.get("dti"),
            "ltv": finance.get("ltv"),
            "savings_buffer_months": finance.get("savings_buffer"),
            "credit_score": user_data.get("credit_score"),
            "approval_probability": approval.get("approval_probability"),
            "decision": approval.get("decision"),
            "confidence": approval.get("confidence"),
            "positives": decision_just.get("positives", []),
            "concerns": decision_just.get("concerns", [])
        }

        user_prompt = (
            f"Analyze this mortgage application and provide a professional structured evaluation:\n"
            f"{json.dumps(payload, indent=2)}\n\n"
            f"Return a JSON object with fields: summary, risk_analysis, approval_reasoning, recommendations."
        )

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.15
            )
            parsed = json.loads(response.choices[0].message.content)
            # Validate fields
            return self._validate_output(parsed, user_data, results)
        except Exception:
            return self._fallback_explanation(user_data, results)

    def _validate_output(
        self,
        parsed: Dict[str, Any],
        user_data: Dict[str, Any],
        results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Ensure all required fields are strings, not nested objects."""
        finance = results.get("finance", {})
        approval = results.get("approval", {})

        def safe_str(val: Any) -> str:
            if isinstance(val, str):
                return val
            elif isinstance(val, dict):
                return " ".join(str(v) for v in val.values())
            return str(val)

        recs = parsed.get("recommendations", [])
        if not isinstance(recs, list):
            recs = [str(recs)]

        return {
            "summary": safe_str(parsed.get("summary", "")),
            "risk_analysis": safe_str(parsed.get("risk_analysis", "")),
            "approval_reasoning": safe_str(parsed.get("approval_reasoning", "")),
            "recommendations": [str(r) for r in recs]
        }

    def _fallback_explanation(
        self,
        user_data: Dict[str, Any],
        results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Deterministic professional fallback — references actual numbers.
        Used when OpenAI API is unavailable.
        """
        finance = results.get("finance", {})
        approval = results.get("approval", {})

        dti_pct = (finance.get("dti", 0)) * 100
        ltv_pct = (finance.get("ltv", 0)) * 100
        sb = finance.get("savings_buffer", 0)
        loan = finance.get("loan_amount", 0)
        payment = finance.get("monthly_payment", 0)
        rate = finance.get("annual_interest_rate", 0)
        prob = approval.get("approval_probability", 0)
        decision = approval.get("decision", "borderline")
        confidence = approval.get("confidence", "medium")
        credit = user_data.get("credit_score", 0)

        dti_verdict = "comfortably below" if dti_pct < 30 else ("within" if dti_pct <= 40 else "above")
        ltv_verdict = "within the preferred range" if ltv_pct <= 80 else ("acceptable" if ltv_pct <= 90 else "elevated")
        sb_verdict = "strong" if sb >= 12 else ("adequate" if sb >= 6 else "limited")

        recs: List[str] = []
        if dti_pct > 40:
            recs.append(f"Reduce monthly debt obligations to bring DTI below 40% (currently {dti_pct:.1f}%).")
        if ltv_pct > 80:
            recs.append(f"Consider increasing the down payment to reduce LTV below 80% (currently {ltv_pct:.1f}%).")
        if sb < 6:
            recs.append(f"Build savings to at least 6 months of expenses before application (currently {sb:.1f} months).")
        if not recs:
            recs.append("Maintain current financial profile; metrics are within preferred lender thresholds.")

        return {
            "summary": (
                f"This mortgage application covers a loan of €{loan:,.0f} at {rate:.1f}% annual interest, "
                f"resulting in a monthly payment of €{payment:,.0f}. "
                f"The debt-to-income ratio of {dti_pct:.1f}% is {dti_verdict} the 40% comfort threshold, "
                f"and the loan-to-value of {ltv_pct:.1f}% is {ltv_verdict} for standard lending. "
                f"Combined with a savings buffer of {sb:.1f} months, the application presents a {decision} profile."
            ),
            "risk_analysis": (
                f"DTI of {dti_pct:.1f}% and LTV of {ltv_pct:.1f}% are the primary risk drivers. "
                f"A credit score of {credit} determines the {rate:.1f}% interest rate. "
                f"The {sb:.1f}-month savings buffer is {sb_verdict}, "
                f"{'providing meaningful default resilience.' if sb >= 6 else 'and may be flagged in a full underwriting review.'}"
            ),
            "approval_reasoning": (
                f"The weighted scoring model yields a {prob:.0f}% approval probability, classified as {decision.upper()} "
                f"with {confidence} confidence. "
                f"DTI contributes 40% of the score, LTV 30%, credit 20%, and savings 10%. "
                f"{'No hard constraints are triggered.' if dti_pct <= 45 and ltv_pct <= 95 and sb >= 3 and credit >= 600 else 'One or more hard constraints are close to or in violation — see Hard Constraints Check.'}"
            ),
            "recommendations": recs
        }
