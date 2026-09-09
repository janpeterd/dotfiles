# Requested behavior

Evaluate every incoming topic against the configured sensors. Policy changes must atomically update policy, reconcile monitoring state, and append an audit event. Deliver each queued alert at most once and retain failed delivery details.
