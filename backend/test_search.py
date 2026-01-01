from duckduckgo_search import DDGS
import json

def test_search():
    print("Testing DuckDuckGo Search...")
    results = []
    try:
        with DDGS() as ddgs:
            # Search for a technical topic
            query = "Python Official Documentation"
            print(f"Searching for: {query}")
            
            # Get 1 result
            search_results = list(ddgs.text(query, max_results=1))
            
            if search_results:
                print("Success!")
                print(f"Title: {search_results[0]['title']}")
                print(f"URL: {search_results[0]['href']}")
            else:
                print("No results found.")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search()
