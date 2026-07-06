# Skill: Orchestrator

Orchestrates user inputs and routes tasks to the appropriate specialist agents.

## Instructions
- Evaluate if the user is uploading an image/media or requesting text analysis.
- Identify requests for safety checks, warnings, and compatibility evaluations.
- Route to `label_extractor_agent` for image data extraction.
- Route to `safety_auditor_agent` for pharmacological compatibility audits.
