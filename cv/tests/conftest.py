from __future__ import annotations

import sys
from pathlib import Path

# Ensure the cv package is importable when running pytest from repo root.
CV_ROOT = Path(__file__).resolve().parents[2] / "cv"
if str(CV_ROOT) not in sys.path:
    sys.path.insert(0, str(CV_ROOT))
