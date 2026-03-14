<?php

$vocationalRows = [
    "2000,O/L Completed,Alternative,NVQ Level 4 in Automobile Mechanic,Auto & Mechanical Trades,Junior Mechanic,Senior Technician,Workshop Manager,Mechanical aptitude;Troubleshooting;Hand tools,Problem Solving;Attention to Detail,N/A,CGTTI Certificates;Brand Specific Training,High,Medium,45000,100000-250000,No,High,Medium,\"Repairing and maintaining vehicles and vehicle systems.\"",
    "2001,O/L Completed,Alternative,NVQ Level 4 in Information Technology,IT & Computer Trades,IT Support Assistant,System Administrator,IT Manager,Hardware Troubleshooting;Networking;OS Installation,Customer Service;Problem Solving,N/A,CompTIA A+;CISCO CCNA,Very High,High,50000,120000-300000,Yes,High,Low,\"Providing technical support, maintaining computer systems and networks.\"",
    "2002,O/L Completed,Alternative,NVQ Level 4 in Professional Cookery,Hospitality & Cookery,Commis Chef,Chef de Partie,Executive Chef,Food Preparation;Hygiene Standards;Time Management,Teamwork;Creativity;Stamina,N/A,SLITHM Diploma;Food Safety Level 3,High,Very High,55000,150000-400000,No,Medium,Low,\"Preparing meals, designing menus, and managing kitchen operations.\"",
    "2003,O/L Completed,Alternative,NVQ Level 4 in Construction Technology,Construction & Civil,Site Assistant,Site Supervisor,Construction Manager,Blueprint Reading;Material Estimation;Safety Standards,Leadership;Problem Solving,N/A,NCT Civil;OSHA Safety,High,Medium,50000,120000-350000,No,Medium,Low,\"Overseeing construction sites, ensuring safety and managing resources.\"",
    "2004,O/L Completed,Alternative,NVQ Level 4 in Agriculture,Agriculture & Livestock,Farm Assistant,Farm Supervisor,Farm Manager,Crop Management;Animal Husbandry;Pest Control,Hard work;Adaptability,N/A,NAITA Agriculture Certificate,Medium,Medium,40000,80000-200000,No,Medium,Low,\"Managing crops and livestock, ensuring optimal yield and farm health.\"",
    "2005,O/L Completed,Alternative,NVQ Level 4 in Hair Stylist & Beautician,Hair & Beauty,Junior Beautician,Senior Stylist,Salon Owner,Haircutting;Makeup Application;Skincare,Customer Service;Creativity,N/A,VTA Certificate;International Beauty Diplomas,High,High,45000,100000-300000,No,Very High,Low,\"Providing hair, beauty, and grooming services to clients.\""
];

$paths = [
    __DIR__ . '/../career_guidance_dataset.csv',
    __DIR__ . '/database/data/career_guidance_dataset.csv'
];

foreach ($paths as $path) {
    if (!file_exists($path)) {
        echo "Path not found: $path\n";
        continue;
    }

    // Read the file content
    $content = file_get_contents($path);
    $lines = explode("\n", str_replace("\r\n", "\n", $content));

    // Remove any previous buggy attempts (rows starting with 2000-2005)
    $cleanLines = array_filter($lines, function($line) {
        $trimmed = trim($line);
        if (empty($trimmed)) return false;
        $id = explode(',', $trimmed)[0];
        return !in_array($id, ["2000", "2001", "2002", "2003", "2004", "2005"]);
    });

    // Re-assemble and append new rows
    $newContent = implode("\n", array_map('trim', $cleanLines)) . "\n" . implode("\n", $vocationalRows) . "\n";
    
    file_put_contents($path, $newContent);
    echo "Successfully updated $path\n";
}
