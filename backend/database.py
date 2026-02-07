import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "paydrift.db")


async def init_db():
    """Create the users table if it doesn't exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                hashed_password TEXT NOT NULL
            )
        """)
        await db.commit()


async def get_user_by_email(email: str) -> dict | None:
    """Return user dict or None."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT email, name, hashed_password FROM users WHERE email = ?",
            (email,),
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        return {"email": row["email"], "name": row["name"], "hashed_password": row["hashed_password"]}


async def create_user(email: str, name: str, hashed_password: str):
    """Insert a new user. Raises IntegrityError if email already exists."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO users (email, name, hashed_password) VALUES (?, ?, ?)",
            (email, name, hashed_password),
        )
        await db.commit()
