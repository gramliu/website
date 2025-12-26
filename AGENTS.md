# Agent Guidelines

## Adding New Reads

When adding a new read (essay/article) to the website:

1. **Location**: Add a new entry to the essays data file located at `src/config/blogs.tsx`

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
