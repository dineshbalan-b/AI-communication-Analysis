"""
Configuration Module
Handles environment variables and system dependencies like ffmpeg.
"""

import os
import shutil
import glob

def _find_ffmpeg():
    """Find ffmpeg executable, checking PATH first then common install locations."""
    # Check if ffmpeg is in PATH
    ffmpeg_path = shutil.which("ffmpeg")
    if ffmpeg_path:
        return ffmpeg_path

    # Search common WinGet and manual install locations on Windows
    search_dirs = [
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages"),
        r"C:\ffmpeg",
        r"C:\Program Files\ffmpeg",
        r"C:\Program Files (x86)\ffmpeg",
    ]

    for search_dir in search_dirs:
        if os.path.isdir(search_dir):
            matches = glob.glob(os.path.join(search_dir, "**", "ffmpeg.exe"), recursive=True)
            if matches:
                return matches[0]

    return None

# Global path used by the rest of the app
FFMPEG_PATH = _find_ffmpeg()
