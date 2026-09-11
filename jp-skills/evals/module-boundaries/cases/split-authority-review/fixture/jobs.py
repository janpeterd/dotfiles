from dataclasses import dataclass

@dataclass
class Job:
    id: str
    phase: str = "running"
    accepted_result: str | None = None

class Results:
    def __init__(self, jobs):
        self.jobs = jobs
        self.messages = []

    def accept(self, job_id, result):
        job = self.jobs[job_id]
        if job.accepted_result is None:
            job.accepted_result = result
            job.phase = "succeeded"
            self.messages.append((job_id, "result", result))
        elif job.accepted_result != result:
            raise ValueError("conflicting result")
        return job.accepted_result

class Cancellation:
    def __init__(self, jobs):
        self.jobs = jobs
        self.messages = []

    def cancel(self, job_id):
        job = self.jobs[job_id]
        if job.phase != "cancelled":
            job.phase = "cancelled"
            self.messages.append((job_id, "cancelled"))
        return job.phase

class Service:
    def __init__(self):
        self.jobs = {}
        self.results = Results(self.jobs)
        self.cancellation = Cancellation(self.jobs)

    def start(self, job_id):
        self.jobs[job_id] = Job(job_id)

    def inspect(self, job_id):
        job = self.jobs[job_id]
        return {"phase": job.phase, "result": job.accepted_result}
