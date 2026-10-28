import os
import sqlite3
from dotenv import load_dotenv

load_dotenv()
DB_PATH = os.getenv("DATABASE_PATH", "jarvis.db")

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect() as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS memories (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
        conn.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")

def add_memory(content):
    with connect() as conn:
        cur = conn.execute("INSERT INTO memories(content) VALUES (?)", (content,))
        return cur.lastrowid

def get_memories():
    with connect() as conn:
        return [dict(r) for r in conn.execute("SELECT * FROM memories ORDER BY id DESC").fetchall()]

def delete_memory(memory_id):
    with connect() as conn:
        return conn.execute("DELETE FROM memories WHERE id=?", (memory_id,)).rowcount > 0

def add_task(title):
    with connect() as conn:
        cur = conn.execute("INSERT INTO tasks(title) VALUES (?)", (title,))
        return dict(conn.execute("SELECT * FROM tasks WHERE id=?", (cur.lastrowid,)).fetchone())

def get_tasks():
    with connect() as conn:
        return [dict(r) for r in conn.execute("SELECT * FROM tasks ORDER BY id DESC").fetchall()]

def set_task_done(task_id, done):
    with connect() as conn:
        return conn.execute("UPDATE tasks SET done=? WHERE id=?", (int(done), task_id)).rowcount > 0
