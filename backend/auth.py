"""
Authentication Module
Handles user registration, login, and password hashing.
"""

import sqlite3
import hashlib

DB_NAME = "users.db"


def init_user_db():
    """Create users table if it doesn't exist."""
    conn = sqlite3.connect(DB_NAME)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()


def hash_password(password):
    """Hash password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()


def create_user(username, password):
    """Register a new user. Returns True on success, False if username exists."""
    conn = sqlite3.connect(DB_NAME)
    try:
        conn.execute("INSERT INTO users VALUES (?, ?)", (username, hash_password(password)))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def verify_user(username, password):
    """Verify user credentials. Returns True if valid."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.execute(
        "SELECT 1 FROM users WHERE username=? AND password=?",
        (username, hash_password(password))
    )
    result = cursor.fetchone()
    conn.close()
    return result is not None