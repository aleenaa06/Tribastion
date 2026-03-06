import traceback

try:
    import test_patch
except Exception:
    with open("err.txt", "w", encoding="utf-8") as f:
        traceback.print_exc(file=f)
