import json
from datetime import date, timedelta
import random

BASE_DATE = date.today()
NUM_DAYS = 30


def iso_date(d):
    return d.isoformat()


def generate_weights():
    weights = []
    base = 78.0
    for i in range(NUM_DAYS):
        d = BASE_DATE - timedelta(days=NUM_DAYS - 1 - i)
        # simulate a downward trend with small daily fluctuation
        noise = random.uniform(-0.2, 0.2)
        base = max(68, base + noise - 0.05)
        weights.append({"date": iso_date(d), "val": round(base, 1)})
    return weights


def generate_bodycomp(weights):
    bodycomp = []
    bf = 24.0
    for i, w in enumerate(weights[::3]):
        d = parse_date(w["date"])
        bf = max(16.5, bf - random.uniform(0.2, 0.4))
        fat_mass = round(w["val"] * (bf / 100), 1)
        lean_mass = round(w["val"] - fat_mass, 1)
        bodycomp.append({
            "date": iso_date(d),
            "bf": round(bf, 1),
            "waist": round(90 - i * 0.5 + random.uniform(-0.5, 0.5), 1),
            "neck": round(39 + random.uniform(-0.2, 0.2), 1),
            "hip": round(100 + random.uniform(-0.3, 0.3), 1),
            "leanMass": lean_mass,
            "fatMass": fat_mass,
            "weight": w["val"],
            "method": "navy"
        })
    return bodycomp


def parse_date(s):
    return date.fromisoformat(s)


def generate_circumference():
    circ = []
    waist = 90.0
    hips = 100.0
    chest = 98.0
    shoulders = 110.0
    bicep_l = 32.0
    bicep_r = 32.5
    forearm_l = 28.0
    forearm_r = 28.0
    thigh_l = 55.0
    thigh_r = 55.5
    calf_l = 36.0
    calf_r = 36.0

    for i in range(10):
        d = BASE_DATE - timedelta(days=(NUM_DAYS - 1 - i * 3))
        waist = round(max(82, waist - random.uniform(0.4, 0.9)), 1)
        hips = round(max(92, hips - random.uniform(0.3, 0.7)), 1)
        chest = round(chest + random.uniform(0.1, 0.4), 1)
        shoulders = round(shoulders + random.uniform(0.2, 0.5), 1)
        bicep_l = round(bicep_l + random.uniform(0.1, 0.3), 1)
        bicep_r = round(bicep_r + random.uniform(0.1, 0.3), 1)
        forearm_l = round(forearm_l + random.uniform(0.05, 0.2), 1)
        forearm_r = round(forearm_r + random.uniform(0.05, 0.2), 1)
        thigh_l = round(thigh_l + random.uniform(0.2, 0.6), 1)
        thigh_r = round(thigh_r + random.uniform(0.2, 0.6), 1)
        calf_l = round(calf_l + random.uniform(0.1, 0.3), 1)
        calf_r = round(calf_r + random.uniform(0.1, 0.3), 1)

        circ.append({
            "date": iso_date(d),
            "chest": chest,
            "shoulders": shoulders,
            "bicep-l": bicep_l,
            "bicep-r": bicep_r,
            "forearm-l": forearm_l,
            "forearm-r": forearm_r,
            "thigh-l": thigh_l,
            "thigh-r": thigh_r,
            "calf-l": calf_l,
            "calf-r": calf_r,
            "waist": waist,
            "hips": hips
        })
    return circ


def generate_sessions(weights):
    sessions = []
    pr_map = {}
    movement_options = [
        ("Dumbbell Goblet Squat", [80, 82.5, 85, 87.5, 90]),
        ("Standing Calf Raises", [25, 26, 27, 28, 29]),
        ("DB Pullover", [22.5, 24, 25, 26, 27]),
        ("Barbell Floor Press", [60, 62.5, 65, 67.5, 70]),
        ("DB Bent-Over Row", [32.5, 35, 37.5, 40, 42.5]),
        ("BB Overhead Press", [40, 42.5, 45, 47.5, 50]),
        ("DB Lateral Raises", [10, 11, 12, 13, 14]),
        ("BB Glute Bridges", [80, 85, 90, 95, 100]),
        ("BB / DB Bicep Curls", [25, 27.5, 30, 32.5, 35]),
        ("DB Floor Skullcrushers", [20, 22.5, 25, 27.5, 30]),
        ("DB Reverse Flyes", [10, 11, 12, 13, 14])
    ]

    for i in range(10):
        d = BASE_DATE - timedelta(days=(NUM_DAYS - 1 - i * 3))
        ex_count = random.randint(6, 9)
        selected = random.sample(movement_options, ex_count)
        exercises = {}
        total_volume = 0
        for idx, (name, weights_list) in enumerate(selected, start=1):
            weight = random.choice(weights_list)
            reps = random.choice([8, 10, 12])
            set_count = random.choice([3, 4])
            for s in range(1, set_count + 1):
                exercises[f"{name}-{s}"] = f"{weight}x{reps}"
            total_volume += weight * reps * set_count
            pr_map[name] = max(pr_map.get(name, 0), weight)

        duration = random.randint(35, 65)
        calories = random.randint(280, 520)
        sessions.append({
            "date": iso_date(d),
            "notes": "Solid training session with good tempo and control.",
            "durationSecs": duration * 60,
            "caloriesBurned": calories,
            "setsCompleted": sum(int(k.split('-')[-1]) for k in exercises.keys()) if exercises else 0,
            "volumeKg": round(total_volume),
            "exercises": exercises,
            "id": int(d.strftime('%Y%m%d'))
        })

    return sessions, pr_map


def generate_prs(pr_map):
    return {name: {"weight": weight, "date": iso_date(BASE_DATE - timedelta(days=random.randint(0, 10))) } for name, weight in pr_map.items()}


def make_backup():
    weights = generate_weights()
    bodycomp = generate_bodycomp(weights)
    circ = generate_circumference()
    sessions, pr_map = generate_sessions(weights)
    prer = generate_prs(pr_map)

    data = {
        "fitdash_weights": json.dumps(weights),
        "fitdash_bodycomp": json.dumps(bodycomp),
        "fitdash_circ": json.dumps(circ),
        "fitdash_sessions": json.dumps(sessions),
        "fitdash_prs": json.dumps(prer)
    }

    with open('fitdash_backup_mock_30days.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    print('Generated fitdash_backup_mock_30days.json with keys:')
    for key in data:
        print(' -', key)


if __name__ == '__main__':
    make_backup()
