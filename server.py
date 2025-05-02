from http.server import BaseHTTPRequestHandler, HTTPServer

class RequestLoggerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        print(f"Received GET request:\nPath: {self.path}")
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"GET request received")

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        print(f"Received POST request:\nPath: {self.path}\nBody:\n{post_data.decode('utf-8')}")
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"POST request received")

def run(server_class=HTTPServer, handler_class=RequestLoggerHandler, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
