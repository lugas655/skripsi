import os
import re

file_path = r'd:\Folder Lugas\kuliah\skripsi\coba skripsi\frontend\src\pages\AdminPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the <style> block
match = re.search(r'<style>\{`(.*?)`\}</style>', content, re.DOTALL)
if match:
    css = match.group(1).strip()
    
    # Write CSS to new file
    os.makedirs(r'd:\Folder Lugas\kuliah\skripsi\coba skripsi\frontend\src\components\adminpage', exist_ok=True)
    with open(r'd:\Folder Lugas\kuliah\skripsi\coba skripsi\frontend\src\components\adminpage\AdminPage.css', 'w', encoding='utf-8') as f:
        f.write(css)
    
    # Remove <style> block from TSX
    new_content = content[:match.start()] + content[match.end():]
    
    # Insert import
    import_statement = "import '../components/adminpage/AdminPage.css';\n"
    
    # Find last import
    last_import = [m.end() for m in re.finditer(r'^import .*\n', new_content, re.MULTILINE)][-1]
    new_content = new_content[:last_import] + import_statement + new_content[last_import:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print('Successfully extracted CSS')
else:
    print('Style block not found')
