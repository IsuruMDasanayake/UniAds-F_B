import csv
import random

industries = {
    'IT': {
        'streams': ['A/L Maths Stream', 'A/L Technology Stream', 'A/L Commerce Stream', 'O/L Completed', 'Diploma Holder', 'Undergraduate', 'Graduate', 'Career Switcher'],
        'interests': ['Programming', 'Networking', 'Cybersecurity', 'Data Analysis', 'AI & Machine Learning'],
        'degrees': ['BSc Computer Science', 'BSc Software Engineering', 'BSc Data Science', 'BSc Cybersecurity', 'BSc Information Systems', 'Diploma in IT'],
        'careers': [
            {
                'career_field': 'IT',
                'entry': 'Junior Software Developer', 'mid': 'Software Engineer', 'senior': 'Software Architect',
                'skills': 'Java;Python;SQL', 'soft': 'Problem Solving;Teamwork', 'subjects': 'Data Structures;Algorithms;Databases',
                'certs': 'AWS Certified Developer;Oracle Java', 'desc': 'Designing and developing software applications for enterprise and consumer use.'
            },
            {
                'career_field': 'Data Science',
                'entry': 'Data Analyst', 'mid': 'Data Scientist', 'senior': 'AI Research Scientist',
                'skills': 'Python;R;Machine Learning', 'soft': 'Analytical Thinking;Communication', 'subjects': 'Statistics;Linear Algebra;Machine Learning',
                'certs': 'Google Data Analytics;Coursera ML', 'desc': 'Analyzing large datasets and building machine learning models to solve complex problems.'
            },
            {
                'career_field': 'Cybersecurity',
                'entry': 'Security Analyst Trainee', 'mid': 'Cybersecurity Specialist', 'senior': 'Chief Information Security Officer',
                'skills': 'Linux;Networking;Penetration Testing', 'soft': 'Attention to Detail;Critical Thinking', 'subjects': 'Cryptography;Network Security',
                'certs': 'CompTIA Security+;CISSP', 'desc': 'Protecting systems and networks from digital attacks and unauthorized access.'
            }
        ]
    },
    'Business': {
        'streams': ['A/L Commerce Stream', 'A/L Maths Stream', 'A/L Arts Stream', 'Diploma Holder', 'Undergraduate', 'Graduate'],
        'interests': ['Business Management', 'Marketing', 'Accounting', 'HR Management', 'Entrepreneurship'],
        'degrees': ['BBA Marketing', 'BBA Human Resource Management', 'BSc Accounting & Finance', 'BBA Business Management'],
        'careers': [
            {
                'career_field': 'Marketing',
                'entry': 'Marketing Assistant', 'mid': 'Marketing Manager', 'senior': 'Chief Marketing Officer',
                'skills': 'SEO;Digital Marketing;Content Strategy', 'soft': 'Creativity;Communication', 'subjects': 'Consumer Behavior;Marketing Principles',
                'certs': 'Google Ads Certification;HubSpot Inbound', 'desc': 'Promoting products and services through digital and traditional marketing channels.'
            },
            {
                'career_field': 'HR',
                'entry': 'HR Assistant', 'mid': 'HR Manager', 'senior': 'HR Director',
                'skills': 'Recruitment;Payroll;Employee Relations', 'soft': 'Empathy;Conflict Resolution', 'subjects': 'Organizational Behavior;Labor Law',
                'certs': 'CIPD;SHRM-CP', 'desc': 'Managing human resources, recruitment, and employee relations within organizations.'
            },
            {
                'career_field': 'Accounting',
                'entry': 'Accountant Trainee', 'mid': 'Chartered Accountant', 'senior': 'Finance Director',
                'skills': 'Financial Reporting;Taxation;Auditing', 'soft': 'Analytical Thinking;Ethics', 'subjects': 'Corporate Finance;Tax Law',
                'certs': 'ACCA;CIMA', 'desc': 'Preparing and examining financial records to ensure accuracy and compliance.'
            }
        ]
    },
    'Engineering': {
        'streams': ['A/L Maths Stream', 'A/L Technology Stream'],
        'interests': ['Mechanical Systems', 'Electrical Systems', 'Construction'],
        'degrees': ['BSc Mechanical Engineering', 'BSc Electrical Engineering', 'BSc Civil Engineering'],
        'careers': [
            {
                'career_field': 'Mechanical Engineering',
                'entry': 'Mechanical Engineer Trainee', 'mid': 'Mechanical Engineer', 'senior': 'Engineering Manager',
                'skills': 'CAD;Thermodynamics;Fluid Mechanics', 'soft': 'Problem Solving;Project Management', 'subjects': 'Mechanics of Materials;Dynamics',
                'certs': 'AutoCAD Certification;Six Sigma', 'desc': 'Designing and overseeing the manufacturing of mechanical devices and systems.'
            },
            {
                'career_field': 'Electrical Engineering',
                'entry': 'Electrical Engineer Trainee', 'mid': 'Electrical Engineer', 'senior': 'Principal Electrical Engineer',
                'skills': 'Circuit Design;Power Systems;PLC', 'soft': 'Analytical Thinking;Teamwork', 'subjects': 'Electromagnetics;Control Systems',
                'certs': 'PMP;Licensed Engineer', 'desc': 'Developing, testing, and supervising the manufacturing of electrical equipment.'
            }
        ]
    },
    'Healthcare': {
        'streams': ['A/L Biology Stream'],
        'interests': ['Medicine', 'Healthcare', 'Nursing'],
        'degrees': ['MBBS Medicine', 'BSc Nursing', 'BSc Biomedical Science'],
        'careers': [
            {
                'career_field': 'Medicine',
                'entry': 'Medical Intern', 'mid': 'Doctor', 'senior': 'Medical Consultant',
                'skills': 'Diagnosis;Patient Care;Surgery', 'soft': 'Empathy;Resilience;Communication', 'subjects': 'Anatomy;Pharmacology;Pathology',
                'certs': 'Medical License;BLS/ACLS', 'desc': 'Diagnosing and treating illnesses and injuries to improve patient health.'
            },
            {
                'career_field': 'Nursing',
                'entry': 'Junior Nurse', 'mid': 'Registered Nurse', 'senior': 'Head Nurse / Matron',
                'skills': 'Patient Monitoring;IV Administration', 'soft': 'Compassion;Patience', 'subjects': 'Physiology;Nursing Fundamentals',
                'certs': 'Specialized Nursing Cert', 'desc': 'Providing care, education, and support to patients in hospitals and clinics.'
            }
        ]
    },
    'Law': {
        'streams': ['A/L Arts Stream', 'A/L Commerce Stream'],
        'interests': ['Law', 'Justice', 'Corporate Governance'],
        'degrees': ['LLB Law'],
        'careers': [
            {
                'career_field': 'Legal',
                'entry': 'Junior Lawyer', 'mid': 'Corporate Lawyer', 'senior': 'Senior Counsel',
                'skills': 'Legal Research;Contract Drafting;Litigation', 'soft': 'Negotiation;Public Speaking', 'subjects': 'Constitutional Law;Contract Law',
                'certs': 'Attorney-at-Law;Notary Public', 'desc': 'Advising and representing clients in legal matters and disputes.'
            }
        ]
    },
    'Design & Media': {
        'streams': ['A/L Arts Stream', 'A/L Technology Stream', 'O/L Completed'],
        'interests': ['Graphic Design', 'Video Editing', 'Media'],
        'degrees': ['BA Media Studies', 'Diploma in Graphic Design', 'BDes Architecture'],
        'careers': [
            {
                'career_field': 'Graphic Design',
                'entry': 'Junior Graphic Designer', 'mid': 'Senior Graphic Designer', 'senior': 'Creative Director',
                'skills': 'Adobe Creative Suite;UI/UX;Typography', 'soft': 'Creativity;Time Management', 'subjects': 'Visual Communication;Design Theory',
                'certs': 'Adobe Certified Professional', 'desc': 'Creating visual concepts using computer software to communicate ideas.'
            },
            {
                'career_field': 'Architecture',
                'entry': 'Architectural Assistant', 'mid': 'Architect', 'senior': 'Principal Architect',
                'skills': 'AutoCAD;Revit;3D Modeling', 'soft': 'Spatial Awareness;Creativity', 'subjects': 'Architectural Design;Building Tech',
                'certs': 'AIA Member;LEED AP', 'desc': 'Designing buildings and overseeing their construction process.'
            }
        ]
    },
    'Tourism & Hospitality': {
        'streams': ['A/L Arts Stream', 'A/L Commerce Stream', 'O/L Completed'],
        'interests': ['Tourism', 'Hospitality', 'Languages'],
        'degrees': ['Diploma in Tourism Management', 'BSc Hospitality Management', 'BA Languages'],
        'careers': [
            {
                'career_field': 'Tourism',
                'entry': 'Tour Guide', 'mid': 'Travel Consultant', 'senior': 'Tourism Board Director',
                'skills': 'Foreign Languages;Itinerary Planning', 'soft': 'Customer Service;Communication', 'subjects': 'Tourism Management;Cultural Studies',
                'certs': 'IATA Certification;Language Cert', 'desc': 'Organizing travel plans and providing tours to enhance visitor experiences.'
            },
            {
                'career_field': 'Hospitality',
                'entry': 'Front Desk Agent', 'mid': 'Hotel Manager', 'senior': 'General Manager',
                'skills': 'Reservation Systems;Event Planning', 'soft': 'Hospitality;Leadership', 'subjects': 'Hotel Operations;Food & Beverage',
                'certs': 'Hospitality Management Cert', 'desc': 'Managing hotel operations and ensuring excellent guest experiences.'
            }
        ]
    },
    'Logistics & Supply Chain': {
        'streams': ['A/L Commerce Stream', 'A/L Maths Stream'],
        'interests': ['Logistics', 'Supply Chain Management', 'Operations'],
        'degrees': ['BSc Supply Chain Management', 'BSc Logistics'],
        'careers': [
            {
                'career_field': 'Logistics',
                'entry': 'Logistics Coordinator', 'mid': 'Logistics Manager', 'senior': 'Supply Chain Director',
                'skills': 'Inventory Management;ERP Systems', 'soft': 'Organization;Negotiation', 'subjects': 'Operations Management;Transport Econ',
                'certs': 'CILT;Lean Six Sigma', 'desc': 'Overseeing the storage and distribution of goods in a supply chain.'
            }
        ]
    },
    'Education & Teaching': {
        'streams': ['A/L Arts Stream', 'A/L Science Stream', 'A/L Maths Stream', 'A/L Commerce Stream'],
        'interests': ['Teaching', 'Education', 'Languages'],
        'degrees': ['BA Education', 'BSc Education', 'Subject Specific Degree'],
        'careers': [
            {
                'career_field': 'Education',
                'entry': 'Teacher Assistant', 'mid': 'Teacher / Lecturer', 'senior': 'Principal / Professor',
                'skills': 'Curriculum Design;Instructional Design', 'soft': 'Patience;Communication', 'subjects': 'Educational Psychology;Pedagogy',
                'certs': 'PGCE;Teaching License', 'desc': 'Educating students and developing curricula in schools or universities.'
            }
        ]
    },
    'Agriculture': {
        'streams': ['A/L Biology Stream', 'A/L Technology Stream'],
        'interests': ['Agriculture', 'Plant Science', 'Farming'],
        'degrees': ['BSc Agriculture', 'Diploma in Agriculture'],
        'careers': [
            {
                'career_field': 'Agriculture',
                'entry': 'Agricultural Assistant', 'mid': 'Agronomist', 'senior': 'Plantation Manager',
                'skills': 'Crop Management;Soil Science', 'soft': 'Hardworking;Analytical', 'subjects': 'Plant Pathology;Agribusiness',
                'certs': 'GAP Certification', 'desc': 'Studying and improving crop yields and farming practices.'
            }
        ]
    }
}

growth_levels = ['Low', 'Moderate', 'High', 'Very High']
demand_levels = ['Low', 'Medium', 'High', 'Very High']
remote_possibility = ['Yes', 'No']
freelance_levels = ['Low', 'Medium', 'High']
automation_risk = ['Low', 'Medium', 'High']

# Generate combinations to get exactly 1000 unique rows
generated_rows = set()
data = []

while len(data) < 10000:
    ind_name = random.choice(list(industries.keys()))
    ind = industries[ind_name]
    
    edu = random.choice(ind['streams'])
    interest = random.choice(ind['interests'])
    degree = random.choice(ind['degrees'])
    career = random.choice(ind['careers'])
    
    growth = random.choice(growth_levels)
    demand = random.choice(demand_levels)
    salary_start = random.randint(45, 120) * 1000
    salary_future = f"{random.randint(150, 300) * 1000}-{random.randint(400, 800) * 1000}"
    remote = random.choice(remote_possibility)
    freelance = random.choice(freelance_levels)
    auto_risk = random.choice(automation_risk)
    
    # Customize slightly to ensure uniqueness
    var_interest = interest
    var_degree = degree
    
    # Add slight random variations to skills to increase uniqueness
    skills_list = career['skills'].split(';')
    random.shuffle(skills_list)
    skills_shuffled = ';'.join(skills_list)
    
    row_tuple = (
        edu, var_interest, var_degree, career['career_field'], 
        career['entry'], career['mid'], career['senior'],
        skills_shuffled, career['soft'], career['subjects'], career['certs'],
        growth, demand, str(salary_start), salary_future, remote, freelance, auto_risk, career['desc']
    )
    
    if row_tuple not in generated_rows:
        generated_rows.add(row_tuple)
        data.append(row_tuple)

with open('d:/UniAds-F_B/career_guidance_dataset.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        'id', 'education_level', 'stream_or_subject_interest', 'recommended_degree_or_course',
        'career_field', 'entry_level_job', 'mid_level_job', 'senior_level_job',
        'key_skills_required', 'recommended_soft_skills', 'typical_university_subjects',
        'certifications_or_extra_training', 'industry_growth_in_sri_lanka', 'global_demand_level',
        'average_starting_salary_lkr', 'future_salary_range_lkr', 'remote_work_possibility',
        'freelance_opportunity', 'automation_risk', 'job_description'
    ])
    
    for idx, row in enumerate(data, 1):
        writer.writerow((idx,) + row)

print('Successfully generated 10000 rows at d:/UniAds-F_B/career_guidance_dataset.csv')
