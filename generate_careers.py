import csv
import random

rows = []

# Exact keys from AiAdvisorController.php $keywordMap
career_fields = {
    "Software Engineering": {
        "stream": "Maths;ICT;Technology",
        "ol_courses": [
            "Foundation in IT",
            "Diploma in Information Technology",
            "Diploma in Software Engineering",
            "NVQ Level 4 IT Technician",
            "Certificate in Programming"
        ],
        "al_courses": [
            "BSc Computer Science",
            "BSc Software Engineering",
            "BSc Information Technology",
            "BSc Artificial Intelligence"
        ],
        "entry": ["Junior Software Developer", "Software Developer Trainee", "Associate Software Engineer"],
        "mid": ["Software Engineer", "Full Stack Developer", "Backend Engineer"],
        "senior": ["Software Architect", "Engineering Manager", "Tech Lead"],
        "skills": "Programming;Python;Java;SQL;Git",
        "soft_skills": "Problem Solving;Critical Thinking;Teamwork;Communication",
        "remote": "Yes",
        "freelance": "High",
        "description": "Designing and developing web, mobile, and enterprise software systems.",
        "subjects": "Algorithms;Data Structures;Databases",
        "certs": "AWS Certified Developer;Azure Fundamentals;Scrum Master",
        "salary_start": (80000, 150000),
        "salary_future_base": (300000, 600000)
    },
    
    "Data Science": {
        "stream": "Maths;ICT;Science",
        "ol_courses": [
            "Foundation in IT",
            "Diploma in Data Analytics",
            "NVQ Level 4 IT Assistant"
        ],
        "al_courses": [
            "BSc Data Science",
            "BSc Artificial Intelligence",
            "BSc Statistics",
            "BSc Data Engineering"
        ],
        "entry": ["Data Analyst", "Junior Data Scientist", "BI Analyst"],
        "mid": ["Data Scientist", "Machine Learning Engineer", "Data Engineer"],
        "senior": ["Senior Data Scientist", "AI Research Scientist", "Chief Data Officer"],
        "skills": "Machine Learning;Python;SQL;Data Viz;Statistics",
        "soft_skills": "Analytical Thinking;Problem Solving;Attention to Detail;Communication",
        "remote": "Yes",
        "freelance": "High",
        "description": "Analyzing complex data sets to help companies make data-driven decisions and building predictive models.",
        "subjects": "Probability;Linear Algebra;Big Data;Deep Learning",
        "certs": "IBM Data Science;Google Data Analytics;AWS Machine Learning",
        "salary_start": (100000, 180000),
        "salary_future_base": (400000, 700000)
    },

    "Information Security": {
        "stream": "Maths;ICT;Technology",
        "ol_courses": [
            "Foundation in IT",
            "Diploma in Cyber Security",
            "Certificate in Network Security"
        ],
        "al_courses": [
            "BSc Cyber Security",
            "BSc Information Security",
            "BSc Computer Science"
        ],
        "entry": ["SOC Analyst", "Security Analyst Trainee", "Junior Penetration Tester"],
        "mid": ["Cyber Security Specialist", "Penetration Tester", "Security Engineer"],
        "senior": ["Cyber Security Manager", "Security Architect", "Chief Information Security Officer (CISO)"],
        "skills": "Network Security;Ethical Hacking;Linux;Risk Assessment",
        "soft_skills": "Perseverance;Problem Solving;Ethics;Analytical Thinking",
        "remote": "Yes",
        "freelance": "High",
        "description": "Protecting computer systems and networks from cyber attacks and unauthorized access.",
        "subjects": "Cryptography;Network Protocols;Malware Analysis;Digital Forensics",
        "certs": "CEH;CompTIA Security+;CISSP;CISM",
        "salary_start": (100000, 180000),
        "salary_future_base": (400000, 800000)
    },

    "IT Infrastructure": {
        "stream": "Maths;ICT;Technology",
        "ol_courses": [
            "Foundation in IT",
            "Diploma in Networking",
            "Diploma in Hardware and Networking",
            "NVQ Level 4 Network Technician"
        ],
        "al_courses": [
            "BSc Information Technology",
            "BSc Computer Networking",
            "BSc Cloud Computing"
        ],
        "entry": ["IT Technician", "Junior Systems Administrator", "Network Support Engineer"],
        "mid": ["Systems Administrator", "Network Engineer", "Cloud Engineer"],
        "senior": ["IT Infrastructure Manager", "Network Architect", "Senior Cloud Architect"],
        "skills": "Linux/Windows Server;Routing & Switching;Cloud Computing (AWS/Azure)",
        "soft_skills": "Troubleshooting;Customer Service;Reliability;Time Management",
        "remote": "Yes",
        "freelance": "Medium",
        "description": "Designing, installing, and maintaining the computer networks and systems that organizations rely on.",
        "subjects": "Computer Networks;System Administration;Operating Systems",
        "certs": "CCNA;CompTIA Network+;AWS SysOps;CCNP",
        "salary_start": (70000, 120000),
        "salary_future_base": (250000, 500000)
    },
    
    "Mechanical Engineering": {
        "stream": "Maths;Technology",
        "ol_courses": [
            "Foundation in Engineering",
            "Diploma in Mechanical Engineering",
            "NVQ Level 4 Mechanical Technician",
            "Certificate in Automobile Engineering"
        ],
        "al_courses": [
            "BSc Mechanical Engineering",
            "BSc Automobile Engineering",
            "BSc Mechatronics"
        ],
        "entry": ["Junior Mechanical Engineer", "Design Engineer Intern", "Maintenance Engineer Trainee"],
        "mid": ["Mechanical Engineer", "Maintenance Engineer", "Production Engineer"],
        "senior": ["Senior Mechanical Engineer", "Engineering Director", "Plant Manager"],
        "skills": "Thermodynamics;Robotics;CAD/CAM;Quality Control",
        "soft_skills": "Analytical Thinking;Problem Solving;Attention to Detail",
        "remote": "No",
        "freelance": "Low",
        "description": "Designing, developing, building, and testing mechanical and thermal sensors and devices.",
        "subjects": "Machine Design;Fluid Mechanics;Thermodynamics;Control Systems",
        "certs": "SolidWorks Certification;Chartered Engineer (CEng);Six Sigma",
        "salary_start": (80000, 140000),
        "salary_future_base": (300000, 600000)
    },

    "Civil Engineering": {
        "stream": "Maths;Technology",
        "ol_courses": [
            "Foundation in Engineering",
            "Diploma in Civil Engineering",
            "NVQ Level 4 Construction Technician",
            "Certificate in Quantity Surveying"
        ],
        "al_courses": [
            "BSc Civil Engineering",
            "BSc Quantity Surveying"
        ],
        "entry": ["Site Engineer", "Civil Engineer Trainee", "Structural Trainee"],
        "mid": ["Project Engineer", "Senior Civil Engineer", "Structural Engineer"],
        "senior": ["Construction Manager", "Engineering Director", "Senior Structural Engineer"],
        "skills": "AutoCAD;Structural Analysis;Project Management;Surveying",
        "soft_skills": "Leadership;Project Management;Communication;Problem Solving",
        "remote": "No",
        "freelance": "Low",
        "description": "Designing, building, and supervising infrastructure projects and systems.",
        "subjects": "Structural Design;Materials Science;Fluid Mechanics;Geotechnical Engineering",
        "certs": "AutoCAD Certification;Chartered Engineer (CEng);PMP",
        "salary_start": (70000, 120000),
        "salary_future_base": (300000, 800000)
    },

    "Legal Services": {
        "stream": "Arts;Commerce",
        "ol_courses": [
            "Diploma in Legal Studies",
            "Certificate in Legal Assistantship"
        ],
        "al_courses": [
            "LLB Law",
            "Bachelor of Laws"
        ],
        "entry": ["Legal Assistant", "Apprentice", "Junior Lawyer"],
        "mid": ["Lawyer", "Attorney-at-Law", "Corporate Counsel"],
        "senior": ["Senior Counsel", "Partner", "Judge"],
        "skills": "Legal Research;Litigation;Drafting Contracts;Compliance",
        "soft_skills": "Negotiation;Public Speaking;Analytical Thinking;Persuasion",
        "remote": "Sometimes",
        "freelance": "Medium",
        "description": "Advising and representing clients in legal matters, drafting documents, and ensuring legal compliance.",
        "subjects": "Contract Law;Criminal Law;Constitutional Law;Corporate Law",
        "certs": "Attorney-at-Law (Sri Lanka Law College);Notary Public",
        "salary_start": (60000, 100000),
        "salary_future_base": (300000, 800000)
    },

    "Finance": {
        "stream": "Commerce;Maths",
        "ol_courses": [
            "Foundation in Business",
            "Diploma in Accounting",
            "Certificate in Bookkeeping",
            "NVQ Level 4 Bookkeeping"
        ],
        "al_courses": [
            "BSc Accounting",
            "BSc Accounting & Finance",
            "BSc Finance",
            "ACCA",
            "CIMA",
            "CFA"
        ],
        "entry": ["Accounts Assistant", "Audit Trainee", "Junior Accountant"],
        "mid": ["Accountant", "Senior Auditor", "Financial Analyst", "Tax Executive"],
        "senior": ["Finance Manager", "Chief Financial Officer (CFO)", "Director of Finance"],
        "skills": "Financial Reporting;Taxation;Auditing;ERP Systems;Excel",
        "soft_skills": "Attention to Detail;Ethics;Analytical Thinking",
        "remote": "Sometimes",
        "freelance": "Medium",
        "description": "Managing financial records, analyzing financial data, and ensuring legal tax compliance for organizations.",
        "subjects": "Corporate Finance;Auditing;Management Accounting;Economics",
        "certs": "ACCA;CIMA;CA Sri Lanka;CMA;CFA",
        "salary_start": (60000, 100000),
        "salary_future_base": (250000, 700000)
    },
    
    "Business Operations": {
        "stream": "Commerce;Arts",
        "ol_courses": [
            "Foundation in Business",
            "Diploma in Business Management",
            "Certificate in Business Administration"
        ],
        "al_courses": [
            "BBA Business Management",
            "BSc Business Administration",
            "BSc Operations Management"
        ],
        "entry": ["Management Trainee", "Operations Assistant", "Business Coordinator"],
        "mid": ["Operations Manager", "Business Analyst"],
        "senior": ["Chief Operating Officer", "General Manager", "Operations Director"],
        "skills": "Strategic Planning;Budgeting;Project Management;Data Analysis",
        "soft_skills": "Leadership;Decision Making;Negotiation;Communication",
        "remote": "Sometimes",
        "freelance": "Low",
        "description": "Overseeing the day-to-day operations of a company to ensure efficiency and profitability.",
        "subjects": "Strategic Management;Organizational Behavior;Marketing;HR",
        "certs": "PMP;Agile PM;Certified Business Analysis Professional (CBAP)",
        "salary_start": (80000, 130000),
        "salary_future_base": (300000, 700000)
    },

    "Marketing": {
        "stream": "Commerce;Arts",
        "ol_courses": [
            "Foundation in Business",
            "Diploma in Marketing",
            "Certificate in Digital Marketing"
        ],
        "al_courses": [
            "BBA Marketing",
            "BSc Marketing Management",
            "BSc Digital Marketing",
            "CIM"
        ],
        "entry": ["Marketing Executive", "Digital Marketing Assistant", "SEO Trainee"],
        "mid": ["Marketing Manager", "Brand Manager", "Digital Marketing Executive", "SEO Specialist"],
        "senior": ["Chief Marketing Officer", "Marketing Director", "Head of Digital"],
        "skills": "SEO/SEM;Digital Marketing;Brand Strategy;Content Creation;Google Analytics",
        "soft_skills": "Creativity;Communication;Adaptability;Empathy",
        "remote": "Yes",
        "freelance": "High",
        "description": "Promoting products and services using digital channels to reach target audiences effectively.",
        "subjects": "Consumer Behavior;Digital Strategy;Market Research;Brand Management",
        "certs": "CIM;Google Digital Garage;HubSpot Inbound Marketing",
        "salary_start": (60000, 110000),
        "salary_future_base": (250000, 600000)
    },

    "Human Resources": {
        "stream": "Commerce;Arts",
        "ol_courses": [
            "Foundation in Business",
            "Diploma in Human Resource Management",
            "Certificate in HRM"
        ],
        "al_courses": [
            "BSc Human Resource Management",
            "BBA Human Resource Management",
            "CQHRM"
        ],
        "entry": ["HR Assistant", "Recruitment Trainee", "Payroll Clerk"],
        "mid": ["HR Manager", "Talent Acquisition Specialist", "Employee Relations Manager"],
        "senior": ["HR Director", "Chief Human Resources Officer (CHRO)", "VP of People"],
        "skills": "Recruitment;Employee Management;Labor Law Knowledge;Payroll Management;HRIS",
        "soft_skills": "Empathy;Conflict Resolution;Negotiation;Communication",
        "remote": "Sometimes",
        "freelance": "Medium",
        "description": "Managing the recruitment, development, and wellbeing of an organization's employees.",
        "subjects": "Organizational Behavior;Labor Law;Performance Management;Compensation",
        "certs": "CIPM;SHRM-CP;PHR",
        "salary_start": (60000, 100000),
        "salary_future_base": (250000, 600000)
    },

    "Healthcare - Medical": {
        "stream": "Biology",
        "ol_courses": [
            "Diploma in Healthcare Assistance",
            "Certificate in Caregiving",
            "Diploma in Pharmacy Technician"
        ],
        "al_courses": [
            "MBBS Medicine",
            "BSc Pharmacy",
            "BSc Biomedical Science",
            "BSc Physiotherapy",
            "BSc Medical Laboratory Science"
        ],
        "entry": ["Medical Intern", "Pre-Intern Medical Officer", "Junior Doctor"],
        "mid": ["Medical Officer", "General Practitioner", "Registrar"],
        "senior": ["Consultant Specialist", "Chief Medical Officer", "Hospital Director"],
        "skills": "Diagnosis;Patient Care;Medical Procedures;Pharmacology",
        "soft_skills": "Empathy;Ethics;Decision Making Under Pressure;Communication",
        "remote": "No",
        "freelance": "Low",
        "description": "Diagnosing and treating illnesses, injuries, and health conditions in patients.",
        "subjects": "Anatomy;Physiology;Pathology;Pediatrics;Surgery",
        "certs": "MD/MS (Sri Lanka);MRCP;USMLE",
        "salary_start": (150000, 250000),
        "salary_future_base": (400000, 900000)
    },

    "Healthcare - Nursing": {
        "stream": "Biology",
        "ol_courses": [
            "Diploma in Nursing",
            "Certificate in Caregiving"
        ],
        "al_courses": [
            "BSc Nursing"
        ],
        "entry": ["Student Nurse", "Trainee Staff Nurse", "Assistant Nurse"],
        "mid": ["Registered Nurse", "Staff Nurse", "ICU Nurse"],
        "senior": ["Nursing Sister", "Matron", "Chief Nursing Officer"],
        "skills": "Patient Care;Vital Signs Monitoring;First Aid;Infection Control",
        "soft_skills": "Patience;Resilience;Empathy;Communication",
        "remote": "No",
        "freelance": "Low",
        "description": "Providing care to patients, administering medications, and assisting doctors in medical treatments.",
        "subjects": "Nursing Foundations;Medical-Surgical Nursing;Pharmacology;Psychology",
        "certs": "Specialized Nursing Certifications;BLS;ACLS",
        "salary_start": (50000, 90000),
        "salary_future_base": (200000, 500000)
    },

    "Architecture": {
        "stream": "Maths;Arts;Technology",
        "ol_courses": [
            "Diploma in Interior Design",
            "Certificate in Architectural Drafting",
            "NVQ Level 4 Draftsman"
        ],
        "al_courses": [
            "BArch Architecture",
            "BSc Built Environment",
            "BA Interior Design"
        ],
        "entry": ["Architect Assistant", "Design Intern", "Junior Draftsman"],
        "mid": ["Architect", "Project Architect", "Interior Designer"],
        "senior": ["Senior Architect", "Principal Architect", "Design Director"],
        "skills": "AutoCAD;SketchUp;3D Rendering;Building Codes;Revit",
        "soft_skills": "Creativity;Attention to Detail;Visualization;Communication",
        "remote": "Sometimes",
        "freelance": "High",
        "description": "Designing buildings and structures that are functional, safe, and aesthetically pleasing.",
        "subjects": "Architectural Design;Structural Design;Building Materials;History of Architecture",
        "certs": "Chartered Architect (AIA);LEED Green Associate",
        "salary_start": (70000, 120000),
        "salary_future_base": (250000, 600000)
    },

    "Education": {
        "stream": "Any",
        "ol_courses": [
            "Diploma in Primary Education",
            "Certificate in Teaching",
            "Diploma in Pre-school Teaching"
        ],
        "al_courses": [
            "BEd Education",
            "BA Education",
            "BSc Education",
            "BA English"
        ],
        "entry": ["Trainee Teacher", "Teaching Assistant", "Tutor"],
        "mid": ["Teacher", "Lecturer", "Instructor"],
        "senior": ["Principal", "Professor", "Dean"],
        "skills": "Lesson Planning;Student Assessment;Curriculum Development;Educational Technology",
        "soft_skills": "Patience;Mentorship;Public Speaking;Empathy",
        "remote": "Sometimes",
        "freelance": "Medium",
        "description": "Educating and mentoring students, preparing them for academic and personal success.",
        "subjects": "Teaching Methodology;Educational Psychology;Curriculum Design;Subject-Specific Focus",
        "certs": "Postgraduate Diploma in Education (PGDE);TEFL/TESOL",
        "salary_start": (40000, 80000),
        "salary_future_base": (150000, 400000)
    },

    "Agriculture & Agri-Business": {
        "stream": "Biology;Technology",
        "ol_courses": [
            "Diploma in Agriculture",
            "NVQ Level 4 Agriculture Technician",
            "Certificate in Agribusiness"
        ],
        "al_courses": [
            "BSc Agriculture",
            "BSc Agribusiness Management",
            "BSc Plantation Management"
        ],
        "entry": ["Agricultural Assistant", "Farm Supervisor", "Field Officer"],
        "mid": ["Agricultural Officer", "Agronomist", "Plantation Manager"],
        "senior": ["Senior Agronomist", "Estate Superintendent", "Director of Agriculture"],
        "skills": "Crop Management;Soil Science;Pest Control;Agri-Tech (IoT, Drones)",
        "soft_skills": "Problem Solving;Adaptability;Physical Endurance;Team Management",
        "remote": "No",
        "freelance": "Low",
        "description": "Managing farming operations, improving crop yields, and implementing sustainable agricultural practices.",
        "subjects": "Crop Science;Agricultural Economics;Soil Science;Plant Biotechnology",
        "certs": "GAP Certification;Pesticide Application License",
        "salary_start": (50000, 90000),
        "salary_future_base": (200000, 500000)
    },

    "Tourism": {
        "stream": "Arts;Commerce",
        "ol_courses": [
            "Diploma in Travel and Tourism",
            "Certificate in Hospitality",
            "Diploma in Hotel Management"
        ],
        "al_courses": [
            "BSc Tourism Management",
            "BSc Hospitality Management",
            "BBA Hospitality Management"
        ],
        "entry": ["Tour Guide", "Front Office Assistant", "Management Trainee"],
        "mid": ["Tour Operations Manager", "Hotel Manager", "Event Manager"],
        "senior": ["General Manager (Hotel)", "Director of Tourism", "Resort Manager"],
        "skills": "Languages;Property Management Systems;Event Planning;Inventory Management",
        "soft_skills": "Customer Service;Interpersonal Skills;Cultural Awareness;Problem Solving",
        "remote": "No",
        "freelance": "Medium",
        "description": "Managing operations in hotels, resorts, and coordinating travel experiences for tourists.",
        "subjects": "Tourism Marketing;Hospitality Operations;Food & Beverage Management;HR in Hospitality",
        "certs": "IATA Certification;Food Safety Certification;Language Diplomas",
        "salary_start": (50000, 100000),
        "salary_future_base": (200000, 600000)
    },

    "Psychology": {
        "stream": "Arts;Science",
        "ol_courses": [
            "Diploma in Psychology",
            "Certificate in Counseling"
        ],
        "al_courses": [
            "BSc Psychology",
            "BA Psychology"
        ],
        "entry": ["Assistant Psychologist", "Counseling Trainee", "HR Assistant"],
        "mid": ["Clinical Psychologist", "Counselor", "Organizational Psychologist"],
        "senior": ["Consultant Psychologist", "Director of Mental Health Services", "Chief HR Officer"],
        "skills": "Psychological Assessment;Therapy Techniques (CBT);Research Methodology",
        "soft_skills": "Empathy;Active Listening;Confidentiality;Patience",
        "remote": "Yes",
        "freelance": "High",
        "description": "Studying human behavior and helping individuals navigate mental health and emotional challenges.",
        "subjects": "Abnormal Psychology;Cognitive Psychology;Developmental Psychology;Counseling",
        "certs": "Clinical Psychology Masters;Counseling Diploma;Mental Health First Aid",
        "salary_start": (50000, 100000),
        "salary_future_base": (200000, 600000)
    },

    "Logistics": {
        "stream": "Commerce;Maths",
        "ol_courses": [
            "Diploma in Logistics",
            "Certificate in Supply Chain Management",
            "NVQ Level 4 Logistics Assistant"
        ],
        "al_courses": [
            "BSc Logistics",
            "BSc Supply Chain Management",
            "BBA Supply Chain"
        ],
        "entry": ["Logistics Coordinator", "Procurement Trainee", "Warehouse Assistant"],
        "mid": ["Logistics Analyst", "Supply Chain Manager", "Warehouse Manager"],
        "senior": ["Chief Supply Chain Officer", "Procurement Director", "Director of Operations"],
        "skills": "Inventory Management;Data Analysis;ERP Software (SAP/Oracle);Freight Forwarding",
        "soft_skills": "Negotiation;Time Management;Problem Solving;Leadership",
        "remote": "Sometimes",
        "freelance": "Medium",
        "description": "Overseeing the movement of goods from suppliers to consumers efficiently and cost-effectively.",
        "subjects": "Global Supply Chain;Inventory Control;Procurement;Transportation Management",
        "certs": "CIPS;CSCP;Six Sigma",
        "salary_start": (65000, 120000),
        "salary_future_base": (250000, 700000)
    },

    "Design": {
        "stream": "Arts;Technology",
        "ol_courses": [
            "Foundation in Design",
            "Diploma in Graphic Design",
            "Certificate in Multimedia",
            "NVQ Level 4 Multimedia Design"
        ],
        "al_courses": [
            "BA Graphic Design",
            "BSc Multimedia Design",
            "BA Fine Arts"
        ],
        "entry": ["Junior Graphic Designer", "UI/UX Intern", "Visual Designer"],
        "mid": ["Graphic Designer", "UI/UX Designer", "Senior Designer"],
        "senior": ["Creative Director", "Lead Product Designer", "Senior Art Director"],
        "skills": "Photoshop;Adobe Illustrator;Figma;UI Design;Color Theory;Typography",
        "soft_skills": "Creativity;Time Management;Attention to Detail;Receptivity to Feedback",
        "remote": "Yes",
        "freelance": "High",
        "description": "Creating visual concepts to communicate ideas that inspire, inform, and captivate consumers.",
        "subjects": "Visual Communication;Design Principles;Digital Art;User Experience",
        "certs": "Adobe Certified Professional;Google UX Design",
        "salary_start": (60000, 110000),
        "salary_future_base": (250000, 600000)
    },

    "Fashion & Textile": {
        "stream": "Arts;Technology",
        "ol_courses": [
            "Diploma in Fashion Design",
            "Certificate in Pattern Making",
            "NVQ Level 4 Tailoring"
        ],
        "al_courses": [
            "BA Fashion Design",
            "BSc Textile and Clothing Technology",
            "BA Textile Design"
        ],
        "entry": ["Junior Fashion Designer", "Assistant Merchandiser", "Pattern Maker"],
        "mid": ["Fashion Designer", "Merchandiser", "Textile Designer"],
        "senior": ["Head Designer", "Creative Director (Fashion)", "Sourcing Manager"],
        "skills": "Pattern Making;Adobe Illustrator;Garment Construction;Trend Forecasting",
        "soft_skills": "Creativity;Attention to Detail;Time Management;Commercial Awareness",
        "remote": "Sometimes",
        "freelance": "High",
        "description": "Designing clothing and accessories, and managing apparel production processes.",
        "subjects": "Fashion Illustration;Textile Science;Garment Manufacturing;Merchandising",
        "certs": "Diploma in Fashion Styling;Apparel Merchandising Certificate",
        "salary_start": (50000, 90000),
        "salary_future_base": (200000, 600000)
    }
}

education_levels = [
    "O/L Completed",
    "A/L Completed",
    "A/L Pending",
    "Diploma Holder",
    "Undergraduate",
    "Graduate",
    "Career Switcher"
]

for field, data in career_fields.items():
    # Generate 45 rows per field for a total of ~945 rows
    for i in range(45):
        edu = random.choice(education_levels)

        if edu == "O/L Completed":
            course = random.choice(data["ol_courses"])
        elif edu in ["A/L Pending", "Diploma Holder"]:
            # They might be doing a diploma or starting a degree
            course = random.choice(data["ol_courses"] + data["al_courses"])
        else:
            course = random.choice(data["al_courses"])

        # Realistic salary generation using multipliers for future salary
        salary_start = random.randint(data["salary_start"][0], data["salary_start"][1])
        future_low = random.randint(data["salary_future_base"][0], data["salary_future_base"][1])
        future_high = future_low * random.randint(2, 4)
        
        # Round salaries slightly to look more realistic
        salary_start = round(salary_start, -3)
        future_low = round(future_low, -3)
        future_high = round(future_high, -4)
        
        salary_start_lkr = f"{salary_start}"
        future_salary_lkr = f"{future_low}-{future_high}"

        row = [
            field, # career_field (Must exactly match AiAdvisorController.php)
            edu, # education_level
            data["stream"], # stream_or_subject_interest
            course, # recommended_degree_or_course
            random.choice(data["entry"]), # entry_level_job
            random.choice(data["mid"]), # mid_level_job
            random.choice(data["senior"]), # senior_level_job
            data["skills"], # key_skills_required
            data["soft_skills"], # recommended_soft_skills
            data["subjects"], # typical_university_subjects
            data["certs"], # certifications_or_extra_training
            random.choice(["Moderate", "High", "Very High"]), # industry_growth_in_sri_lanka
            random.choice(["Medium", "High", "Very High"]), # global_demand_level
            salary_start_lkr, # average_starting_salary_lkr
            future_salary_lkr, # future_salary_range_lkr
            data["remote"], # remote_work_possibility
            data["freelance"], # freelance_opportunity
            random.choice(["Low", "Medium"]), # automation_risk
            data["description"] # job_description
        ]
        
        rows.append(row)

# The Database schema expects `id` as the first column for the imported CSV, 
final_rows = []
for idx, r in enumerate(rows, 1):
    final_rows.append([idx] + r)

output_file = 'd:/UniAds-F_B/career_guidance_dataset.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        "id",
        "education_level",
        "stream_or_subject_interest",
        "recommended_degree_or_course",
        "career_field",
        "entry_level_job",
        "mid_level_job",
        "senior_level_job",
        "key_skills_required",
        "recommended_soft_skills",
        "typical_university_subjects",
        "certifications_or_extra_training",
        "industry_growth_in_sri_lanka",
        "global_demand_level",
        "average_starting_salary_lkr",
        "future_salary_range_lkr",
        "remote_work_possibility",
        "freelance_opportunity",
        "automation_risk",
        "job_description"
    ])
    # The columns from `row` are currently:
    # 0 = career_field, 1 = edu, 2 = stream, 3 = course
    # Need to output as: 
    # id, edu, stream, course, career_field, entry, mid, ...
    # i.e., indices 1, 2, 3, 0
    reordered_rows = []
    for fr in final_rows:
        reordered_row = [
            fr[0],  # id
            fr[2],  # education_level
            fr[3],  # stream_or_subject_interest
            fr[4],  # recommended_degree_or_course
            fr[1],  # career_field
            fr[5],  # entry
            fr[6],  # mid
            fr[7],  # senior
            fr[8],  # skills
            fr[9],  # soft_skills
            fr[10], # subjects
            fr[11], # certs
            fr[12], # industry_growth
            fr[13], # global_demand
            fr[14], # salary_start
            fr[15], # salary_future
            fr[16], # remote
            fr[17], # freelance
            fr[18], # automation_risk
            fr[19]  # description
        ]
        reordered_rows.append(reordered_row)
        
    writer.writerows(reordered_rows)

print(f"Dataset generated successfully! Created {len(final_rows)} rows adhering strictly to advanced realism rules.")
