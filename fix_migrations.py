#!/usr/bin/env python3
import os
import glob

# Path to migrations directory
migrations_dir = "backend/migrations"

# Convert all SQL files to use LF (Unix) line endings and no BOM
for filepath in glob.glob(os.path.join(migrations_dir, "*.sql")):
    # Read file in binary mode
    with open(filepath, 'rb') as f:
        content = f.read()
    
    # Remove UTF-8 BOM if present
    if content.startswith(b'\xef\xbb\xbf'):
        content = content[3:]
    
    # Convert CRLF to LF
    content = content.replace(b'\r\n', b'\n')
    
    # Write back
    with open(filepath, 'wb') as f:
        f.write(content)
    
    print(f"Fixed: {filepath}")

print("All migration files have been fixed!")
