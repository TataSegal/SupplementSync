# Supplement Sync ADK Agent Definition
from google.adk.agents import LlmAgent

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

if __name__ == "__main__":
    print("Supplement Sync ADK Agents initialized successfully.")
