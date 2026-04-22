"""
Initialize the models package and import all model modules so that
SQLAlchemy's mapper registry sees every mapped class before any
individual module import triggers mapper configuration.

This avoids "expression 'Bookmark' failed to locate a name" errors
when other code imports a single model (e.g. `from models.user import User`).
"""

# Import models in a deterministic order. Use local imports to avoid
# accidental side-effects at package import time.
from . import bookmark  # noqa: F401
from . import place     # noqa: F401
from . import user      # noqa: F401

# Re-export common symbols for convenience
from .user import User  # noqa: F401
from .bookmark import Bookmark  # noqa: F401
from .place import Place  # noqa: F401
