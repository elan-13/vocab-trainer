"""unique index on lower word and language

Revision ID: f92f0da686c5
Revises: 6cf43715d759
Create Date: 2026-10-11 00:42:22.118871

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f92f0da686c5'
down_revision: Union[str, Sequence[str], None] = '6cf43715d759'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE UNIQUE INDEX uix_word_language ON words (lower(word), language)")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP INDEX uix_word_language")
