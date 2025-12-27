# Agent Guidelines

## Adding New Reads

When adding a new read (blog/article) to the website:

1. **Location**: Add a new entry to the blogs data file located at `src/config/blogs.tsx`

2. **Entry Format**: Each entry should follow this structure:
   ```typescript
   {
     title: "Article Title",
     url: "https://example.com/article",
     author: "Author Name"
   }
   ```

3. **Positioning**: **Unless otherwise specified**, always add new reads to the **end of the list** in the `blogs` array.

4. **Example**: To add a new read, append it to the array:
   ```typescript
   const blogs: Blog[] = [
     // ... existing entries ...
     {
       title: "Your New Article Title",
       url: "https://example.com/new-article",
       author: "Author Name"
     },
   ];
   ```

Note: The file uses TypeScript, so ensure proper syntax and that all required fields (`title`, `url`, `author`) are included.

## Finding Title and Author from a URL

When you have a URL but need to find the title and author, you can use `curl` to fetch the HTML and extract metadata. Here are the steps and methods:

### Step-by-Step Process

1. **Fetch the HTML content** using curl:
   ```bash
   curl -s -L "https://example.com/article-url"
   ```
   - `-s` suppresses progress output
   - `-L` follows redirects

2. **Extract the title** - Try these methods in order of preference:

   **Method A: Open Graph meta tag (most reliable)**
   ```bash
   curl -s -L "URL" | grep -oP '(?<=property="og:title" content=")[^"]*'
   ```

   **Method B: HTML title tag**
   ```bash
   curl -s -L "URL" | grep -oP '(?<=<title>)[^<]*(?=</title>)'
   ```

3. **Extract the author** - Try these methods in order:

   **Method A: JSON-LD structured data (best for modern sites)**
   ```bash
   curl -s -L "URL" | grep -oP '(?<=application/ld\+json">).*?(?=</script>)' | grep -oP '"author":\[.*?"name":"[^"]*"' | grep -oP '"name":"[^"]*"' | head -1 | sed 's/"name":"\(.*\)"/\1/'
   ```
   This extracts author from Schema.org structured data. The author is typically in an "author" array with a "name" field.

   **Method B: Article author meta tag**
   ```bash
   curl -s -L "URL" | grep -oP '(?<=property="article:author" content=")[^"]*'
   ```

   **Method C: Author meta tag**
   ```bash
   curl -s -L "URL" | grep -oP '(?<=name="author" content=")[^"]*'
   ```

   **Method D: Parse from title tag** (if author is in title like "Title - Author Name")
   ```bash
   curl -s -L "URL" | grep -oP '(?<=<title>)[^<]*(?=</title>)' | grep -oP '(?<= - )[^-]*$'
   ```

### Example: Testing a Real URL

Let's test with one of the URLs from the blogs list:

```bash
# Test URL: https://stripe.com/blog/canonical-log-lines

# Get the title
curl -s -L "https://stripe.com/blog/canonical-log-lines" | grep -oP '(?<=property="og:title" content=")[^"]*'
# Output: Fast and flexible observability with canonical log lines

# Get the author from JSON-LD
curl -s -L "https://stripe.com/blog/canonical-log-lines" | grep -oP '(?<=application/ld\+json">).*?(?=</script>)' | grep -oP '"author":\[.*?"name":"[^"]*"' | grep -oP '"name":"[^"]*"' | head -1 | sed 's/"name":"\(.*\)"/\1/'
# Output: Brandur Leach
```

### Complete Extraction Script Example

For a more robust extraction, you can combine multiple methods:

```bash
URL="https://example.com/article"

# Get title (prefer og:title, fallback to title tag)
TITLE=$(curl -s -L "$URL" | grep -oP '(?<=property="og:title" content=")[^"]*' || \
        curl -s -L "$URL" | grep -oP '(?<=<title>)[^<]*(?=</title>)' | head -1)

# Get author (try multiple methods)
AUTHOR=$(curl -s -L "$URL" | grep -oP '(?<=application/ld\+json">).*?(?=</script>)' | \
         grep -oP '"author":\[.*?"name":"[^"]*"' | grep -oP '"name":"[^"]*"' | head -1 | sed 's/"name":"\(.*\)"/\1/' || \
         curl -s -L "$URL" | grep -oP '(?<=property="article:author" content=")[^"]*' || \
         curl -s -L "$URL" | grep -oP '(?<=name="author" content=")[^"]*' || \
         curl -s -L "$URL" | grep -oP '(?<=<title>)[^<]*(?=</title>)' | grep -oP '(?<= - )[^-]*$')

echo "Title: $TITLE"
echo "Author: $AUTHOR"
```

### Notes

- Some sites may require JavaScript to load content, so curl may not work for all sites
- Author information is not always available in metadata - you may need to manually inspect the page
- Different sites use different metadata formats, so try multiple extraction methods
- Always verify the extracted information matches the actual article before adding to the blogs list

### Testing Steps (Example)

Here are the steps taken to test and verify the extraction methods:

1. **Test with a Stripe blog post** (`https://stripe.com/blog/canonical-log-lines`):
   - Fetched HTML: `curl -s -L "https://stripe.com/blog/canonical-log-lines"`
   - Found title in `og:title` meta tag: "Fast and flexible observability with canonical log lines"
   - Found author in JSON-LD structured data: `"author":[{"@type":"Person","name":"Brandur Leach"}]`
   - Successfully extracted both title and author

2. **Test with Sam Altman's blog** (`https://blog.samaltman.com/idea-generation`):
   - Found title in `og:title`: "Idea Generation"
   - Found full title in `<title>` tag: "Idea Generation - Sam Altman"
   - Author can be extracted from title tag using pattern matching (Method D)

3. **Test with Paul Graham's site** (`https://paulgraham.com/greatwork.html`):
   - Found title in `<title>` tag: "How to Do Great Work"
   - No structured metadata available, requires manual author lookup

**Key findings:**
- Modern sites (like Stripe) use JSON-LD structured data with author information
- Some sites embed author in the title tag (e.g., "Title - Author Name")
- Always try multiple extraction methods as different sites use different formats
- The complete extraction script combines all methods with fallbacks for maximum compatibility
