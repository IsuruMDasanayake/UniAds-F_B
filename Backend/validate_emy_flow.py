import csv
import re
import os
import sys

def extract_php_array(filepath, array_name_regex, is_multidimensional=False):
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        return {}
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    match = re.search(array_name_regex, content, re.DOTALL)
    if not match:
        return {}
    array_content = match.group(1)
    result = {}
    if is_multidimensional:
        pattern = r"'(.*?)'\s*=>\s*\[(.*?)\]"
        matches = re.finditer(pattern, array_content, re.DOTALL)
        for m in matches:
            key = m.group(1)
            values_str = m.group(2)
            elements = re.findall(r"'(.*?)'", values_str)
            result[key] = elements
    else:
        pattern = r"'(.*?)'\s*=>\s*'(.*?)'"
        matches = re.finditer(pattern, array_content)
        for m in matches:
            result[m.group(1)] = m.group(2)
    return result

def main():
    report_path = r"d:\UniAds-F_B\Backend\validation_report_internal.txt"
    sys.stdout = open(report_path, 'w', encoding='utf-8')
    
    print("="*60)
    print("EMY Flow Static Analyzer")
    print("="*60)

    base_path = r"d:\UniAds-F_B\Backend"
    csv_path = os.path.join(base_path, "database", "data", "careers_master_dataset.csv")
    controller_path = os.path.join(base_path, "app", "Http", "Controllers", "Api", "AiAdvisorController.php")
    mapper_path = os.path.join(base_path, "app", "Services", "CareerAliasMapper.php")

    # 1. Parse CSV
    print("\n[1] Parsing careers_master_dataset.csv...")
    csv_careers = {}
    csv_categories = set()
    missing_courses = []
    
    print(f"  [DEBUG] CSV Path: {csv_path}")
    if not os.path.exists(csv_path):
        print("  [ERROR] CSV File does not exist!")

    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            print(f"  [DEBUG] Reader found {len(rows)} raw rows.")
            for row in rows:
                career_id = row.get('id', 'Unknown')
                title = row.get('career_name', '').strip()
                category = row.get('career_category', '').strip()
                course = row.get('recommended_degree', '').strip()
                
                if title:
                    csv_careers[title] = {
                        'id': career_id,
                        'category': category
                    }
                    csv_categories.add(category)
                if not course:
                    missing_courses.append((career_id, title))
        print(f"  -> Found {len(csv_careers)} unique careers across {len(csv_categories)} categories.")
    except Exception as e:
        print(f"Error reading CSV: {e}")
        import traceback
        traceback.print_exc()
        return

    # 2. Parse field dictionary from Controller
    print("\n[2] Parsing AiAdvisorController.php for field dictionaries...")
    field_dict_regex = r"\$fieldDictionary\s*=\s*\[(.*?)\];\s*// ──"
    field_dict = extract_php_array(controller_path, field_dict_regex, is_multidimensional=True)
    
    dict_titles = set()
    for cat, titles in field_dict.items():
        dict_titles.update(titles)
    
    print(f"  -> Found {len(field_dict)} main categories and {len(dict_titles)} recognized career roles.")

    # 3. Parse Alias Mapper
    print("\n[3] Parsing CareerAliasMapper.php for alias map...")
    alias_map_regex = r"\$aliasMap\s*=\s*\[(.*?)\];"
    alias_map = extract_php_array(mapper_path, alias_map_regex, is_multidimensional=False)
    print(f"  -> Found {len(alias_map)} aliases mapped to {len(set(alias_map.values()))} unique standard titles.")

    errors = False

    print("\n" + "="*60)
    print("VALIDATION REPORT")
    print("="*60)

    print("\n[Check 1] Unreachable Careers (In CSV but missing from $fieldDictionary)")
    unreachable = set(csv_careers.keys()) - dict_titles
    if unreachable:
        errors = True
        for cr in sorted(unreachable):
            print(f"  [WARNING] '{cr}' is in the CSV (ID: {csv_careers[cr]['id']}) but not mapped in AiAdvisorController.php!")
    else:
        print("  [SUCCESS] All CSV careers are mapped in the controller Dictionary.")

    print("\n[Check 2] Phantom References (In $fieldDictionary but missing from CSV)")
    phantom_dict = dict_titles - set(csv_careers.keys())
    if phantom_dict:
        errors = True
        for cr in sorted(phantom_dict):
            print(f"  [ERROR] '{cr}' is listed in AiAdvisorController.php but doesn't exist in the CSV!")
    else:
        print("  [SUCCESS] All dictionary mappings point to existing CSV careers.")

    print("\n[Check 3] Broken Alias Mappings (Map to titles not in CSV/Dictionary)")
    broken_aliases = []
    for alias, target in alias_map.items():
        if target not in csv_careers and target not in dict_titles:
            broken_aliases.append((alias, target))
    
    if broken_aliases:
        errors = True
        for alias, target in broken_aliases:
            print(f"  [ERROR] Alias '{alias}' -> targets '{target}', which does NOT exist!")
    else:
        print("  [SUCCESS] All aliases resolve to valid standard titles.")

    print("\n[Check 4] Data Completeness (Missing recommended degrees/courses)")
    if missing_courses:
        errors = True
        for cr_id, title in missing_courses:
            print(f"  [WARNING] '{title}' (ID: {cr_id}) has an empty 'recommended_degree_or_course' field!")
    else:
        print("  [SUCCESS] All careers have a recommended degree or course.")

    print("\n[Check 5] Category Alignment")
    dict_cats = set(field_dict.keys())
    missing_cats = csv_categories - dict_cats
    if missing_cats:
        errors = True
        for cat in missing_cats:
            print(f"  [ERROR] Career category '{cat}' from CSV is missing in $fieldDictionary!")
    else:
        print("  [SUCCESS] All CSV categories are defined in the controller.")

    print("\n" + "="*60)
    if not errors:
        print("[OK] ALL TESTS PASSED! The AI Advisor routing logic is perfectly aligned with the dataset.")
    else:
        print("[FAIL] ERRORS DETECTED. Please review the warnings and errors above before production.")
        
    sys.stdout.close()

if __name__ == "__main__":
    main()
