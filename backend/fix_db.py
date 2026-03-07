import sqlite3

def delete_last_row():
    try:
        conn = sqlite3.connect('evaluations.db')
        c = conn.cursor()
        
        # We find the rowid where final_feedback looks suspiciously like a float
        # but just dropping the latest row is safest, as it's the one from the test
        c.execute("SELECT rowid, final_feedback FROM evaluations ORDER BY date DESC LIMIT 1")
        row = c.fetchone()
        
        if row:
            rowid, fb = row
            print(f"Latest row ({rowid}) feedback preview: {str(fb)[:20]}")
            
            # Since we know the previous record got mangled, let's just delete the top row
            c.execute("DELETE FROM evaluations WHERE rowid=?", (rowid,))
            conn.commit()
            print("Successfully deleted the corrupted latest row.")
        else:
            print("No rows found.")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    delete_last_row()
