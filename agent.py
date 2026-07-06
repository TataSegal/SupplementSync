# Supplement Sync ADK Agent Definition
from google.adk.agents import LlmAgent, OrchestratorAgent

# 1. Label Extractor Agent
label_extractor = LlmAgent(
    name="label_extractor_agent",
    model="gemini-2.5-flash",
    description="Extracts name, dosage, and notes from supplement label images.",
    instruction="Extract supplement details (name, dosage, intake notes) from label images. Return as clean JSON."
)

# 2. Safety Auditor Agent
safety_auditor = LlmAgent(
    name="safety_auditor_agent",
    model="gemini-2.5-flash",
    description="Audits supplement lists for interactions and dosage overlaps.",
    instruction="Analyze the provided list of supplements for dosage overlaps and negative interactions."
)

# 3. Inventory Analyst Agent
inventory_analyst = LlmAgent(
    name="inventory_analyst_agent",
    model="gemini-2.5-flash",
    description="Analyzes supplement intake logs, calculates compliance, and predicts stock replenishment needs.",
    instruction="Analyze supplement intake logs and inventory levels to generate compliance reports and replenishment alerts."
)

# 4. Orchestration / Supervisor Agent
orchestrator = OrchestratorAgent(
    name="orchestrator_agent",
    model="gemini-2.5-flash",
    description="Main supervisor routing user requests to label_extractor, safety_auditor, or inventory_analyst.",
    instruction="Analyze user intent and route image analysis tasks to label_extractor_agent, safety/compatibility requests to safety_auditor_agent, and log reports/inventory audits to inventory_analyst_agent.",
    agents=[label_extractor, safety_auditor, inventory_analyst]
)

if __name__ == "__main__":
    print("Supplement Sync ADK Orchestrator and Agents initialized successfully.")
