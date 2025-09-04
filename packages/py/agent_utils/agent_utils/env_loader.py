from dotenv import load_dotenv, find_dotenv
import os

def initialize_env():
    """Load layered .env files with sensible overrides.

    Order (first found wins unless override=True):
    - .env.shared, .env.backend (base)
    - .env.<ENV> (override)
    - .env (base), .env.local (override)
    """

    def load_layer(filename: str, override: bool = False) -> None:
        path = find_dotenv(filename, usecwd=True)
        if path:
            load_dotenv(path, override=override)

    load_layer('.env.shared', override=False)
    load_layer('.env.backend', override=False)

    stage = os.getenv('ENV', 'development')
    load_layer(f'.env.{stage}', override=True)

    load_layer('.env', override=False)
    load_layer('.env.local', override=True)
