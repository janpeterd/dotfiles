"""Calendar boundaries belong to Brussels, regardless of the machine timezone."""
import calendar
import json
import math
import sys
from datetime import date, datetime
from zoneinfo import ZoneInfo

BRUSSELS = ZoneInfo("Europe/Brussels")


def format_minutes(minutes):
    if minutes == 0:
        return "Over"
    return f"{minutes // 60}h {minutes % 60}m" if minutes >= 60 else f"{minutes} min"


def format_calendar_remaining(now, end):
    if now >= end:
        return "Over"
    start, finish = now.date(), end.date()
    months = (finish.year - start.year) * 12 + finish.month - start.month

    def shifted(count):
        year, month = divmod(start.year * 12 + start.month - 1 + count, 12)
        month += 1
        return date(year, month, min(start.day, calendar.monthrange(year, month)[1]))

    if shifted(months) > finish:
        months -= 1
    days = (finish - shifted(months)).days
    years, months = divmod(months, 12)
    parts = [f"{value}{unit}" for value, unit in [(years, "y"), (months, "mo"), (days, "d")] if value]
    return " ".join(parts) + " left"


def snapshot(now=None, birth_date=""):
    now = (now or datetime.now(BRUSSELS)).astimezone(BRUSSELS)

    def at(year, month, day, hour=0, minute=0):
        return datetime(year, month, day, hour, minute, tzinfo=BRUSSELS)

    def row(title, start, end, detail, unit="min"):
        remaining = max(0, end.timestamp() - now.timestamp())
        progress = min(1, max(0, (now.timestamp() - start.timestamp()) /
                              (end.timestamp() - start.timestamp())))
        if unit == "min":
            count = math.ceil(remaining / 60)
            label = format_minutes(count) + (" left" if count else "")
        else:
            label = format_calendar_remaining(now, end)
        return dict(title=title, progress=progress, detail=detail, remaining=label)

    start = at(now.year, now.month, now.day, 6)
    finish = at(now.year, now.month, now.day, 17)
    bed = at(now.year, now.month, now.day, 23, 30)
    evening = now >= finish
    target = bed if evening else finish
    rows = [row("Workday", start, finish, "06:00 to 17:00"),
            row("Until bed", start, bed, "06:00 to 23:30"),
            row(str(now.year), at(now.year, 1, 1), at(now.year + 1, 1, 1),
                "January 1 to December 31", "days")]
    try:
        birth = date.fromisoformat(birth_date)
        if birth > now.date():
            raise ValueError("Birth date is in the future")
        last_day = calendar.monthrange(birth.year + 90, birth.month)[1]
        end = at(birth.year + 90, birth.month, min(birth.day, last_day))
        rows.append(row("Life", at(birth.year, birth.month, birth.day), end,
                        "Assuming 90 years", "days"))
    except ValueError:
        rows.append(dict(title="Life", progress=None, remaining="Birth date needed",
                         detail="Set YYYY-MM-DD in plugin settings. Assumes 90 years."))
    minutes = max(0, math.ceil((target.timestamp() - now.timestamp()) / 60))
    return dict(mode="bed" if evening else "work", minutes=minutes,
                label=format_minutes(minutes), rows=rows)


if __name__ == "__main__":
    print(json.dumps(snapshot(birth_date=sys.argv[1] if len(sys.argv) > 1 else "")))
