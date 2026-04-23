import http.server
import socketserver
import os

PORT = 3000
os.chdir("/Users/frankm5air/Documents/CaludeCode/Personal homepage")

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
})

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
