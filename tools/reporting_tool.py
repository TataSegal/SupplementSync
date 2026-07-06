# Intake Compliance and Inventory Replenishment Analytics Tool

def reporting_tool(intake_logs: list, current_inventory: list) -> str:
    """
    Analyzes raw logs and current inventory to calculate compliance metrics and depletion dates.
    """
    total_logs = len(intake_logs)
    if total_logs == 0:
        return "No intake logs found. Please record doses to generate compliance reports."
        
    # Analyze replenishment advice
    depletion_warnings = []
    for item in current_inventory:
        name = item.get('name', 'Unknown')
        stock = item.get('stock', 0)
        daily_freq = item.get('frequency', 1)
        
        days_left = stock / daily_freq if daily_freq > 0 else 999
        if days_left <= 7:
            depletion_warnings.append(f"CRITICAL: {name} has only {int(days_left)} days of supply left ({stock} units remaining).")
            
    summary = f"Analysis Report:\n- Total Recorded Intake Events: {total_logs}\n"
    if depletion_warnings:
        summary += "\nReplenishment Warnings:\n" + "\n".join(depletion_warnings)
    else:
        summary += "\nInventory Level: Healthy (all items have > 7 days of supply)."
        
    return summary
