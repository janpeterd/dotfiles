import os
import sys
sys.path.insert(0, os.environ["EVAL_WORKSPACE"])
from formatting import format_count
for count in (0, 1, 2, 17):
    assert format_count(count) == f"{count} {'job' if count == 1 else 'jobs'}"
