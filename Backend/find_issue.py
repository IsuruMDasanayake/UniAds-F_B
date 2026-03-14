import pandas as pd

df = pd.read_csv("database/data/careers_master_dataset.csv")

# Missing values check
missing = df.isnull().sum()
if missing.any():
    print(f"Missing values found:\n{missing[missing > 0]}")
    # Find which rows have nulls
    null_rows = df[df.isnull().any(axis=1)]
    print(f"Null rows: {null_rows['career_name'].tolist()}")

# Empty string check for strings
for col in df.select_dtypes(include=['object']):
    empty = df[df[col] == ""]
    if not empty.empty:
        print(f"Empty strings in {col} for {empty['career_name'].tolist()}")

# Duplicate check
dupes = df[df.duplicated(subset=["career_name"])]
if not dupes.empty:
    print(f"Duplicate found: {dupes['career_name'].tolist()}")

# Salary check
for index, row in df.iterrows():
    try:
        start_salary = int(row["average_starting_salary_lkr"])
        future_range = str(row["future_salary_range_lkr"]).replace(",", "").replace(" ", "").split("-")
        future_low = int(future_range[0])
        future_high = int(future_range[1])
        if start_salary < 40000 or start_salary > 400000:
            print(f"Salary issue in {row['career_name']}: {start_salary}")
        if future_low > future_high or start_salary > future_low:
            print(f"Salary range issue in {row['career_name']}")
    except:
        print(f"Salary format issue in {row['career_name']}")

# Progression check
for index, row in df.iterrows():
    if str(row["entry_level_job"]).strip() == str(row["mid_level_job"]).strip():
        print(f"Progression issue (entry=mid) in {row['career_name']}")
    if str(row["mid_level_job"]).strip() == str(row["senior_level_job"]).strip():
        print(f"Progression issue (mid=senior) in {row['career_name']}")

# Stream check
stream_rules = {"Doctor": "Biology", "Engineer": "Maths", "Software Engineer": "Maths", "Accountant": "Commerce", "Lawyer": "Arts"}
for index, row in df.iterrows():
    career = row["career_name"]
    stream = str(row["al_stream_required"])
    if "Lawyer" in career or "Judge" in career or "Legal" in career: continue
    for key, expected in stream_rules.items():
        if key in career:
            if key == "Software Engineer" and ("Technology" in stream or "Any" in stream): continue
            if expected not in stream and "Any" not in stream and "Technology" not in stream:
                print(f"Stream issue in {career}: expected {expected}, got {stream}")

# Enum check
valid_levels = ["Low", "Medium", "High", "Very High"]
for field in ["industry_growth_in_sri_lanka", "global_demand_level", "automation_risk"]:
    invalid = df[~df[field].isin(valid_levels)]
    if not invalid.empty:
        print(f"Enum issue in {field} for {invalid['career_name'].tolist()}")
