from typing import List

def get_optimization_suggestions(
    dti: float,
    ltv: float,
    savings_buffer: float,
    property_price: float,
    loan_amount: float
) -> List[str]:
    """
    Analyzes metrics and returns specific improvements needed to improve approval probability.
    """
    suggestions = []
    
    if dti > 0.4:
        suggestions.append("Reduce your loan amount by at least 15% to move your DTI into the sustainable range.")
        suggestions.append("Consider reducing existing debt or increasing declared income sources.")
        
    if ltv > 0.9:
        diff_for_80 = (loan_amount - (property_price * 0.8))
        if diff_for_80 > 0:
            suggestions.append(f"Increase down payment by ${round(diff_for_80, 0):,} to reach prime LTV below 80%.")
            
    if savings_buffer < 6:
        needed_savings = (6 - savings_buffer) * 1000 # dummy calc
        suggestions.append("Increase emergency liquid buffer to at least 6 months of expenses for better bank confidence.")
        
    # General positive reinforcement if scores are good
    if not suggestions:
        suggestions.append("Your financial metrics are already in the prime range for most German lenders.")
        
    return suggestions
