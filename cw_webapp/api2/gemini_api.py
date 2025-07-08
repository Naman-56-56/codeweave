import os
import json
import google.generativeai as genai
from django.conf import settings
import logging
import uuid
from datetime import datetime
import re
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class GeminiRoadmapGenerator:
    """Handles roadmap generation using Gemini API with FRESH DATA EVERY TIME"""
    
    def __init__(self):
        # Hardcoded Gemini API key for immediate use (TEMPORARY)
        load_dotenv()
        api_key = os.getenv('NON_TECH_KEY')
        genai.configure(api_key=api_key)
        # Use the correct model name for the current API version
        self.model = genai.GenerativeModel('models/gemini-2.5-flash-preview-05-20')
    
    def generate_roadmap(self, goal):
        """Generate a personalized roadmap for the given goal - FRESH DATA EVERY TIME"""
        
        # Create a unique request ID to ensure fresh generation
        request_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Create a unique, dynamic prompt for each request
        prompt = f"""You are an expert roadmap generator specializing in creating detailed, field-specific roadmaps. Based on the user's goal: "{goal}", analyze the goal type and create a comprehensive roadmap with field-specific data.

REQUEST ID: {request_id}
TIMESTAMP: {timestamp}

IMPORTANT: Generate FRESH, UNIQUE content every time. Do not use generic templates or repetitive content. Make each roadmap highly personalized and specific to the user's exact goal.

First, identify the goal category:
- Business/Entrepreneurship
- Creative Arts (Music, Writing, Art, etc.)
- Fitness/Health
- Education/Learning
- Technology/Skills
- Personal Development
- Career/Professional
- Lifestyle/Hobbies

Then create a detailed roadmap with this structure:

{{
    "title": "Comprehensive [Field-Specific] Roadmap for [Goal]",
    "description": "Detailed overview with field-specific context",
    "goal_category": "[Identified Category]",
    "request_id": "{request_id}",
    "generated_at": "{timestamp}",
    "field_specific_data": {{
        "industry_insights": "Field-specific insights and trends",
        "market_analysis": "Relevant market data if applicable",
        "skill_requirements": "Specific skills needed for this field",
        "certification_paths": "Relevant certifications if applicable",
        "networking_opportunities": "Field-specific networking strategies"
    }},
    "phases": [
        {{
            "title": "Major Phase Title",
            "description": "Detailed field-specific description",
            "estimated_duration": "Realistic timeline",
            "field_relevance": "Why this phase is crucial in this field",
            "sub_phases": [
                {{
                    "title": "Minor Phase/Sub-Phase Title",
                    "description": "Field-specific sub-phase description",
                    "estimated_duration": "Detailed timeline",
                    "field_context": "How this applies to the specific field",
                    "steps": [
                        {{
                            "title": "Specific Step Title",
                            "description": "Detailed, field-specific instructions",
                            "estimated_time": "Realistic time estimate",
                            "difficulty": "Beginner/Intermediate/Advanced",
                            "field_specific_guidance": "How this step applies to the specific field",
                            "resources": [
                                {{
                                    "name": "Field-Specific Resource Name",
                                    "type": "Book/Website/Course/Tool/Person/Platform",
                                    "description": "Why this resource is valuable for this field",
                                    "url": "Direct link if applicable",
                                    "field_relevance": "How it relates to the specific field"
                                }}
                            ],
                            "milestones": [
                                "Field-specific milestone 1",
                                "Field-specific milestone 2"
                            ],
                            "motivation": "Why this step is crucial for success in this field",
                            "potential_challenges": [
                                "Field-specific challenge 1",
                                "Field-specific challenge 2"
                            ],
                            "tips": [
                                "Field-specific pro tip 1",
                                "Field-specific pro tip 2"
                            ],
                            "success_indicators": [
                                "How to measure progress in this field",
                                "Field-specific success metrics"
                            ]
                        }}
                    ]
                }}
            ]
        }}
    ],
    "field_specific_considerations": {{
        "industry_trends": "Current trends in the field",
        "competitive_landscape": "Competition analysis if applicable",
        "regulatory_requirements": "Legal/regulatory considerations",
        "technology_impact": "How technology affects this field",
        "future_outlook": "Future prospects in the field"
    }},
    "prerequisites": [
        "Field-specific required skills/knowledge 1",
        "Field-specific required skills/knowledge 2"
    ],
    "success_metrics": [
        "Field-specific success metric 1",
        "Field-specific success metric 2"
    ],
    "timeline_overview": "Detailed timeline with field-specific milestones",
    "budget_considerations": "Field-specific financial planning with realistic costs",
    "risk_factors": [
        "Field-specific risk 1",
        "Field-specific risk 2"
    ],
    "alternative_paths": [
        "Field-specific alternative approach 1",
        "Field-specific alternative approach 2"
    ],
    "field_specific_resources": {{
        "industry_publications": "Relevant publications for this field",
        "professional_organizations": "Industry associations and groups",
        "conferences_events": "Important events in this field",
        "online_communities": "Digital communities for this field",
        "mentorship_opportunities": "Mentorship options in this field"
    }}
}}

Guidelines for creating field-specific roadmaps:
1. Analyze the goal and identify the specific field/industry
2. Research current trends and requirements in that field
3. Include field-specific terminology and concepts
4. Provide realistic timelines based on field standards
5. Include field-specific resources and networking opportunities
6. Address field-specific challenges and regulations
7. Consider industry-specific success metrics
8. Include field-relevant alternative paths
9. Provide field-specific budget considerations
10. Address technology impact on the field
11. Include field-specific certification requirements
12. Consider geographical and market factors
13. Address field-specific risk factors
14. Include field-relevant networking strategies

CRITICAL REQUIREMENTS:
- Generate UNIQUE content for each request (Request ID: {request_id})
- Make the roadmap highly personalized to the specific goal
- Include current, up-to-date information and trends
- Provide specific, actionable advice for the field
- Use real examples and case studies when applicable
- Include current market data and statistics
- Address the user's specific situation and context
- Ensure this roadmap is completely different from any previous ones

Make the roadmap highly detailed, field-specific, and actionable with comprehensive data relevant to the specific industry or field. Ensure each roadmap is unique and tailored to the user's exact goal."""
        
        try:
            logger.info(f"Generating fresh roadmap for goal: {goal} (Request ID: {request_id})")
            
            # Generate fresh content from Gemini API
            response = self.model.generate_content(prompt)

            # Extract JSON from response
            response_text = response.text.strip()

            # Log the raw Gemini response for debugging
            print("RAW GEMINI RESPONSE:", response_text)

            # 1. Strip leading/trailing markdown/code block markers
            cleaned = response_text.strip()
            if cleaned.startswith('```json'):
                cleaned = cleaned[7:]
            if cleaned.startswith('```'):
                cleaned = cleaned[3:]
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            # 2. Use stack-based extraction to get the first complete JSON object
            def extract_first_json_object(text):
                start = text.find('{')
                if start == -1:
                    return None
                stack = []
                for i in range(start, len(text)):
                    if text[i] == '{':
                        stack.append('{')
                    elif text[i] == '}':
                        stack.pop()
                        if not stack:
                            return text[start:i+1]
                return None

            json_str = extract_first_json_object(cleaned)
            if not json_str:
                print("No JSON object found in Gemini response.")
                raise ValueError("No JSON object found in Gemini response.")

            # 3. Remove control characters
            json_str = re.sub(r'[\x00-\x1F\x7F]', '', json_str)

            # 4. Parse with json.loads()
            try:
                roadmap_data = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"JSONDecodeError at pos {e.pos}: {e.msg}")
                print("Failed to parse extracted JSON string:", json_str[:1000])  # Print first 1000 chars for debug
                raise ValueError(f"Failed to parse Gemini response as JSON: {e}")

            # Validate structure
            if 'phases' not in roadmap_data:
                raise ValueError("Invalid roadmap structure: missing 'phases'")

            logger.info(f"Successfully generated fresh roadmap for goal: {goal} (Request ID: {request_id})")
            return roadmap_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON for goal '{goal}' (Request ID: {request_id}): {e}")
            raise ValueError(f"Failed to parse Gemini response as JSON: {e}")
        except Exception as e:
            logger.error(f"Error generating roadmap for goal '{goal}' (Request ID: {request_id}): {e}")
            raise Exception(f"Error generating roadmap: {e}")
    
    def get_sample_roadmap(self):
        """Return a detailed, field-specific sample roadmap for testing - ONLY FOR TESTING"""
        logger.warning("Using sample roadmap - this should only be used for testing")
        return {
            "title": "Comprehensive Business & Entrepreneurship Roadmap for Starting a Tech Startup",
            "description": "A detailed guide to launch and scale a technology startup in the competitive startup ecosystem",
            "goal_category": "Business/Entrepreneurship",
            "request_id": "sample-request-id",
            "generated_at": "2024-01-01 00:00:00",
            "field_specific_data": {
                "industry_insights": "The tech startup ecosystem is highly competitive with rapid innovation cycles. Success requires strong product-market fit, scalable technology, and effective go-to-market strategy.",
                "market_analysis": "Global startup funding reached $621B in 2021. SaaS, FinTech, and HealthTech are leading sectors. Remote work has accelerated digital transformation opportunities.",
                "skill_requirements": "Technical skills, business acumen, market research, fundraising, team building, product management, and customer development",
                "certification_paths": "Y Combinator, TechStars, 500 Startups accelerators. Industry-specific certifications for compliance (SOC 2, HIPAA, etc.)",
                "networking_opportunities": "Startup meetups, pitch competitions, accelerator programs, industry conferences, online communities like Product Hunt, Reddit r/startups"
            },
            "phases": [
                {
                    "title": "Ideation & Market Validation Phase",
                    "description": "Validate your startup idea through comprehensive market research and customer discovery",
                    "estimated_duration": "2-4 months",
                    "field_relevance": "Critical for achieving product-market fit, the foundation of startup success",
                    "sub_phases": [
                        {
                            "title": "Problem Discovery & Market Research",
                            "description": "Identify real problems and validate market opportunity through systematic research",
                            "estimated_duration": "3-4 weeks",
                            "field_context": "Startup success depends on solving real problems with viable market size",
                            "steps": [
                                {
                                    "title": "Conduct Customer Interviews",
                                    "description": "Interview 50+ potential customers to understand their pain points, current solutions, and willingness to pay. Use structured interview techniques and document insights systematically.",
                                    "estimated_time": "2-3 weeks",
                                    "difficulty": "Intermediate",
                                    "field_specific_guidance": "Customer discovery is the foundation of lean startup methodology",
                                    "resources": [
                                        {
                                            "name": "The Mom Test by Rob Fitzpatrick",
                                            "type": "Book",
                                            "description": "Essential guide for conducting effective customer interviews",
                                            "url": "",
                                            "field_relevance": "Standard methodology in startup customer discovery"
                                        },
                                        {
                                            "name": "Typeform",
                                            "type": "Tool",
                                            "description": "Create customer interview surveys and feedback forms",
                                            "url": "https://typeform.com",
                                            "field_relevance": "Widely used in startup customer research"
                                        }
                                    ],
                                    "milestones": [
                                        "Complete 50+ customer interviews",
                                        "Identify top 3 pain points",
                                        "Validate problem-solution fit"
                                    ],
                                    "motivation": "Startup success depends on solving real problems that customers will pay for",
                                    "potential_challenges": [
                                        "Getting honest feedback from potential customers",
                                        "Identifying the right target audience"
                                    ],
                                    "tips": [
                                        "Ask open-ended questions about problems, not solutions",
                                        "Focus on understanding the 'why' behind customer behavior",
                                        "Document everything for pattern analysis"
                                    ],
                                    "success_indicators": [
                                        "Clear problem definition with customer validation",
                                        "Identified target market with sufficient size",
                                        "Customer willingness to pay for solution"
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "field_specific_considerations": {
                "industry_trends": "AI/ML integration, remote work tools, sustainability tech, Web3, and cybersecurity are trending. Focus on solving real problems with scalable solutions.",
                "competitive_landscape": "Highly competitive with rapid innovation. Success requires strong differentiation, execution speed, and customer focus.",
                "regulatory_requirements": "Consider data privacy (GDPR, CCPA), industry-specific regulations (HIPAA for health tech, PCI for fintech), and international compliance.",
                "technology_impact": "AI/ML, cloud computing, and mobile-first approaches are essential. Consider scalability and security from day one.",
                "future_outlook": "Strong growth expected in SaaS, fintech, healthtech, and sustainability tech. Focus on solving real problems with sustainable business models."
            },
            "prerequisites": [
                "Basic understanding of startup ecosystem and lean startup methodology",
                "Technical skills or access to technical co-founder/team",
                "Business acumen and financial literacy",
                "Strong networking and communication skills"
            ],
            "success_metrics": [
                "Achieve product-market fit within 12 months",
                "Secure first 100 paying customers",
                "Raise seed funding or achieve profitability",
                "Build a scalable team and processes"
            ],
            "timeline_overview": "Total timeline: 12-18 months from idea to seed funding, with ongoing iteration and scaling",
            "budget_considerations": "Initial costs: $10K-$50K for MVP development, $5K-$20K for legal/incorporation, $10K-$30K for marketing/launch. Plan for 18 months of runway.",
            "risk_factors": [
                "Market timing and competitive pressure",
                "Technical challenges and scalability issues",
                "Funding difficulties and cash flow management",
                "Team building and talent acquisition challenges"
            ],
            "alternative_paths": [
                "Start as a side project while maintaining employment",
                "Join an accelerator program for mentorship and funding",
                "Focus on a niche market with less competition",
                "Consider bootstrapping vs. fundraising strategies"
            ],
            "field_specific_resources": {
                "industry_publications": "TechCrunch, VentureBeat, The Information, Stratechery",
                "professional_organizations": "Startup Grind, Founders Network, YPO, EO",
                "conferences_events": "SXSW, Web Summit, Disrupt, Startup Grind Global",
                "online_communities": "Reddit r/startups, Indie Hackers, Product Hunt, Hacker News",
                "mentorship_opportunities": "Y Combinator, TechStars, 500 Startups, local startup accelerators"
            }
        } 