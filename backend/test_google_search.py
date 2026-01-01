from googlesearch import search

def test_search():
    print("Testing Google Search...")
    query = "Python Official Documentation"
    try:
        # advanced=True returns SearchResult objects with title and url (sometimes)
        # Actually googlesearch-python simple usage returns iterator of URLs
        results = search(query, num_results=1, advanced=True)
        
        for result in results:
            print(f"Title: {result.title}")
            print(f"URL: {result.url}")
            break # Just one
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search()
