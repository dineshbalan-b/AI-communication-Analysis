import sqlite3
from datetime import datetime

DB_NAME = "evaluations.db"


# -------------------------------
# Initialize Evaluation Table
# -------------------------------

def init_evaluation_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS evaluations (
            username TEXT,
            date TEXT,
            topic TEXT,
            transcript TEXT,
            hybrid_score REAL,
            grammar REAL,
            vocabulary REAL,
            clarity REAL,
            confidence REAL
        )
    """)

    conn.commit()
    conn.close()


# -------------------------------
# Save Evaluation
# -------------------------------

def save_evaluation(username, topic, transcript, hybrid_score,
                    grammar, vocabulary, clarity, confidence):

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("""
        INSERT INTO evaluations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        username,
        datetime.now().strftime("%Y-%m-%d %H:%M"),
        topic,
        transcript,
        hybrid_score,
        grammar,
        vocabulary,
        clarity,
        confidence
    ))

    conn.commit()
    conn.close()


# -------------------------------
# Get User Progress
# -------------------------------

def get_user_progress(username):

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("""
        SELECT rowid, date, topic, hybrid_score, grammar, vocabulary, clarity, confidence
        FROM evaluations
        WHERE username=?
        ORDER BY date DESC
    """, (username,))

    data = c.fetchall()
    conn.close()

    return data


# -------------------------------
# Delete Evaluation
# -------------------------------

def delete_evaluation(rowid):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("DELETE FROM evaluations WHERE rowid=?", (rowid,))

    conn.commit()
    conn.close()
    return True