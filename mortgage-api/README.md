# Mortgage Advisor Copilot

Production-grade decision engine for mortgage affordability and advisory.

## Features
- **Intake Engine**: Validates complex financial user profiles.
- **Mortgage Simulator**: Generates three varied mortgage scenarios (Conservative, Balanced, Aggressive).
- **Risk Engine**: Multi-metric evaluation (DTI, LTV, Savings Buffer).
- **AI Explanation Layer**: Personalized insights using GPT-4o.
- **RAG Module**: ChromaDB powered regulatory knowledge base.
- **Frontend Dashboard**: Premium UI for real-time analysis.

## Setup & Running

### Backend (Python FastAPI)
1. Navigate to `mortgage-api/`
2. Install dependencies: `pip install -r requirements.txt`
3. Optional: Seed dummy data: `python seed_data.py`
4. Run server: `python main.py`

### Frontend (Next.js)
1. Ensure the main frontend is running.
2. The Mortgage Advisor is accessible at `/mortgage`.

## API Spec
- `POST /analyze`: Run full pipeline (Simulate -> Risk -> AI Explanation -> Save).
- `POST /simulate`: Get options only.
- `POST /ask`: Q&A against regulatory RAG docs.
