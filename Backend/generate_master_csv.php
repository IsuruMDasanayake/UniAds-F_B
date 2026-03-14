<?php

/**
 * EMY Master Career Dataset Generator
 * Generates a high-quality CSV of 130+ real-world careers tailored for Sri Lanka.
 */

$roles = [
    // ---------------- Technology & IT ----------------
    "Software Architect" => "Technology & IT",
    "Cybersecurity Analyst" => "Technology & IT",
    "Cybersecurity Engineer" => "Technology & IT",
    "Data Engineer" => "Technology & IT",
    "Data Analyst" => "Technology & IT",
    "Machine Learning Engineer" => "Technology & IT",
    "MLOps Engineer" => "Technology & IT",
    "Cloud Architect" => "Technology & IT",
    "DevOps Engineer" => "Technology & IT",
    "Site Reliability Engineer" => "Technology & IT",
    "Blockchain Developer" => "Technology & IT",
    "Game Developer" => "Technology & IT",
    "AR Developer" => "Technology & IT",
    "VR Developer" => "Technology & IT",
    "Mobile App Developer" => "Technology & IT",
    "Frontend Developer" => "Technology & IT",
    "Backend Developer" => "Technology & IT",
    "Full Stack Developer" => "Technology & IT",
    "IT Systems Administrator" => "Technology & IT",
    "Network Engineer" => "Technology & IT",
    "Database Administrator" => "Technology & IT",
    "AI Engineer" => "Technology & IT",
    "Robotics Software Engineer" => "Technology & IT",

    // ---------------- Engineering ----------------
    "Civil Engineer" => "Engineering",
    "Structural Engineer" => "Engineering",
    "Mechanical Engineer" => "Engineering",
    "Electrical Engineer" => "Engineering",
    "Electronic Engineer" => "Engineering",
    "Mechatronics Engineer" => "Engineering",
    "Industrial Engineer" => "Engineering",
    "Chemical Engineer" => "Engineering",
    "Aerospace Engineer" => "Engineering",
    "Petroleum Engineer" => "Engineering",
    "Geotechnical Engineer" => "Engineering",
    "Marine Engineer" => "Engineering",
    "Renewable Energy Engineer" => "Engineering",
    "Automotive Engineer" => "Engineering",
    "Manufacturing Engineer" => "Engineering",

    // ---------------- Healthcare & Medical ----------------
    "Doctor / Physician" => "Healthcare & Medical",
    "Dentist" => "Healthcare & Medical",
    "Nurse" => "Healthcare & Medical",
    "Pharmacist" => "Healthcare & Medical",
    "Radiologist" => "Healthcare & Medical",
    "Physiotherapist" => "Healthcare & Medical",
    "Optometrist" => "Healthcare & Medical",
    "Veterinarian" => "Healthcare & Medical",
    "Psychologist" => "Healthcare & Medical",
    "Clinical Psychologist" => "Healthcare & Medical",
    "Nutritionist" => "Healthcare & Medical",
    "Dietitian" => "Healthcare & Medical",
    "Speech Therapist" => "Healthcare & Medical",
    "Medical Laboratory Scientist" => "Healthcare & Medical",
    "Public Health Officer" => "Healthcare & Medical",

    // ---------------- Business & Management ----------------
    "Business Analyst" => "Business & Management",
    "Product Manager" => "Business & Management",
    "Operations Manager" => "Business & Management",
    "Marketing Manager" => "Business & Management",
    "Sales Manager" => "Business & Management",
    "Human Resource Manager" => "Business & Management",
    "Project Manager" => "Business & Management",
    "Business Development Manager" => "Business & Management",
    "Management Consultant" => "Business & Management",
    "Entrepreneur / Startup Founder" => "Business & Management",

    // ---------------- Finance & Accounting ----------------
    "Chartered Accountant" => "Finance & Accounting",
    "Auditor" => "Finance & Accounting",
    "Tax Consultant" => "Finance & Accounting",
    "Financial Analyst" => "Finance & Accounting",
    "Investment Analyst" => "Finance & Accounting",
    "Risk Analyst" => "Finance & Accounting",
    "Financial Advisor" => "Finance & Accounting",
    "Bank Manager" => "Finance & Accounting",
    "Credit Analyst" => "Finance & Accounting",

    // ---------------- Law & Legal Studies ----------------
    "Attorney-at-Law" => "Law & Legal Studies",
    "Corporate Lawyer" => "Law & Legal Studies",
    "Legal Consultant" => "Law & Legal Studies",
    "Legal Researcher" => "Law & Legal Studies",
    "Judge" => "Law & Legal Studies",
    "Notary Public" => "Law & Legal Studies",
    "Legal Compliance Officer" => "Law & Legal Studies",

    // ---------------- Creative Arts & Design ----------------
    "Graphic Designer" => "Creative Arts & Design",
    "UI Designer" => "Creative Arts & Design",
    "UX Designer" => "Creative Arts & Design",
    "Product Designer" => "Creative Arts & Design",
    "Interior Designer" => "Creative Arts & Design",
    "Fashion Designer" => "Creative Arts & Design",
    "Animator" => "Creative Arts & Design",
    "Illustrator" => "Creative Arts & Design",
    "Video Game Artist" => "Creative Arts & Design",

    // ---------------- Media & Communication ----------------
    "Journalist" => "Media & Communication",
    "Content Writer" => "Media & Communication",
    "Content Strategist" => "Media & Communication",
    "Social Media Manager" => "Media & Communication",
    "Public Relations Officer" => "Media & Communication",
    "News Presenter" => "Media & Communication",
    "Video Producer" => "Media & Communication",
    "Podcast Producer" => "Media & Communication",

    // ---------------- Hospitality & Tourism ----------------
    "Hotel Manager" => "Hospitality & Tourism",
    "Restaurant Manager" => "Hospitality & Tourism",
    "Chef" => "Hospitality & Tourism",
    "Tour Guide" => "Hospitality & Tourism",
    "Travel Consultant" => "Hospitality & Tourism",
    "Event Planner" => "Hospitality & Tourism",
    "Flight Attendant" => "Hospitality & Tourism",
    "Hotel Receptionist" => "Hospitality & Tourism",

    // ---------------- Education & Teaching ----------------
    "University Lecturer" => "Education & Teaching",
    "School Teacher" => "Education & Teaching",
    "Primary School Teacher" => "Education & Teaching",
    "Secondary School Teacher" => "Education & Teaching",
    "Special Education Teacher" => "Education & Teaching",
    "Academic Counselor" => "Education & Teaching",
    "Curriculum Developer" => "Education & Teaching",

    // ---------------- Logistics & Supply Chain ----------------
    "Supply Chain Manager" => "Logistics & Supply Chain",
    "Supply Chain Analyst" => "Logistics & Supply Chain",
    "Procurement Manager" => "Logistics & Supply Chain",
    "Warehouse Manager" => "Logistics & Supply Chain",
    "Logistics Coordinator" => "Logistics & Supply Chain",
    "Inventory Manager" => "Logistics & Supply Chain",

    // ---------------- Construction & Architecture ----------------
    "Architect" => "Construction & Architecture",
    "Urban Planner" => "Construction & Architecture",
    "Quantity Surveyor" => "Construction & Architecture",
    "Construction Project Manager" => "Construction & Architecture",
    "Landscape Architect" => "Construction & Architecture",

    // ---------------- Skilled Trades ----------------
    "Electrician" => "Skilled Trades & Vocational",
    "Plumber" => "Skilled Trades & Vocational",
    "Carpenter" => "Skilled Trades & Vocational",
    "Welder" => "Skilled Trades & Vocational",
    "Automobile Mechanic" => "Skilled Trades & Vocational",
    "AC Technician" => "Skilled Trades & Vocational",
    "Electronics Repair Technician" => "Skilled Trades & Vocational",
    "Mason" => "Skilled Trades & Vocational",
    "Painter" => "Skilled Trades & Vocational",
    "Tiler" => "Skilled Trades & Vocational",
    "Beautician" => "Skilled Trades & Vocational",
    "Tailor" => "Skilled Trades & Vocational",
    "Barber" => "Skilled Trades & Vocational",

    // ---------------- Agri-Tech & Sustainability ----------------
    "Agricultural Scientist" => "Agri-Tech & Sustainability",
    "Agricultural Engineer" => "Agri-Tech & Sustainability",
    "Hydroponics Specialist" => "Agri-Tech & Sustainability",
    "Agribusiness Manager" => "Agri-Tech & Sustainability",
    "Sustainability Consultant" => "Agri-Tech & Sustainability",
    "Environmental Scientist" => "Agri-Tech & Sustainability",

    // ---------------- Modern Finance ----------------
    "Fintech Analyst" => "Modern Finance",
    "Cryptocurrency Analyst" => "Modern Finance",
    "Blockchain Finance Specialist" => "Modern Finance",
    "Digital Payments Specialist" => "Modern Finance"
];

$categoryMetadata = [
    'Technology & IT' => [
        'tech' => 'Python;Java;Cloud Computing;SQL;Git;Agile;System Design',
        'soft' => 'Problem Solving;Adaptability;Teamwork;Communication',
        'sub'  => 'Programming;Data Structures;Operating Systems;Networking',
        'cert' => 'AWS Certified;Azure Fundamentals;Google Cloud Professional'
    ],
    'Engineering' => [
        'tech' => 'AutoCAD;MATLAB;Project Management;Resource Planning;Safety Standards',
        'soft' => 'Analytical Thinking;Attention to Detail;Collaboration',
        'sub'  => 'Thermodynamics;Fluid Mechanics;Mathematics;Material Science',
        'cert' => 'Chartered Engineer (IESL);PMP;LEED Green Associate'
    ],
    'Healthcare & Medical' => [
        'tech' => 'Patient Care;Medical Diagnosis;Pharmacology;Emergency Response',
        'soft' => 'Empathy;Resilience;Ethical Judgment;Active Listening',
        'sub'  => 'Anatomy;Physiology;Pathology;Biochemistry',
        'cert' => 'SLMC Registration;Advanced Life Support (ALS);BLS'
    ],
    'Business & Management' => [
        'tech' => 'Market Analysis;Strategic Planning;Financial Modeling;Project Management',
        'soft' => 'Leadership;Negotiation;Critical Thinking;Decision Making',
        'sub'  => 'Economics;Marketing;Organizational Behavior;Accounting',
        'cert' => 'MBA;PMP;Six Sigma Green Belt'
    ],
    'Finance & Accounting' => [
        'tech' => 'Auditing;Tax Law;Financial Reporting;SAP/ERP;Excel Macros',
        'soft' => 'Integrity;Attention to Detail;Numerical Accuracy',
        'sub'  => 'Financial Accounting;Cost Accounting;Audit & Assurance;Taxation',
        'cert' => 'ICASL;ACCA;CIMA;Chartered Accountant'
    ],
    'Law & Legal Studies' => [
        'tech' => 'Legal Writing;Advocacy;Case Research;Mediation;Arbitration',
        'soft' => 'Persuasion;Logical Reasoning;Ethics;Interpersonal Skills',
        'sub'  => 'Constitutional Law;Criminal Law;Commercial Law;Human Rights',
        'cert' => 'Attorney-at-Law (Supreme Court SL);Notary License'
    ],
    'Creative Arts & Design' => [
        'tech' => 'Adobe Creative Suite;Sketching;Typography;User Research;Prototyping',
        'soft' => 'Creativity;Visual Communication;Client Management',
        'sub'  => 'Color Theory;Layout Design;Art History;Digital Media',
        'cert' => 'Adobe Certified Professional;Google UX Design Certificate'
    ],
    'Media & Communication' => [
        'tech' => 'Copywriting;Journalism Ethics;SEO;Video Editing;Public Speaking',
        'soft' => 'Storytelling;Confidence;Networking;Cultural Awareness',
        'sub'  => 'Mass Communication;Media Law;Public Relations;Digital Marketing',
        'cert' => 'Digital Marketing Professional;NCTI Journalism Cert'
    ],
    'Hospitality & Tourism' => [
        'tech' => 'Customer Service;Food Safety;Hospitality Management;Foreign Languages',
        'soft' => 'Hospitality;Cultural Intelligence;Multi-tasking',
        'sub'  => 'Hotel Operations;Tourism Management;Culinary Arts',
        'cert' => 'AHLEI Certification;WSET;Travel & Tourism Diploma'
    ],
    'Education & Teaching' => [
        'tech' => 'Lesson Planning;Classroom Management;Pedagogy;Educational Psychology',
        'soft' => 'Patience;Clarity;Mentorship;Encouragement',
        'sub'  => 'Curriculum Development;Learning Theories;Subject Specialization',
        'cert' => 'PGDE;TESL/TEFL;Qualified Teacher Status'
    ],
    'Logistics & Supply Chain' => [
        'tech' => 'Inventory Control;Warehouse Management;LSS;Procurement Systems',
        'soft' => 'Operational Efficiency;Planning;Problem Solving',
        'sub'  => 'Operations Management;Shipping & Logistics;Global Trade',
        'cert' => 'CILT;CPIM;CSCMP'
    ],
    'Construction & Architecture' => [
        'tech' => 'Blueprinting;Cost Estimation;Quantity Surveying;Health & Safety',
        'soft' => 'Spatial Awareness;Precision;Team Coordination',
        'sub'  => 'Building Science;Structural Design;Materials & Planning',
        'cert' => 'Chartered Architect;RICS;Chartered QS'
    ],
    'Skilled Trades & Vocational' => [
        'tech' => 'Technical Repair;Tool Handling;Safety Protocols;Troubleshooting',
        'soft' => 'Customer Interaction;Physical Stamina;Reliability',
        'sub'  => 'Technical Drawing;Workshop Practice;Apprenticeship',
        'cert' => 'NVQ Level 4;VTA Certificate;German Tech Diploma'
    ],
    'Agri-Tech & Sustainability' => [
        'tech' => 'Sustainable Farming;Environment Assessment;Bio-Systems;Data Collection',
        'soft' => 'Passion for Nature;Observation;Integrity',
        'sub'  => 'Soil Science;Crop Physiology;Eco-friendly Tech',
        'cert' => 'Green Consultant;Agri-Business Management Diploma'
    ],
    'Modern Finance' => [
        'tech' => 'Blockchain Protocols;Fintech Security;Digital Assets;Data Privacy',
        'soft' => 'Forward Thinking;Analytical Rigor;Ethics',
        'sub'  => 'Crypto-economics;Digital Banking;Network Finance',
        'cert' => 'Certified Blockchain Professional;Fintech Specialization'
    ],
];

$careers = [];
$id = 1;

foreach ($roles as $role => $category) {
    $meta = $categoryMetadata[$category] ?? [
        'tech' => 'Technical Skill A;Skill B;Skill C',
        'soft' => 'Communication;Leadership;Problem Solving',
        'sub'  => 'Subject A;Subject B;Subject C',
        'cert' => 'Professional Certification X'
    ];

    // Basic Metadata Mapping Logic
    $alStream = "Any";
    $minEdu = "A/L";
    $studyYears = 4;
    $difficulty = "Hard";
    $growth = "High";
    $remote = "Medium";
    $freelance = "Medium";
    $salaryEntry = 80000;
    $salaryFuture = "250,000-1,200,000";
    $tags = strtolower(str_replace([' ', '/', '&'], [';', ';', ''], $role)) . ";" . strtolower(str_replace([' ', '&'], [';', ''], $category));

    // Refine by Category
    if ($category === "Technology & IT") {
        $alStream = "Maths;Technology";
        $salaryEntry = 110000;
        $salaryFuture = "400,000-2,500,000";
        $remote = "Very High";
        $freelance = "Very High";
    } elseif ($category === "Engineering") {
        $alStream = "Maths";
        $salaryEntry = 75000;
        $salaryFuture = "200,000-1,500,000";
        $difficulty = "Hard";
    } elseif ($category === "Healthcare & Medical") {
        $alStream = "Biology";
        $studyYears = 5;
        $salaryEntry = 85000;
        $salaryFuture = "300,000-2,000,000";
        $difficulty = "Very Hard";
        $remote = "Low";
    } elseif ($category === "Finance & Accounting") {
        $alStream = "Commerce;Maths";
        $salaryEntry = 70000;
        $salaryFuture = "250,000-1,800,000";
    } elseif ($category === "Skilled Trades & Vocational") {
        $minEdu = "O/L";
        $studyYears = 1;
        $salaryEntry = 45000;
        $salaryFuture = "100,000-600,000";
        $difficulty = "Medium";
        $remote = "Low";
        $freelance = "Very High";
    } elseif ($category === "Education & Teaching") {
        $salaryEntry = 55000;
        $salaryFuture = "120,000-800,000";
        $studyYears = 3;
    }

    // Progression Logic Repairs
    $midRole = "Senior " . $role;
    $seniorRole = "Head of " . str_replace([" Engineer", " Specialist", " Analyst"], "", $role);
    if ($role === "Nurse") { $midRole = "Staff Nurse"; $seniorRole = "Nursing Director"; }
    if ($role === "Doctor / Physician") { $studyYears = 6; $salaryEntry = 95000; $midRole = "Senior Medical Officer"; $seniorRole = "Consultant"; }
    if ($role === "Attorney-at-Law") { $studyYears = 4; $difficulty = "Very Hard"; $midRole = "Senior Counsel"; $seniorRole = "Partner / Judge"; }
    if (strpos($role, "Specialist") !== false || strpos($role, "Architect") !== false) { $difficulty = "Very Hard"; }

    $careers[] = [
        $id++,
        $category,
        $role,
        $alStream,
        $minEdu,
        ($minEdu == "A/L" ? "BSc in " . str_replace(" / Physician", "", $role) : "None (Vocational Path)"),
        ($minEdu == "O/L" ? "NVQ Level 4 in " . $role : "External Diploma"),
        "Junior " . $role,
        $midRole,
        $seniorRole,
        $meta['tech'],
        $meta['soft'],
        $meta['sub'],
        $meta['cert'],
        $growth,
        "High",
        $salaryEntry,
        $salaryFuture,
        $remote,
        $freelance,
        "Low",
        "A specialized role as a " . $role . " within the " . $category . " sector in Sri Lanka.",
        $difficulty,
        $studyYears,
        "High",
        "High",
        ($minEdu == "A/L" ? "Degree" : "NVQ Level 3"),
        $tags
    ];
}

$header = [
    "id", "career_category", "career_name", "al_stream_required", "minimum_education_level", 
    "recommended_degree", "alternative_path", "entry_level_job", "mid_level_job", 
    "senior_level_job", "key_technical_skills", "recommended_soft_skills", 
    "typical_university_subjects", "certifications_or_extra_training", 
    "industry_growth_in_sri_lanka", "global_demand_level", "average_starting_salary_lkr", 
    "future_salary_range_lkr", "remote_work_possibility", "freelance_opportunity", 
    "automation_risk", "job_description",
    "career_difficulty", "study_duration_years", "local_job_availability", "international_opportunity", "recommended_first_step", "career_tags"
];

$fileDir = 'database/data/';
if (!is_dir($fileDir)) mkdir($fileDir, 0777, true);

$fp = fopen($fileDir . 'careers_master_dataset.csv', 'w');
fputcsv($fp, $header);
foreach ($careers as $career) {
    fputcsv($fp, $career);
}
fclose($fp);

copy($fileDir . 'careers_master_dataset.csv', '../careers_master_dataset.csv');
echo "Successfully generated FINAL careers_master_dataset.csv with " . count($careers) . " high-quality real roles.\n";
