# Security Policy

## Supported Versions
Metis is under active development. Security fixes are applied to the latest `main` branch and to the most recent tagged release when available.

## Reporting a Vulnerability
Please do not open public issues for security vulnerabilities.

Report privately by contacting the maintainer:
- GitHub: `@KacemMathlouthi`
- Repository: `https://github.com/KacemMathlouthi/metis`

Include:
- Vulnerability description and impact
- Reproduction steps or proof of concept
- Affected files/endpoints/components
- Suggested remediation if available

## Response Process
Targets (best effort):
- Initial acknowledgment: within 72 hours
- Triage decision: within 7 days
- Fix timeline: based on severity and exploitability

When a fix is released, maintainers will publish:
- Impact summary
- Affected versions
- Mitigation and upgrade guidance

## Security Scope Notes
Security-sensitive areas in this project include:
- Authentication and session handling
- GitHub webhook signature validation
- Token encryption and secret management
- Agent sandbox execution and tool boundaries
- Repository authorization and ownership checks

## Safe Harbor
Good-faith security research and responsible disclosure are welcomed. Please avoid:
- Accessing data that is not yours
- Disrupting service availability
- Public disclosure before a coordinated fix
