from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from database import get_db, init_db, User, MortgageAnalysis
from services import (
    compute_financial_metrics,
    evaluate_risk,
    predict_approval,
    evaluate_hard_constraints,
    generate_scenarios,
    get_optimization_suggestions,
    AIExplainer,
    RAGService,
    evaluate_decision_justification,
    run_sensitivity_analysis,
    build_sensitivity_ranking
)

from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Mortgage Advisor Copilot Pro API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------
# Canonical applicant input schema (Phase 1)
# -----------------------------------------------------------------------
class ApplicantInput(BaseModel):
    applicant_id: str
    monthly_income: float
    monthly_expenses: float
    total_savings: float
    credit_score: int
    existing_debt: float
    property_price: float
    down_payment: float
    employment_type: str = "full-time"
    property_location: str = "Berlin"
    term_years: int = 30

# Service Init
explainer = AIExplainer()
rag_service = RAGService()

@app.on_event("startup")
def startup():
    init_db()

# In-memory cache for last analysis context (RAG)
last_analysis_context: Dict[str, Any] = {}


@app.post("/analyze")
def analyze_mortgage(data: ApplicantInput, db: Session = Depends(get_db)):
    """
    Full underwriting pipeline — Phase 1 through 7.
    Returns canonical MortgageAnalysisResponse structure.
    """
    # --- Phase 2: Financial Engine ---
    try:
        finance = compute_financial_metrics(
            property_price=data.property_price,
            down_payment=data.down_payment,
            credit_score=data.credit_score,
            term_years=data.term_years,
            monthly_income=data.monthly_income,
            existing_debt=data.existing_debt,
            total_savings=data.total_savings,
            monthly_expenses=data.monthly_expenses
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # --- Phase 3: Risk Engine + Approval Engine ---
    risk = evaluate_risk(
        dti=finance["dti"],
        ltv=finance["ltv"],
        savings_buffer=finance["savings_buffer"],
        credit_score=data.credit_score
    )

    approval = predict_approval(
        dti=finance["dti"],
        ltv=finance["ltv"],
        credit_score=data.credit_score,
        savings_buffer=finance["savings_buffer"]
    )

    # --- Phase 3: Hard Constraints ---
    hard_constraints = evaluate_hard_constraints(
        dti=finance["dti"],
        ltv=finance["ltv"],
        savings_buffer=finance["savings_buffer"],
        credit_score=data.credit_score
    )

    # --- Phase 4: Decision Justification (with loan context for causal recommendations) ---
    decision_justification = evaluate_decision_justification(
        dti=finance["dti"],
        ltv=finance["ltv"],
        credit_score=data.credit_score,
        savings_buffer=finance["savings_buffer"],
        loan_amount=finance["loan_amount"],
        down_payment=data.down_payment,
        property_price=data.property_price,
        monthly_payment=finance["monthly_payment"],
        monthly_income=data.monthly_income,
        annual_interest_rate=finance["annual_interest_rate"]
    )

    # --- Phase 5: Scenarios ---
    scenarios = generate_scenarios(
        property_price=data.property_price,
        down_payment=data.down_payment,
        credit_score=data.credit_score,
        monthly_income=data.monthly_income,
        existing_debt=data.existing_debt,
        total_savings=data.total_savings,
        monthly_expenses=data.monthly_expenses,
        term_years=data.term_years
    )

    # --- Phase 6: Sensitivity Analysis ---
    sensitivity = run_sensitivity_analysis(
        property_price=data.property_price,
        down_payment=data.down_payment,
        credit_score=data.credit_score,
        monthly_income=data.monthly_income,
        existing_debt=data.existing_debt,
        total_savings=data.total_savings,
        monthly_expenses=data.monthly_expenses,
        current_approval_prob=approval["approval_probability"],
        term_years=data.term_years
    )

    # --- Decision Sensitivity Ranking (Patch04 killer feature) ---
    sensitivity_ranking = build_sensitivity_ranking(sensitivity)

    # --- Optimization ---
    optimization = get_optimization_suggestions(
        finance["dti"], finance["ltv"], finance["savings_buffer"],
        data.property_price, finance["loan_amount"]
    )

    # Build unified context
    results_context = {
        "finance": finance,
        "risk": risk,
        "approval": approval,
        "hard_constraints": hard_constraints,
        "decision_justification": decision_justification,
        "scenarios": scenarios,
        "sensitivity": sensitivity,
        "optimization": optimization
    }

    # Cache for RAG
    last_analysis_context[data.applicant_id] = results_context

    # --- Phase 7: AI Explanation ---
    ai_explanation = explainer.generate_explanation(data.dict(), results_context)

    # --- Persist to DB ---
    db_user = db.query(User).filter(User.user_id_ext == data.applicant_id).first()
    if not db_user:
        db_user = User(
            user_id_ext=data.applicant_id,
            monthly_income=data.monthly_income,
            monthly_expenses=data.monthly_expenses,
            savings=data.total_savings,
            employment_type=data.employment_type,
            credit_score=data.credit_score,
            existing_debt=data.existing_debt
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    analysis_entry = MortgageAnalysis(
        user_id=db_user.id,
        loan_amount=finance["loan_amount"],
        monthly_payment=finance["monthly_payment"],
        dti=finance["dti"],
        ltv=finance["ltv"],
        affordability=approval["decision"],
        risk_score=int(approval["approval_probability"]),
        explanation=str(ai_explanation)
    )
    db.add(analysis_entry)
    db.commit()

    # --- Canonical MortgageAnalysisResponse ---
    return {
        "applicant": {
            "applicant_id": data.applicant_id,
            "monthly_income": data.monthly_income,
            "monthly_expenses": data.monthly_expenses,
            "total_savings": data.total_savings,
            "credit_score": data.credit_score,
            "existing_debt": data.existing_debt,
            "property_price": data.property_price,
            "down_payment": data.down_payment,
            "employment_type": data.employment_type,
            "property_location": data.property_location,
            "term_years": data.term_years
        },
        "metrics": finance,
        "risk_assessment": risk,
        "approval": approval,
        "hard_constraints": hard_constraints,
        "decision_justification": decision_justification,
        "scenarios": scenarios,
        "sensitivity_analysis": sensitivity,
        "sensitivity_ranking": sensitivity_ranking,
        "optimization_actions": optimization,
        "ai_explanation": ai_explanation
    }


@app.post("/report")
def generate_report(data: ApplicantInput, db: Session = Depends(get_db)):
    """
    Generates a plain-text underwriting report suitable for download.
    """
    result = analyze_mortgage(data, db)
    m = result["metrics"]
    ap = result["approval"]
    dj = result["decision_justification"]
    hc = result["hard_constraints"]
    ai = result["ai_explanation"]
    sr = result["sensitivity_ranking"]

    lines = [
        "=" * 60,
        "MORTGAGE UNDERWRITING REPORT",
        f"Applicant ID : {data.applicant_id}",
        f"Location     : {data.property_location}",
        f"Employment   : {data.employment_type.title()}",
        "=" * 60,
        "",
        "── FINANCIAL SUMMARY ──",
        f"  Loan Amount      : €{m['loan_amount']:,.2f}",
        f"  Monthly Payment  : €{m['monthly_payment']:,.2f}",
        f"  Interest Rate    : {m['annual_interest_rate']}%",
        f"  DTI Ratio        : {m['dti']*100:.1f}%",
        f"  LTV Ratio        : {m['ltv']*100:.1f}%",
        f"  Savings Buffer   : {m['savings_buffer']:.1f} months",
        "",
        "── APPROVAL ANALYSIS ──",
        f"  Probability  : {ap['approval_probability']}%",
        f"  Decision     : {ap['decision'].upper()}",
        f"  Confidence   : {ap['confidence'].upper()}",
        "",
        "── LENDER POSITIVES ──",
    ]
    for p in dj.get("positives", []):
        lines.append(f"  ✔ {p}")
    lines.append("")
    lines.append("── LENDER CONCERNS ──")
    for c in dj.get("concerns", []):
        lines.append(f"  ⚠ {c}")
    lines.append("")
    lines.append("── HARD CONSTRAINTS ──")
    for con in hc.get("constraints", []):
        status_sym = "✔" if con["status"] == "pass" else "✘"
        lines.append(f"  {status_sym} {con['name']}: {con['display_value']}")
    lines.append(f"  Overall: {hc['overall_status'].upper()}")
    lines.append("")
    lines.append("── DECISION SENSITIVITY RANKING ──")
    for r in sr:
        lines.append(f"  #{r['rank']} {r['action']}: {r['delta_display']} ({r['impact_level']})")
        lines.append(f"       {r['primary_driver']}")
    lines.append("")
    lines.append("── RECOMMENDATIONS ──")
    for i, rec in enumerate(dj.get("recommendations", []), 1):
        lines.append(f"  {i}. {rec}")
    lines.append("")
    lines.append("── ADVISOR EVALUATION ──")
    lines.append(f"Summary: {ai.get('summary', '')}")
    lines.append("")
    lines.append(f"Risk Analysis: {ai.get('risk_analysis', '')}")
    lines.append("")
    lines.append(f"Approval Reasoning: {ai.get('approval_reasoning', '')}")
    lines.append("")
    lines.append("=" * 60)
    lines.append("Generated by Mortgage Underwriting Assistant")
    lines.append("=" * 60)

    report_text = "\n".join(lines)
    return PlainTextResponse(
        content=report_text,
        headers={"Content-Disposition": "attachment; filename=underwriting_report.txt"}
    )


# Legacy /analyze endpoint alias for backward compatibility (maps old field names)
class LegacyUserInput(BaseModel):
    user_id: str
    monthly_income: float
    monthly_expenses: float
    savings: float
    employment_type: str
    credit_score: int
    existing_debt: float
    property_price: float
    location: str
    down_payment: float

@app.post("/analyze/legacy")
def analyze_mortgage_legacy(data: LegacyUserInput, db: Session = Depends(get_db)):
    canonical = ApplicantInput(
        applicant_id=data.user_id,
        monthly_income=data.monthly_income,
        monthly_expenses=data.monthly_expenses,
        total_savings=data.savings,
        credit_score=data.credit_score,
        existing_debt=data.existing_debt,
        property_price=data.property_price,
        down_payment=data.down_payment,
        employment_type=data.employment_type,
        property_location=data.location
    )
    return analyze_mortgage(canonical, db)


class ContextualRAGQuery(BaseModel):
    query: str
    user_id: Optional[str] = None

@app.post("/ask")
def query_rag(req: ContextualRAGQuery):
    """Query knowledge base for regulation context."""
    context = None
    if req.user_id and req.user_id in last_analysis_context:
        context = last_analysis_context[req.user_id]
    return {"answer": rag_service.ask(req.query, context_details=context)}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
