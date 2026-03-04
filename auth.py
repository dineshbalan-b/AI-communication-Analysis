import sqlite3
import hashlib

DB_NAME = "users.db"


# -------------------------------
# Create Users Table (Run Once)
# -------------------------------

def init_user_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT
        )
    """)

    conn.commit()
    conn.close()


# -------------------------------
# Hash Password
# -------------------------------

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


# -------------------------------
# Create User
# -------------------------------

def create_user(username, password):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    hashed = hash_password(password)

    try:
        c.execute("INSERT INTO users VALUES (?, ?)", (username, hashed))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


# -------------------------------
# Verify User
# -------------------------------

def verify_user(username, password):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    hashed = hash_password(password)

    c.execute(
        "SELECT * FROM users WHERE username=? AND password=?",
        (username, hashed)
    )

    result = c.fetchone()
    conn.close()

    return result is not None