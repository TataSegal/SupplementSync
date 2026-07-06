# Supplement Sync ADK Multi-Agent System Graph
import os
import yaml
from google.adk.agents import LlmAgent
from tools.ocr_tool import ocr_tool
from tools.interaction_db import interaction_db_tool
from tools.reporting_tool import reporting_tool

# 1. Load Configurations
def load_config():
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'agent.yaml')
    prompts_path = os.path.join(os.path.dirname(__file__), 'config', 'prompts.yaml')
    
    with open(config_path, 'r', encoding='utf-8') as f:
        agent_config = yaml.safe_load(f)
    with open(prompts_path, 'r', encoding='utf-8') as f:
        prompts = yaml.safe_load(f)
        
    return agent_config, prompts

# 2. Instantiate and Wire Agents with Skills and Tools
def initialize_system():
    agent_config, prompts = load_config()
    
    # Label Extractor Agent ( OCR + Text parser )
    label_extractor = LlmAgent(
        name="label_extractor_agent",
        model="gemini-2.5-flash",
        description="Extracts names and dosages from supplement label photos.",
        instruction=prompts['prompts']['label_extractor']['system_instruction'],
        tools=[ocr_tool]
    )
    
    # Safety Auditor Agent ( Interaction lookup + Schedule optimization )
    safety_auditor = LlmAgent(
        name="safety_auditor_agent",
        model="gemini-2.5-flash",
        description="Audits supplement lists for drug and nutrient interactions.",
        instruction=prompts['prompts']['safety_auditor']['system_instruction'],
        tools=[interaction_db_tool]
    )
    
    # Inventory Analyst Agent ( Compliance reporter + Stock replenishment predictor )
    inventory_analyst = LlmAgent(
        name="inventory_analyst_agent",
        model="gemini-2.5-flash",
        description="Calculates intake compliance and warns when stock drops below a 7-day reserve.",
        instruction=prompts['prompts']['inventory_analyst']['system_instruction'],
        tools=[reporting_tool]
    )
    
    # Orchestrator / Supervisor Agent ( Orchestrates specialist agent tools )
    orchestrator = LlmAgent(
        name="supplement_sync_orchestrator",
        model="gemini-2.5-flash",
        description="Supervisor agent delegating tasks to expert agents.",
        instruction=prompts['prompts']['orchestrator']['system_instruction'],
        sub_agents=[label_extractor, safety_auditor, inventory_analyst]
    )
    
    return orchestrator

if __name__ == "__main__":
    system = initialize_system()
    print(f"Google ADK 2.0 Multi-Agent System '{system.name}' started successfully!")
    print("Multi-Agent Graph: Orchestrator -> [Label Extractor, Safety Auditor, Inventory Analyst]")
