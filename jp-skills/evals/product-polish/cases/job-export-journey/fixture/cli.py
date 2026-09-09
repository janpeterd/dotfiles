import argparse

from jobs import Job, export_job


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description="Download a task report")
    result.add_argument("job_id", help="Task ID")
    result.add_argument("--status", default="queued")
    return result


def main(argv: list[str] | None = None) -> int:
    arguments = parser().parse_args(argv)
    try:
        print(export_job(Job(arguments.job_id, arguments.status)))
    except ValueError:
        print("Something went wrong. Please try again.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
