"""create_v_leaderboard_view

Revision ID: 88ae01b42e04
Revises: 6c45d0b00441
Create Date: 2026-11-05 18:48:47.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '88ae01b42e04'
down_revision: Union[str, None] = '6c45d0b00441'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
    CREATE OR REPLACE VIEW v_leaderboard AS
    SELECT 
        r.id AS run_id,
        r.user_id,
        u.username,
        r.level_id,
        r.score,
        r.coins,
        r.enemies_stomped,
        r.deaths,
        r.duration_sec,
        r.difficulty_used,
        r.created_at
    FROM runs r
    JOIN users u ON r.user_id = u.id
    WHERE r.completed = true;
    """)


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS v_leaderboard;")
