import requests
import base64
import json
import os
import sys

BASE_URL = "http://localhost:8000"


def load_image(path: str) -> dict:
    with open(path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("utf-8")
    ext = path.split(".")[-1].lower()
    type_map = {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "pdf": "application/pdf"
    }
    return {
        "file_base64": data,
        "file_name": os.path.basename(path),
        "file_type": type_map.get(ext, "image/png")
    }

# ─────────────────────────────
# TEST 1 — health check
# ─────────────────────────────
def test_health():
    print("TEST 1 — health check")
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    print("  ✓ server is running\n")

# ─────────────────────────────
# TEST 2 — empty files array
# ─────────────────────────────
def test_empty_files():
    print("TEST 2 — empty files array")
    res = requests.post(f"{BASE_URL}/api/analyze", json={"files": []})
    assert res.status_code == 400
    print(f"  ✓ correctly rejected with 400: {res.json()['detail']}\n")

# ─────────────────────────────
# TEST 3 — unsupported file type
# ─────────────────────────────
def test_bad_file_type():
    print("TEST 3 — unsupported file type")
    payload = {
        "files": [{
            "file_base64": "aGVsbG8=",
            "file_name": "drawing.bmp",
            "file_type": "image/bmp"
        }]
    }
    res = requests.post(f"{BASE_URL}/api/analyze", json=payload)
    assert res.status_code == 400
    print(f"  ✓ correctly rejected with 400: {res.json()['detail']}\n")

# ─────────────────────────────
# TEST 4 — too many files
# ─────────────────────────────
def test_too_many_files():
    print("TEST 4 — too many files (11)")
    fake_file = {
        "file_base64": "aGVsbG8=",
        "file_name": "drawing.png",
        "file_type": "image/png"
    }
    payload = {"files": [fake_file] * 11}
    res = requests.post(f"{BASE_URL}/api/analyze", json=payload)
    assert res.status_code == 400
    print(f"  ✓ correctly rejected with 400: {res.json()['detail']}\n")

# ─────────────────────────────
# TEST 5 — real drawing (needs actual image)
# ─────────────────────────────
def test_real_drawing(image_path: str):
    print(f"TEST 5 — real drawing: {image_path}")

    if not os.path.exists(image_path):
        print(f"  ⚠ skipped — file not found: {image_path}\n")
        return

    payload = {"files": [load_image(image_path)]}
    print("  sending to Claude...")

    res = requests.post(f"{BASE_URL}/api/analyze", json=payload, timeout=120)

    if res.status_code != 200:
        print(f"  ✗ failed with {res.status_code}: {res.text}\n")
        return

    data = res.json()

    # check structure — single report format
    assert "phase_1_output" in data, "missing phase_1_output"
    assert "phase_2_analysis" in data, "missing phase_2_analysis"
    assert "quality_scores" in data["phase_2_analysis"], "missing quality_scores"
    assert "issues" in data["phase_2_analysis"], "missing issues"
    assert "summary" in data["phase_2_analysis"], "missing summary"
    assert "file_names" in data, "missing file_names"

    print(f"  ✓ report received")
    print(f"  ✓ files analyzed: {data['file_names']}")
    print(f"  ✓ drawing type: {data['phase_1_output']['drawing_type']}")
    print(f"  ✓ issues found: {data['phase_2_analysis']['summary']['total_issues']}")
    print(f"  ✓ verdict: {data['phase_2_analysis']['summary']['recommendation']}")
    print(f"  ✓ overall score: {data['phase_2_analysis']['quality_scores']['overall']}")
    print()
    print("  full report:")
    print(json.dumps(data, indent=2))

# ─────────────────────────────
# RUN ALL TESTS
# ─────────────────────────────
if __name__ == "__main__":
    image_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "drawing_test.png")

    print("=" * 50)
    print("DRAWING REVIEWER — BACKEND TESTS")
    print("=" * 50 + "\n")

    test_health()
    test_empty_files()
    test_bad_file_type()
    test_too_many_files()
    test_real_drawing(image_path)

    print("=" * 50)
    print("ALL TESTS DONE")
    print("=" * 50)