import os
import chromadb
from openai import OpenAI
from typing import Dict, Any, List

class RAGService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        
        # In-memory Persistent Client
        self.chroma_client = chromadb.Client()
        self.collection = self.chroma_client.get_or_create_collection(name="mortgage_regulations")
        
        self._initialize_dummy_docs()

    def _initialize_dummy_docs(self):
        """
        Embeds sample documents into vector store.
        """
        docs = [
            "German Mortgage Rule: Debt-to-Income (DTI) should ideally not exceed 40% for sustainable lending. Most German banks enforce this strictly.",
            "LTV Guidelines: 80% LTV is standard for favorable interest rates. LTV > 100% is extremely difficult to finance in Germany without collateral.",
            "Savings buffer: Lending guidelines suggest having at least 3-6 months of essential living expenses saved as an emergency fund.",
            "Credit Score: Credit scores above 600 are usually required for competitive interest rates. Low scores leading to higher risk premiums.",
            "Self-employed Rules: Self-employed borrowers must typically provide at least 3 years of audited financial statements in Germany."
        ]
        
        # Add to chroma (simplified, uses chroma's default embedding for now)
        self.collection.add(
            documents=docs,
            ids=[f"id{i}" for i in range(len(docs))]
        )

    def ask(self, query: str, context_details: Dict[str, Any] = None) -> str:
        """
        Retrieves context from vector store and asks LLM.
        """
        # Retrieve context
        results = self.collection.query(
            query_texts=[query],
            n_results=2
        )
        context = " ".join(results['documents'][0])
        
        if not self.client:
            return f"RAG results suggest: {context}"
        
        system_prompt = (
            "You are a professional mortgage advisor in Germany. You MUST answer use-specific questions "
            "by integrating their own financial data into the explanation. Never give generic textbook answers. "
            "Example: Instead of saying 'You should keep 3-6 months savings', say 'Given your expenses of €2,500, "
            "you should maintain €7,500–€15,000. Your current buffer of 20 months exceeds this.' "
            "Reference DTI, LTV, and savings buffer from the user's context whenever relevant."
        )
        
        user_prompt = f"REGULATION CONTEXT: {context}\n\nUSER QUESTION: {query}"
        if context_details:
             user_prompt += f"\n\nUSER DATA CONTEXT: {str(context_details)}"

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error executing RAG Q&A: {str(e)}"
