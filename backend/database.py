"""
Database Module
Handles SQLite operations for storing and retrieving evaluation results.
"""

import sqlite3
from datetime import datetime

DB_NAME = "evaluations.db"


def init_evaluation_db():
    """Create evaluations table with all required columns."""
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
            confidence REAL,
            relevance REAL DEFAULT 0,
            wpm REAL DEFAULT 0,
            filler_count INTEGER DEFAULT 0,
            speech_ratio REAL DEFAULT 0,
            final_feedback TEXT DEFAULT '',
            improvements TEXT DEFAULT '',
            audio_url TEXT DEFAULT '',
            feedback_audio_url TEXT DEFAULT ''
        )
    """)

    # Add columns for older databases (safe — silently skips if column exists)
    for alter_sql in [
        "ALTER TABLE evaluations ADD COLUMN audio_url TEXT DEFAULT ''",
        "ALTER TABLE evaluations ADD COLUMN relevance REAL DEFAULT 0",
        "ALTER TABLE evaluations ADD COLUMN feedback_audio_url TEXT DEFAULT ''",
    ]:
        try:
            c.execute(alter_sql)
        except sqlite3.OperationalError:
            pass

    conn.commit()
    conn.close()


def save_evaluation(username, topic, transcript, hybrid_score,
                    grammar, vocabulary, clarity, confidence, relevance=0,
                    wpm=0, filler_count=0, speech_ratio=0,
                    final_feedback="", improvements="", audio_url="", feedback_audio_url=""):
    """Save a completed evaluation to the database."""
    conn = sqlite3.connect(DB_NAME)
    conn.execute("""
        INSERT INTO evaluations (
            username, date, topic, transcript, hybrid_score,
            grammar, vocabulary, clarity, confidence, relevance,
            wpm, filler_count, speech_ratio, final_feedback,
            improvements, audio_url, feedback_audio_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        username, datetime.now().strftime("%Y-%m-%d %H:%M"),
        topic, transcript, hybrid_score,
        grammar, vocabulary, clarity, confidence, relevance,
        wpm, filler_count, speech_ratio, final_feedback,
        improvements, audio_url, feedback_audio_url
    ))
    conn.commit()
    conn.close()


def get_user_progress(username):
    """Retrieve all evaluations for a user, ordered by most recent first."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.execute("""
        SELECT rowid, date, topic, hybrid_score, grammar, vocabulary, clarity, confidence,
               transcript, wpm, filler_count, speech_ratio, final_feedback, improvements,
               audio_url, relevance, feedback_audio_url
        FROM evaluations
        WHERE username=?
        ORDER BY date DESC
    """, (username,))
    data = cursor.fetchall()
    conn.close()
    return data


def delete_evaluation(rowid):
    """Delete a single evaluation by row ID."""
    conn = sqlite3.connect(DB_NAME)
    conn.execute("DELETE FROM evaluations WHERE rowid=?", (rowid,))
    conn.commit()
    conn.close()
    return True


def bulk_delete_evaluations(rowids):
    """Delete multiple evaluations by their row IDs."""
    conn = sqlite3.connect(DB_NAME)
    placeholders = ','.join(['?'] * len(rowids))
    conn.execute(f"DELETE FROM evaluations WHERE rowid IN ({placeholders})", rowids)
    conn.commit()
    conn.close()
    return True