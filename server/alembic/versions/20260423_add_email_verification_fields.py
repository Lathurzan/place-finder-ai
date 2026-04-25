"""
Revision ID: 20260423_add_email_verification_fields
Revises: 
Create Date: 2026-04-23
"""
from alembic import op
import sqlalchemy as sa

revision = '20260423_add_email_verification_fields'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=True, server_default=sa.false()))
    op.add_column('users', sa.Column('verification_code', sa.String(length=10), nullable=True))

def downgrade():
    op.drop_column('users', 'email_verified')
    op.drop_column('users', 'verification_code')
