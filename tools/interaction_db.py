# Supplement Interaction Database Tool
import json

# Local database of supplement interactions and warnings
INTERACTION_DATABASE = {
    "Iron": {
        "Calcium": "Calcium inhibits iron absorption. Separate intake by at least 2 hours.",
        "Zinc": "High doses of zinc can interfere with iron absorption."
    },
    "Zinc": {
        "Copper": "High zinc intake can cause copper deficiency. Maintain balanced ratio."
    },
    "Vitamin D3": {
        "Calcium": "Vitamin D3 enhances calcium absorption. Great synergistic combo!"
    }
}

def interaction_db_tool(supplement_name: str, compare_against_list: list) -> str:
    """
    Checks a supplement name against a list of other supplements for known interactions.
    """
    warnings = []
    # Clean up name for lookup
    name_key = next((k for k in INTERACTION_DATABASE if k.lower() in supplement_name.lower()), None)
    
    if name_key:
        for other in compare_against_list:
            other_key = next((k for k in INTERACTION_DATABASE[name_key] if k.lower() in other.lower()), None)
            if other_key:
                warnings.append(f"[{supplement_name} + {other}]: {INTERACTION_DATABASE[name_key][other_key]}")
                
    if not warnings:
        return "No major interactions found in database."
        
    return "\n".join(warnings)
