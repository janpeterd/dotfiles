revision = "20260830_r0001"
down_revision = None


def upgrade(database) -> None:
    database.create_jobs_table()


def downgrade(database) -> None:
    database.drop_jobs_table()
