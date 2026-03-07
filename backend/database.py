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

    # Attempt to add audio_url column if it doesn't exist to avoid dropping existing data
    try:
        c.execute("ALTER TABLE evaluations ADD COLUMN audio_url TEXT DEFAULT ''")
    except sqlite3.OperationalError:
        pass # Column already exists
        
    # Attempt to add relevance column
    try:
        c.execute("ALTER TABLE evaluations ADD COLUMN relevance REAL DEFAULT 0")
    except sqlite3.OperationalError:
        pass

    # Attempt to add feedback_audio_url column
    try:
        c.execute("ALTER TABLE evaluations ADD COLUMN feedback_audio_url TEXT DEFAULT ''")
    except sqlite3.OperationalError:
        pass

    conn.commit()
    conn.close()


# -------------------------------
# Save Evaluation
# -------------------------------

def save_evaluation(username, topic, transcript, hybrid_score,
                    grammar, vocabulary, clarity, confidence, relevance=0,
                    wpm=0, filler_count=0, speech_ratio=0, 
                    final_feedback="", improvements="", audio_url="", feedback_audio_url=""):

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("""
        INSERT INTO evaluations (
            username, date, topic, transcript, hybrid_score, 
            grammar, vocabulary, clarity, confidence, relevance, 
            wpm, filler_count, speech_ratio, final_feedback, 
            improvements, audio_url, feedback_audio_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        username,
        datetime.now().strftime("%Y-%m-%d %H:%M"),
        topic,
        transcript,
        hybrid_score,
        grammar,
        vocabulary,
        clarity,
        confidence,
        relevance,
        wpm,
        filler_count,
        speech_ratio,
        final_feedback,
        improvements,
        audio_url,
        feedback_audio_url
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
        SELECT rowid, date, topic, hybrid_score, grammar, vocabulary, clarity, confidence, 
               transcript, wpm, filler_count, speech_ratio, final_feedback, improvements, audio_url, relevance, feedback_audio_url
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

def bulk_delete_evaluations(rowids):
    """Delete multiple evaluations by their rowids."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Use executemany for efficiency or a simple IN clause
    # For safety with a small number of IDs, IN clause is fine
    placeholders = ','.join(['?'] * len(rowids))
    query = f"DELETE FROM evaluations WHERE rowid IN ({placeholders})"
    
    c.execute(query, rowids)
    
    conn.commit()
    conn.close()
    return True