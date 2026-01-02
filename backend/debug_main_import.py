
import sys
import traceback

with open("error_log.txt", "w", encoding="utf-8") as f:
    try:
        f.write("Attempting to import app.main...\n")
        from app.main import app
        f.write("Successfully imported app.main\n")
    except Exception:
        f.write("Failed to import app.main\n")
        traceback.print_exc(file=f)
