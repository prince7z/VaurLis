# 🏷️ Tag System Update

## Course Tag Structure

The `tag` field in the Course interface has been updated to use an **array of strings** instead of pipe-separated values.

### ✅ Updated Interface

```typescript
interface Course {
  _id: string;
  name: string;
  description: string;
  img: string;
  price: number;
  rating: string;
  instructor: Instructor;
  tag: string[];  // ✅ Array of strings
  timestamp: string;
}
```

### 🏷️ Available Tag Values

| Tag | Description | Section |
|-----|-------------|---------|
| `"Hero"` | Featured courses | Hero Carousel |
| `"Offer"` | Limited time offers | 🔥 Limited Time Offer |
| `"Trending"` | Trending courses | 📈 Trending Courses |
| `"Top"` | Top rated courses | 🏆 Top Courses |
| `"MIT"` | MIT courses | 🎓 Courses by MIT |

### 📋 Example API Response

```json
[
  {
    "_id": "68a610ee362cacd31f680d01",
    "name": "Integrated mobile forecast",
    "description": "Brevis omnis ait aqua compello sodalitas capio tenetur.",
    "img": "https://picsum.photos/seed/4IbsgBE/2781/669",
    "price": 4865,
    "rating": "2.9",
    "instructor": {
      "_id": "68a610ee362cacd31f680c39",
      "username": "Irma_Sanford",
      "img": "https://avatars.githubusercontent.com/u/23838659"
    },
    "tag": ["Hero", "Trending", "MIT", "Offer"],
    "timestamp": "2025-08-20T18:16:15.606Z"
  }
]
```

### 🔍 How Filtering Works

The filtering logic uses JavaScript's `Array.includes()` method:

```typescript
const sections = {
  hero: courses.filter((c) => c.tag?.includes('Hero')),
  offer: courses.filter((c) => c.tag?.includes('Offer')),
  trending: courses.filter((c) => c.tag?.includes('Trending')),
  mit: courses.filter((c) => c.tag?.includes('MIT')),
  top: courses.filter((c) => c.tag?.includes('Top')),
  topInstructor: getTopInstructorCourses(courses),
};
```

### 📊 Section Mapping

The CoursesPage component automatically renders sections based on available tags:

1. **Hero Carousel** - Courses with `"Hero"` tag
2. **🔥 Limited Time Offer** - Courses with `"Offer"` tag
3. **📈 Trending Courses** - Courses with `"Trending"` tag
4. **🏆 Top Courses** - Courses with `"Top"` tag
5. **🎓 Courses by MIT** - Courses with `"MIT"` tag
6. **⭐ Courses by Top Instructors** - Algorithm-based (top 3 instructors by rating and course count)

### ✨ Key Features

- **Multiple Tags**: A course can have multiple tags simultaneously
- **Conditional Rendering**: Sections only appear if there are courses with that tag
- **Case-Sensitive**: Tag values are case-sensitive (`"Hero"` ≠ `"hero"`)
- **Type-Safe**: Full TypeScript support with proper type checking

### 🎯 Backend Implementation

Your backend should return the `tag` field as an array:

```javascript
// ✅ Correct
{
  tag: ["Hero", "Trending", "MIT"]
}

// ❌ Incorrect (old format)
{
  tag: "hero||trending||MIT"
}
```

### 🔄 Migration Note

If you have existing data with pipe-separated tags (`"hero||trending||MIT"`), you'll need to:

1. **Update your database** to use arrays: `["hero", "trending", "MIT"]`
2. **Update tag values** to match the new capitalization: `["Hero", "Trending", "MIT"]`
3. **Update your API** to return the array format

Example migration script:
```javascript
// Convert old format to new format
const oldTag = "hero||trending||MIT";
const newTag = oldTag
  .split("||")
  .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase());
// Result: ["Hero", "Trending", "Mit"]
```
