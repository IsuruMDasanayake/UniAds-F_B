import csv
import collections
import os

def main():
    base_path = r"d:\UniAds-F_B\Backend"
    csv_path = os.path.join(base_path, "database", "data", "careers_master_dataset.csv")

    d = collections.defaultdict(list)
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            title = row.get('career_name', '').strip()
            cat = row.get('career_category', '').strip()
            if title and cat:
                d[cat].append(title)
                
    php_code = "            $fieldDictionary = [\n"
    for cat, titles in d.items():
        php_code += f"                '{cat}' => [\n"
        php_code += "                    '" + "', '".join(titles) + "',\n"
        php_code += "                ],\n"
    php_code += "            ];\n"
    
    with open(os.path.join(base_path, "generated_php_dictionary.txt"), 'w', encoding='utf-8') as f:
        f.write(php_code)
        
    print("Generated dictionary at generated_php_dictionary.txt")

if __name__ == "__main__":
    main()
