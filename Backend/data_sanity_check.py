import csv

print("Running Data Sanity Check on careers_master_dataset.csv...")

issues_found = 0

with open(r'd:\UniAds-F_B\Backend\database\data\careers_master_dataset.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row.get('career_name', '')
        deg = row.get('recommended_degree', '')
        tags = row.get('career_tags', '')
        
        # Check for fake degree names
        if 'Degree in ' + name in deg:
            print(f"[WARNING - Fake Degree]: {name} -> {deg}")
            issues_found += 1
            
        # Check for double semicolons in tags
        if ';;' in tags:
            print(f"[WARNING - Double Semicolon in Tag]: {name} -> {tags}")
            issues_found += 1
            
        # Check for empty recommendations
        if not deg.strip():
            print(f"[WARNING - Empty Degree]: {name}")
            issues_found += 1

if issues_found == 0:
    print("All checks passed. No issues found in data formatting!")
else:
    print(f"Total issues found: {issues_found}")
