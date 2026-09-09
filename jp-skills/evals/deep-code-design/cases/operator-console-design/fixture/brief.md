# Incident console

Operators need to notice a failed workflow, understand the cause, assign an owner, retry it safely, and see whether the retry recovered. Today these facts are split between a run table, logs, chat notifications, and an audit database.

The first release is for one operations team. It needs a list of active incidents, incident detail, assignment, acknowledgment, retry, and an immutable action history. Retries may be delivered more than once. Notifications can fail independently. Future teams and notification providers are possibilities, not current requirements.
