import urllib.request
import json

def test_ollama():
    url = "http://localhost:11434/api/generate"
    data = {
        "model": "llama3",
        "prompt": "Say 'Ollama API is working perfectly!' and nothing else.",
        "stream": False
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    
    try:
        response = urllib.request.urlopen(req)
        result = json.loads(response.read().decode('utf-8'))
        print("Success! Ollama Response:")
        print(result.get('response', ''))
    except Exception as e:
        print(f"Error connecting to Ollama: {e}")

if __name__ == "__main__":
    test_ollama()
