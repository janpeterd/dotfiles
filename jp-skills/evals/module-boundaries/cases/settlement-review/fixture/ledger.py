"""In-memory SQLite settlement journal used by the service and its audit view."""
import sqlite3
from dataclasses import dataclass


@dataclass(frozen=True)
class Receipt:
    transfer_id: str
    source: str
    destination: str
    amount: int
    owner_epoch: int


class Ledger:
    def __init__(self):
        self.db = sqlite3.connect(":memory:")
        self.db.executescript("""
            CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER NOT NULL);
            CREATE TABLE control (epoch INTEGER NOT NULL);
            INSERT INTO control VALUES (1);
            CREATE TABLE receipts (
                transfer_id TEXT PRIMARY KEY,
                source TEXT NOT NULL, destination TEXT NOT NULL,
                amount INTEGER NOT NULL, owner_epoch INTEGER NOT NULL
            );
        """)

    def open_account(self, name, balance):
        if balance < 0:
            raise ValueError("negative opening balance")
        with self.db:
            self.db.execute("INSERT INTO accounts VALUES (?, ?)", (name, balance))

    def replace_owner(self):
        with self.db:
            self.db.execute("UPDATE control SET epoch = epoch + 1")
        return self.db.execute("SELECT epoch FROM control").fetchone()[0]

    def balances(self):
        return dict(self.db.execute("SELECT name, balance FROM accounts ORDER BY name"))

    def receipt(self, transfer_id):
        row = self.db.execute("SELECT * FROM receipts WHERE transfer_id = ?", (transfer_id,)).fetchone()
        return Receipt(*row) if row else None

    def receipts(self):
        return tuple(Receipt(*r) for r in self.db.execute("SELECT * FROM receipts ORDER BY transfer_id"))

    def settle(self, receipt):
        return self.settle_many([receipt])[0]

    def settle_many(self, receipts):
        accepted = []
        with self.db:
            for receipt in receipts:
                existing = ReceiptChecks(self).check(receipt)
                if existing is not None:
                    accepted.append(existing)
                    continue
                AccountWrites(self.db).debit(receipt)
                AccountWrites(self.db).credit(receipt)
                ReceiptWrites(self.db).record(receipt)
                accepted.append(receipt)
        return tuple(accepted)


class ReceiptChecks:
    def __init__(self, ledger):
        self.db = ledger.db
        self.receipt = ledger.receipt

    def check(self, receipt):
        epoch = self.db.execute("SELECT epoch FROM control").fetchone()[0]
        if receipt.owner_epoch != epoch:
            raise ValueError("stale owner")
        old = self.receipt(receipt.transfer_id)
        if old is not None:
            if old != receipt:
                raise ValueError("conflicting receipt")
            return old
        if not receipt.transfer_id:
            raise ValueError("empty transfer id")
        if type(receipt.amount) is not int or receipt.amount <= 0:
            raise ValueError("amount must be a positive integer")
        if receipt.source == receipt.destination:
            raise ValueError("same account")
        source = self.db.execute("SELECT balance FROM accounts WHERE name = ?", (receipt.source,)).fetchone()
        destination = self.db.execute("SELECT balance FROM accounts WHERE name = ?", (receipt.destination,)).fetchone()
        if source is None or destination is None:
            raise ValueError("unknown account")
        if source[0] < receipt.amount:
            raise ValueError("insufficient funds")

        return None


class AccountWrites:
    def __init__(self, db):
        self.db = db

    def debit(self, receipt):
        self.db.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", (receipt.amount, receipt.source))

    def credit(self, receipt):
        self.db.execute("UPDATE accounts SET balance = balance + ? WHERE name = ?", (receipt.amount, receipt.destination))


class ReceiptWrites:
    def __init__(self, db):
        self.db = db

    def record(self, receipt):
        self.db.execute("INSERT INTO receipts VALUES (?, ?, ?, ?, ?)",
                        (receipt.transfer_id, receipt.source, receipt.destination, receipt.amount, receipt.owner_epoch))
