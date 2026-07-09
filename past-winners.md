# Winning Shapes - Past Slack Hackathon Projects

Based on past Slack and general AI agent hackathon winners, successful builds focus on three distinct patterns (winning shapes):

### 🛠️ Shape 1: Human-in-the-Loop Orchestration
* **Pattern**: The agent handles complex operations (e.g. prescription checks, database querying) but pauses for user approval before modifying state.
* **UI**: Uses Slack **Block Kit** buttons (`Approve` / `Deny` / `Request Changes`) to make human feedback natural.
* **Why it wins**: Demonstrates enterprise-readiness and addresses the trust/safety aspect of AI.

### 🔌 Shape 2: Model Context Protocol (MCP) Connectivity
* **Pattern**: Instead of hardcoding API integrations, the agent uses an **MCP Server** to query local or third-party resources (databases, calendars, files) dynamically.
* **Why it wins**: Directly aligns with Slack's target developer track and shows complex reasoning over varied data sources.

### 🌐 Shape 3: High-Impact Accessibility & Healthcare (Slack for Good)
* **Pattern**: Employs real-time AI to solve a specific healthcare accessibility problem for individuals who might not have access to standard applications, exposing functions via simple chat.
* **Why it wins**: Scores high on "Impact" and ticks the specific social good track criteria.
