import os

def update_file(path, replacements):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    if content != original_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {path}")
    else:
        print(f"No changes for: {path}")

# Update Poll Page
poll_page_path = os.path.join("..", "hackathon", "app", "poll", "[id]", "page.js")
update_file(poll_page_path, {
    "const socket = useSocket(pollId);": "const { socket, isJoined } = useSocket(pollId);",
    '<Badge variant="primary">LIVE</Badge>': '<Badge variant={isJoined ? "primary" : "secondary"}>{isJoined ? "LIVE" : "CONNECTING..."}</Badge>'
})

# Update API.js for credentials (optional but good for production)
api_js_path = os.path.join("..", "hackathon", "lib", "api.js")
update_file(api_js_path, {
    "method: 'POST',": "method: 'POST', credentials: 'include',",
    "headers: {": "credentials: 'include', headers: {"
})
