import pandas as pd
import os

# Load dataset
csv_path = "database/data/careers_master_dataset.csv"
if not os.path.exists(csv_path):
    # Try alternate path if running from root
    csv_path = "Backend/database/data/careers_master_dataset.csv"

if not os.path.exists(csv_path):
    print(f"Error: Could not find {csv_path}")
    exit(1)

df = pd.read_csv(csv_path)

print("====================================")
print("EMY Career Dataset Validation Tool")
print("====================================\n")

total_rows = len(df)
print(f"Total Careers: {total_rows}")

# ---------------------------------
# 1. Missing Values Check
# ---------------------------------
print("\n[1] Missing Value Check")

missing = df.isnull().sum()
missing_fields = missing[missing > 0]

if missing_fields.empty:
    print("No missing values found.")
else:
    print("Missing values detected:")
    print(missing_fields)

# ---------------------------------
# 2. Duplicate Career Check
# ---------------------------------
print("\n[2] Duplicate Career Check")

duplicates = df[df.duplicated(subset=["career_name"], keep=False)]

if duplicates.empty:
    print("No duplicate careers.")
else:
    print("Duplicate careers found:")
    print(duplicates["career_name"].unique())

# ---------------------------------
# 3. Salary Validation
# ---------------------------------
print("\n[3] Salary Validation")

salary_errors = []

for index, row in df.iterrows():
    try:
        start_salary = int(row["average_starting_salary_lkr"])
        future_range = str(row["future_salary_range_lkr"]).replace(",", "").replace(" ", "").split("-")
        future_low = int(future_range[0])
        future_high = int(future_range[1])

        if start_salary < 40000 or start_salary > 400000: # Adjusted for High end
            salary_errors.append((row["career_name"], f"Unrealistic starting salary: {start_salary}"))

        if future_low > future_high:
            salary_errors.append((row["career_name"], f"Future salary range reversed: {row['future_salary_range_lkr']}"))

        if start_salary > future_low:
            salary_errors.append((row["career_name"], f"Starting salary ({start_salary}) higher than future low ({future_low})"))

    except Exception as e:
        salary_errors.append((row["career_name"], f"Invalid salary format or parsing error: {str(e)}"))

if len(salary_errors) == 0:
    print("Salary values look realistic.")
else:
    print(f"Found {len(salary_errors)} salary issues:")
    for error in salary_errors:
        print(f"{error[0]} -> {error[1]}")

# ---------------------------------
# 4. Enum Validation
# ---------------------------------
print("\n[4] Enum Field Validation")

valid_levels = ["Low", "Medium", "High", "Very High"]

enum_fields = [
    "industry_growth_in_sri_lanka",
    "global_demand_level",
    "automation_risk"
]

enum_found_errors = False
for field in enum_fields:
    invalid = df[~df[field].isin(valid_levels)]
    
    if not invalid.empty:
        enum_found_errors = True
        print(f"Invalid values in {field}:")
        print(invalid[[ "career_name", field ]])

if not enum_found_errors:
    print("Enum fields look valid.")

# ---------------------------------
# 5. Career Progression Check
# ---------------------------------
print("\n[5] Career Progression Validation")

progression_errors = []

for index, row in df.iterrows():
    if str(row["entry_level_job"]).strip() == str(row["mid_level_job"]).strip():
        progression_errors.append((row["career_name"], "Entry and mid job same"))

    if str(row["mid_level_job"]).strip() == str(row["senior_level_job"]).strip():
        progression_errors.append((row["career_name"], "Mid and senior job same"))

if len(progression_errors) == 0:
    print("Career progression looks valid.")
else:
    print(f"Found {len(progression_errors)} progression issues:")
    for error in progression_errors:
        print(f"{error[0]} -> {error[1]}")

# ---------------------------------
# 6. A/L Stream Compatibility Check
# ---------------------------------
print("\n[6] A/L Stream Compatibility")

stream_rules = {
    "Doctor": "Biology",
    "Engineer": "Maths",
    "Software Engineer": "Maths",
    "Accountant": "Commerce",
    "Lawyer": "Arts"
}

stream_errors = []

for index, row in df.iterrows():
    career = row["career_name"]
    stream = str(row["al_stream_required"])

    if "Lawyer" in career or "Judge" in career or "Legal" in career:
        continue # Law can be entered from any stream in SL

    for key, expected in stream_rules.items():
        if key in career:
            # Special case: Software Engineer can be Technology too
            if key == "Software Engineer" and ("Technology" in stream or "Any" in stream):
                continue
            if expected not in stream and "Any" not in stream and "Technology" not in stream:
                 stream_errors.append((career, f"Expected {expected} stream, got {stream}"))

if len(stream_errors) == 0:
    print("A/L stream compatibility looks good.")
else:
    print(f"Found {len(stream_errors)} stream issues:")
    for error in stream_errors:
        print(f"{error[0]} -> {error[1]}")

# ---------------------------------
# 7. Dataset Quality Score
# ---------------------------------
print("\n[7] Dataset Quality Score")

issues_count = (
    len(missing_fields) +
    len(duplicates) +
    len(salary_errors) +
    len(progression_errors) +
    len(stream_errors)
)

score = max(0, 100 - (issues_count * 2))

print(f"Dataset Quality Score: {score}%")
print(f"Total Issues Found: {issues_count}")

print("\nValidation Complete.")
