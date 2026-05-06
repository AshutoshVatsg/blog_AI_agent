# Blog Management System — Complete Architecture Document
### "Trust-Aware Publishing Platform" | MERN Stack
### Team FD14 — Amrita School of Computing

---

## 📌 Project Summary

A blog management platform where content is not just published and read — but **analyzed, challenged, and understood at a deeper level** through paragraph-level reactions, claim credibility scoring, consensus-based feedback, and AI-powered writing insights derived from personal analytics.

---

## 🧩 COMPLETE FEATURE MAP

### 🔐 AUTHENTICATION MODULE

| Feature | Description |
|---|---|
| **Sign Up Page** | Name, email, password, confirm password. Email uniqueness validation. Password hashed with bcrypt before storing. |
| **Sign In Page** | Email + password login. Server validates credentials, returns JWT token. Token stored in httpOnly cookie or localStorage. |
| **JWT Middleware** | Every protected route passes through `authMiddleware` that verifies token. Extracts `userId` and `role` from token payload. |
| **Role System** | Three roles: `admin`, `user`, `guest`. Admin can moderate. User can CRUD. Guest can only read. |
| **Logout** | Client-side token removal. Optional server-side token blacklist in Redis/MongoDB. |
| **Profile Page** | View/edit name, bio, avatar. Shows post count, total engagement received, Writing DNA badge. |

---

### 📝 BLOG POST MODULE

| Feature | Description |
|---|---|
| **Create Post** | Rich text editor (React Quill / TipTap). Title, content (stored as array of paragraphs), tags, cover image. Author can mark post as "Drip" or "Anonymous" at creation. |
| **View Post** | Renders paragraphs individually (critical for emoji heatmap + claim scoring). Tracks view count. Saves reading progress per user. |
| **Edit Post** | Author-only. Updates content, tags. `updatedAt` timestamp refreshes (used for post aging visual). |
| **Delete Post** | Author or Admin only. Soft delete (sets `isDeleted: true`) to preserve reaction/consensus data. |
| **Post Listing / Homepage** | All published posts with search, filter by tags, sort by recent/trending. |
| **My Posts Dashboard** | Author's own posts with stats: views, consensus averages, credibility badges. |

---

### 💬 COMMENT MODULE

| Feature | Description |
|---|---|
| **Add Comment** | Authenticated users only. Linked to `postId` and `userId`. |
| **Edit/Delete Comment** | Only the comment author or admin. |
| **Nested Replies** | Optional: `parentCommentId` field enables reply threads. |
| **Admin Moderation** | Admin can delete any comment flagged as inappropriate. |

---

### 📊 FEATURE 1 — CONSENSUS METERS (Replaces Basic Likes)

| Aspect | Detail |
|---|---|
| **What** | After reading, users rate the post on 3 sliding scales (1-10): Mind-changing, Originality, Clarity |
| **Where** | Bottom of every post, appears after user scrolls past 70% |
| **Storage** | Array of rating objects per post, one per user |
| **Display** | Horizontal bar chart showing community average for each dimension |
| **Author View** | Dashboard shows consensus trends over time across all posts |
| **One Rating Per User** | Users can update but not duplicate their rating |

---

### 🎨 FEATURE 2 — PARAGRAPH EMOJI HEATMAP

| Aspect | Detail |
|---|---|
| **What** | Readers click emoji reactions (👍 ❤️ 😂 😮 😢) on individual paragraphs while reading |
| **Where** | Small emoji bar appears on hover/tap next to each paragraph |
| **Storage** | Array of `{ paragraphIndex, emoji, userId }` per post |
| **Heatmap** | Each paragraph gets a background color intensity based on total reaction count — more reactions = warmer color |
| **Author View** | Author sees which paragraphs got the most emotional response and which emoji dominated |

---

### ✅ FEATURE 3 — CLAIM CREDIBILITY SCORING

| Aspect | Detail |
|---|---|
| **What** | Readers can highlight any sentence in a post and flag it as a "Claim" — then community votes: Verified / Misleading / Needs Source |
| **Where** | Reader selects text → popup appears with flag button → claim appears in sidebar panel |
| **Storage** | Array of claim objects with `{ text, startIndex, endIndex, paragraphIndex, votes[] }` |
| **Scoring** | Post gets overall credibility badge: ✅ Verified (>70% verified claims), ⚠️ Disputed (>30% misleading), ❔ Unverified (no claims flagged) |
| **Author Response** | Author can add a response/source link to any flagged claim |
| **Admin** | Admin can dismiss frivolous claims |

---

### 🧠 FEATURE 4 — AI WRITING INSIGHTS DASHBOARD

| Aspect | Detail |
|---|---|
| **What** | Analyzes author's entire post history + engagement data to find patterns and generate personalized suggestions |
| **Step 1 — Tone Analysis** | On publish, post content is sent to AI API → returns `{ tone, topicCategory, vocabularyLevel }` |
| **Step 2 — Pattern Detection** | MongoDB aggregation queries group posts by tone/topic → calculate avg likes, views, consensus scores per group |
| **Step 3 — Insight Generation** | Aggregated patterns are sent to AI API → returns 3-5 human-readable suggestions |
| **Display** | "Insights Card" on author dashboard showing what's working, what to try next, and their best-performing post characteristics |
| **Refresh** | Insights regenerate when author publishes a new post or clicks "Refresh Insights" |

---

## 🗄️ COMPLETE MONGODB SCHEMA DESIGN

### Collection 1 — `users`

```javascript
{
  _id: ObjectId,
  name: String,                    // required
  email: String,                   // required, unique, indexed
  password: String,                // bcrypt hashed
  role: {
    type: String,
    enum: ["admin", "user", "guest"],
    default: "user"
  },
  bio: String,
  avatar: String,                  // URL to uploaded image
  createdAt: Date,
  updatedAt: Date
}
```

### Collection 2 — `posts`

```javascript
{
  _id: ObjectId,
  title: String,                   // required
  
  // CRITICAL: Content stored as ARRAY of paragraphs (not a single string)
  // This enables paragraph-level reactions and claim scoring
  paragraphs: [
    {
      index: Number,               // 0, 1, 2...
      content: String,             // the paragraph text
      type: String                 // "text" | "heading" | "code" | "quote"
    }
  ],
  
  summary: String,                 // short description for cards
  coverImage: String,              // URL
  tags: [String],                  // ["tech", "javascript", "opinion"]
  
  authorId: {
    type: ObjectId,
    ref: "User"
  },
  
  // ── Basic Metrics ──
  views: { type: Number, default: 0 },
  
  // ── AI Tone Analysis (Feature 4) ──
  toneAnalysis: {
    tone: String,                  // "casual" | "formal" | "humorous" | "technical"
    topicCategory: String,         // "tech" | "lifestyle" | "opinion" | "personal"
    vocabularyLevel: String,       // "simple" | "moderate" | "complex"
    avgSentenceLength: Number,
    wordCount: Number,
    analyzedAt: Date
  },
  
  // ── Credibility Badge (Feature 3) ──
  credibilityBadge: {
    type: String,
    enum: ["verified", "disputed", "unverified"],
    default: "unverified"
  },
  
  // ── Status ──
  status: {
    type: String,
    enum: ["draft", "published", "deleted"],
    default: "draft"
  },
  
  isAnonymous: { type: Boolean, default: false },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Collection 3 — `comments`

```javascript
{
  _id: ObjectId,
  postId: { type: ObjectId, ref: "Post" },
  userId: { type: ObjectId, ref: "User" },
  content: String,
  parentCommentId: ObjectId,       // null for top-level, ObjectId for replies
  createdAt: Date,
  updatedAt: Date
}
```

### Collection 4 — `consensusratings` (Feature 1)

```javascript
{
  _id: ObjectId,
  postId: { type: ObjectId, ref: "Post" },
  userId: { type: ObjectId, ref: "User" },
  mindChanging: Number,            // 1-10
  originality: Number,             // 1-10
  clarity: Number,                 // 1-10
  createdAt: Date
}
// Compound index: { postId: 1, userId: 1 } unique → one rating per user per post
```

### Collection 5 — `paragraphreactions` (Feature 2)

```javascript
{
  _id: ObjectId,
  postId: { type: ObjectId, ref: "Post" },
  userId: { type: ObjectId, ref: "User" },
  paragraphIndex: Number,          // which paragraph (0, 1, 2...)
  emoji: String,                   // "👍" | "❤️" | "😂" | "😮" | "😢"
  createdAt: Date
}
// Compound index: { postId: 1, paragraphIndex: 1 }
// Unique index: { postId: 1, userId: 1, paragraphIndex: 1 } → one reaction per para per user
```

### Collection 6 — `claims` (Feature 3)

```javascript
{
  _id: ObjectId,
  postId: { type: ObjectId, ref: "Post" },
  flaggedBy: { type: ObjectId, ref: "User" },
  
  // What text was highlighted
  paragraphIndex: Number,
  claimText: String,               // the highlighted sentence
  startOffset: Number,             // character position start
  endOffset: Number,               // character position end
  
  // Voting
  votes: [{
    userId: { type: ObjectId, ref: "User" },
    verdict: String,               // "verified" | "misleading" | "needs_source"
    reason: String,                // optional explanation
    votedAt: Date
  }],
  
  // Author can respond
  authorResponse: {
    text: String,
    sourceUrl: String,
    respondedAt: Date
  },
  
  // Computed
  status: {
    type: String,
    enum: ["verified", "misleading", "needs_source", "pending"],
    default: "pending"
  },
  
  createdAt: Date
}
```

### Collection 7 — `authorinsights` (Feature 4)

```javascript
{
  _id: ObjectId,
  authorId: { type: ObjectId, ref: "User" },
  generatedAt: Date,
  
  // Raw analytics snapshot
  analytics: {
    totalPosts: Number,
    totalViews: Number,
    avgConsensus: {
      mindChanging: Number,
      originality: Number,
      clarity: Number
    },
    bestPerformingPost: {
      postId: ObjectId,
      title: String,
      views: Number
    },
    toneBreakdown: {
      // { "casual": { count: 5, avgViews: 340 }, "formal": { count: 3, avgViews: 89 } }
    },
    topicBreakdown: {
      // { "tech": { count: 4, avgViews: 420 }, "lifestyle": { count: 2, avgViews: 110 } }
    }
  },
  
  // AI-generated suggestions
  insights: [{
    type: String,                  // "tone" | "topic" | "length" | "frequency" | "engagement"
    observation: String,           // "Your tech posts get 4x more engagement"
    suggestion: String,            // "Consider framing your next post around tech"
    confidence: String             // "high" | "medium" | "low"
  }]
}
```

### Collection 8 — `readingprogress`

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: "User" },
  postId: { type: ObjectId, ref: "Post" },
  lastParagraphIndex: Number,      // where they stopped
  completed: Boolean,
  updatedAt: Date
}
// Compound index: { userId: 1, postId: 1 } unique
```

---

## 🛣️ COMPLETE API ROUTES

### Auth Routes — `/api/auth`

```
POST   /api/auth/register          → Create new user account
POST   /api/auth/login             → Authenticate, return JWT
GET    /api/auth/me                → Get current user from token
POST   /api/auth/logout            → Invalidate token (optional)
```

### User Routes — `/api/users`

```
GET    /api/users/:id              → Get user profile (public)
PUT    /api/users/:id              → Update own profile
GET    /api/users/:id/stats        → Get user stats (post count, total views)
DELETE /api/users/:id              → Admin only: delete user
GET    /api/users                  → Admin only: list all users
```

### Post Routes — `/api/posts`

```
POST   /api/posts                  → Create new post (auth required)
GET    /api/posts                  → List all published posts (public, paginated)
GET    /api/posts/:id              → Get single post + increment view count
PUT    /api/posts/:id              → Update post (author only)
DELETE /api/posts/:id              → Soft delete post (author or admin)
GET    /api/posts/my               → Get current user's posts
GET    /api/posts/search?q=&tag=   → Search posts by keyword or tag
GET    /api/posts/trending         → Get posts sorted by consensus + views
```

### Comment Routes — `/api/posts/:postId/comments`

```
POST   /api/posts/:postId/comments             → Add comment
GET    /api/posts/:postId/comments             → Get all comments for post
PUT    /api/posts/:postId/comments/:commentId  → Edit own comment
DELETE /api/posts/:postId/comments/:commentId  → Delete (author or admin)
```

### Consensus Routes — `/api/posts/:postId/consensus`

```
POST   /api/posts/:postId/consensus            → Submit or update rating (3 sliders)
GET    /api/posts/:postId/consensus            → Get community averages
GET    /api/posts/:postId/consensus/me         → Get current user's rating
```

### Paragraph Reaction Routes — `/api/posts/:postId/reactions`

```
POST   /api/posts/:postId/reactions            → Add emoji to a paragraph
DELETE /api/posts/:postId/reactions/:reactionId → Remove own reaction
GET    /api/posts/:postId/reactions             → Get all reactions (grouped by paragraph)
GET    /api/posts/:postId/reactions/heatmap     → Get aggregated heatmap data
```

### Claim Routes — `/api/posts/:postId/claims`

```
POST   /api/posts/:postId/claims               → Flag a claim (highlight text)
GET    /api/posts/:postId/claims               → Get all claims for a post
POST   /api/posts/:postId/claims/:claimId/vote → Vote on a claim
PUT    /api/posts/:postId/claims/:claimId/respond → Author responds to claim
DELETE /api/posts/:postId/claims/:claimId      → Admin dismisses a claim
GET    /api/posts/:postId/credibility          → Get overall credibility badge
```

### AI Insights Routes — `/api/insights`

```
POST   /api/insights/analyze/:postId           → Trigger tone analysis for a post
GET    /api/insights/my                        → Get current author's latest insights
POST   /api/insights/generate                  → Force regenerate insights from history
```

### Reading Progress Routes — `/api/progress`

```
POST   /api/progress/:postId                   → Save reading progress (paragraph index)
GET    /api/progress/:postId                   → Get reading progress for a post
```

### Admin Routes — `/api/admin`

```
GET    /api/admin/dashboard                    → Platform-wide stats
GET    /api/admin/users                        → List all users with roles
PUT    /api/admin/users/:id/role               → Change user role
DELETE /api/admin/posts/:id                    → Force delete any post
DELETE /api/admin/comments/:id                 → Force delete any comment
DELETE /api/admin/claims/:id                   → Dismiss any claim
```

---

## 🗂️ COMPLETE FOLDER STRUCTURE

### Backend — `/server`

```
server/
├── server.js                      # Entry point, Express app setup
├── .env                           # PORT, MONGO_URI, JWT_SECRET, AI_API_KEY
├── config/
│   ├── db.js                      # MongoDB connection (mongoose.connect)
│   └── keys.js                    # Environment variable exports
├── middleware/
│   ├── authMiddleware.js           # JWT verification, attaches req.user
│   ├── adminMiddleware.js          # Checks req.user.role === "admin"
│   ├── errorHandler.js             # Global error handling
│   └── validateRequest.js          # Input validation (express-validator)
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   ├── ConsensusRating.js
│   ├── ParagraphReaction.js
│   ├── Claim.js
│   ├── AuthorInsight.js
│   └── ReadingProgress.js
├── controllers/
│   ├── authController.js           # register, login, getMe
│   ├── userController.js           # profile CRUD
│   ├── postController.js           # post CRUD + search + trending
│   ├── commentController.js        # comment CRUD
│   ├── consensusController.js      # submit rating, get averages
│   ├── reactionController.js       # add emoji, get heatmap
│   ├── claimController.js          # flag, vote, respond, credibility
│   ├── insightController.js        # analyze, generate, fetch
│   ├── progressController.js       # save/get reading progress
│   └── adminController.js          # admin dashboard + moderation
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── postRoutes.js
│   ├── commentRoutes.js
│   ├── consensusRoutes.js
│   ├── reactionRoutes.js
│   ├── claimRoutes.js
│   ├── insightRoutes.js
│   ├── progressRoutes.js
│   └── adminRoutes.js
├── services/
│   ├── aiService.js                # Calls Anthropic/OpenAI API for tone analysis + insights
│   ├── credibilityService.js       # Recalculates credibility badge from votes
│   └── analyticsService.js         # Runs MongoDB aggregation for insights
└── utils/
    ├── generateToken.js            # JWT sign helper
    └── validators.js               # Reusable validation schemas
```

### Frontend — `/client`

```
client/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                     # Router setup
│   ├── main.jsx                    # React entry point
│   ├── api/
│   │   └── axios.js                # Axios instance with baseURL + token interceptor
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Auth state (user, token, login, logout)
│   │
│   ├── hooks/
│   │   ├── useAuth.js              # Access auth context
│   │   ├── useFetch.js             # Generic data fetching hook
│   │   └── useReadingProgress.js   # Track scroll + save paragraph index
│   │
│   ├── pages/
│   │   ├── HomePage.jsx            # Post listing + search + trending section
│   │   ├── LoginPage.jsx           # Sign in form
│   │   ├── RegisterPage.jsx        # Sign up form
│   │   ├── PostPage.jsx            # Single post view (THE MAIN PAGE — all features live here)
│   │   ├── CreatePostPage.jsx      # Rich text editor + tags + settings
│   │   ├── EditPostPage.jsx        # Edit existing post
│   │   ├── ProfilePage.jsx         # User profile + their posts
│   │   ├── DashboardPage.jsx       # Author dashboard (insights + stats + consensus trends)
│   │   ├── AdminPage.jsx           # Admin panel (users + moderation)
│   │   └── NotFoundPage.jsx        # 404
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx          # Top navigation + auth buttons
│   │   │   ├── Footer.jsx
│   │   │   └── Sidebar.jsx         # Tag cloud, trending posts
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── ProtectedRoute.jsx  # Redirects to login if no token
│   │   │
│   │   ├── posts/
│   │   │   ├── PostCard.jsx        # Card on homepage (title, summary, consensus bars, credibility badge)
│   │   │   ├── PostList.jsx        # Grid/list of PostCards
│   │   │   ├── PostEditor.jsx      # Rich text editor component
│   │   │   ├── ParagraphRenderer.jsx  # ⭐ Renders each paragraph with emoji bar + claim highlights
│   │   │   └── TagFilter.jsx       # Filter posts by tags
│   │   │
│   │   ├── comments/
│   │   │   ├── CommentSection.jsx
│   │   │   ├── CommentItem.jsx
│   │   │   └── CommentForm.jsx
│   │   │
│   │   ├── consensus/              # ⭐ Feature 1
│   │   │   ├── ConsensusMeter.jsx  # Three slider inputs (1-10)
│   │   │   ├── ConsensusDisplay.jsx # Horizontal bar visualization
│   │   │   └── ConsensusTrend.jsx  # Chart showing consensus over time (dashboard)
│   │   │
│   │   ├── reactions/              # ⭐ Feature 2
│   │   │   ├── EmojiBar.jsx        # Floating emoji picker per paragraph
│   │   │   ├── HeatmapOverlay.jsx  # Background color intensity layer
│   │   │   └── ReactionSummary.jsx # Author view: which paragraphs got most reactions
│   │   │
│   │   ├── claims/                 # ⭐ Feature 3
│   │   │   ├── ClaimHighlighter.jsx # Text selection → flag button popup
│   │   │   ├── ClaimSidebar.jsx    # Panel showing all claims on a post
│   │   │   ├── ClaimVoteCard.jsx   # Single claim with vote buttons
│   │   │   ├── CredibilityBadge.jsx # ✅ / ⚠️ / ❔ badge component
│   │   │   └── AuthorResponse.jsx  # Author's reply to a claim
│   │   │
│   │   ├── insights/               # ⭐ Feature 4
│   │   │   ├── InsightsCard.jsx    # Main insights display card
│   │   │   ├── ToneBreakdown.jsx   # Chart: tone vs avg engagement
│   │   │   ├── TopicBreakdown.jsx  # Chart: topic vs avg engagement
│   │   │   └── WritingStats.jsx    # Word count trends, posting frequency
│   │   │
│   │   └── common/
│   │       ├── Loader.jsx
│   │       ├── ErrorMessage.jsx
│   │       ├── SearchBar.jsx
│   │       ├── Pagination.jsx
│   │       └── Modal.jsx
│   │
│   └── styles/
│       └── index.css               # Tailwind CSS or custom CSS
│
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🔄 DATA FLOW — HOW EACH FEATURE WORKS

### Flow 1 — User Reads a Post (Everything Triggers Here)

```
User clicks post
       │
       ▼
GET /api/posts/:id ──────────────► MongoDB: Fetch post
       │                                    Increment views += 1
       ▼
PostPage.jsx renders
       │
       ├── ParagraphRenderer.jsx ──► Renders each paragraph separately
       │     ├── EmojiBar.jsx      ► Hover: shows emoji picker
       │     ├── ClaimHighlighter  ► Text select: shows flag button
       │     └── HeatmapOverlay   ► Background color from reaction data
       │
       ├── ConsensusMeter.jsx ────► Shows 3 sliders after 70% scroll
       │
       ├── ClaimSidebar.jsx ──────► Shows flagged claims in sidebar
       │
       ├── CommentSection.jsx ────► Regular comments
       │
       └── CredibilityBadge.jsx ──► Badge in post header
```

### Flow 2 — Author Publishes a Post

```
Author clicks "Publish"
       │
       ▼
POST /api/posts ──────────────────► MongoDB: Save post
       │
       ▼
POST /api/insights/analyze/:id ───► aiService.js
       │                                │
       │                    Send content to AI API
       │                    "Analyze tone of this text"
       │                                │
       │                                ▼
       │                    Receive: { tone, topic, vocabulary }
       │                                │
       │                                ▼
       │                    Save toneAnalysis to post document
       │
       ▼
POST /api/insights/generate ──────► analyticsService.js
       │                                │
       │                    Run MongoDB aggregations:
       │                    - Group posts by tone → avg views
       │                    - Group posts by topic → avg likes
       │                    - Calculate consensus averages
       │                                │
       │                                ▼
       │                    Send patterns to AI API
       │                    "Generate suggestions from this data"
       │                                │
       │                                ▼
       │                    Save to AuthorInsights collection
       │
       ▼
Redirect to post page
```

### Flow 3 — Claim Credibility Lifecycle

```
Reader highlights sentence
       │
       ▼
POST /api/posts/:id/claims ──────► Save claim with text + position
       │
       ▼
Other readers see claim in sidebar
       │
       ▼
POST /api/posts/:id/claims/:claimId/vote
       │                                │
       │                    Add vote: "verified" / "misleading" / "needs_source"
       │                                │
       │                                ▼
       │                    credibilityService.js recalculates:
       │                    - If >70% votes are "verified" → claim = verified
       │                    - If >30% votes are "misleading" → claim = misleading
       │                                │
       │                                ▼
       │                    Recalculate overall post badge:
       │                    - All claims verified → ✅ Verified
       │                    - Any claim misleading → ⚠️ Disputed
       │                    - No claims yet → ❔ Unverified
       │
       ▼
Author gets notified → can respond with source
```

---

## 🖥️ PAGE-BY-PAGE BREAKDOWN

### Page 1 — Landing / Home Page
```
┌──────────────────────────────────────────┐
│  Navbar [Logo] [Search] [Login/Register] │
├──────────────────────────────────────────┤
│                                          │
│  🔥 Trending Posts (sorted by views +    │
│     consensus scores)                    │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │PostCard│ │PostCard│ │PostCard│        │
│  │+ badge │ │+ badge │ │+ badge │        │
│  │+ bars  │ │+ bars  │ │+ bars  │        │
│  └────────┘ └────────┘ └────────┘        │
│                                          │
│  📝 Recent Posts                         │
│  [Tag filters: Tech | Life | Opinion]    │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │........│ │........│ │........│        │
│  └────────┘ └────────┘ └────────┘        │
│                                          │
│  [Pagination: < 1 2 3 >]                │
└──────────────────────────────────────────┘
```

### Page 2 — Single Post View (THE CORE PAGE)
```
┌──────────────────────────────────────────────────────────────┐
│  Navbar                                                      │
├──────────────────────────────────────┬───────────────────────┤
│                                      │                       │
│  📰 Post Title                       │  📋 Claims Panel     │
│  Author • Date • ✅ Credibility      │                       │
│  [Tech] [JavaScript]                 │  Claim 1: "React is  │
│                                      │  the fastest..."      │
│  ┌─ Paragraph 1 ──────────────┐     │  ✅ 12  ⚠️ 3  ❔ 5   │
│  │ Text here...        😂 ❤️  │     │  [Vote] [Source]      │
│  │ ░░░░░░░ (heatmap bg)      │     │                       │
│  └────────────────────────────┘     │  Claim 2: "MongoDB    │
│                                      │  scales infinitely"   │
│  ┌─ Paragraph 2 ──────────────┐     │  ✅ 2  ⚠️ 8  ❔ 4    │
│  │ Text here...        👍 😮  │     │  [Vote] [Source]      │
│  │ ████████ (hot! heatmap)    │     │                       │
│  └────────────────────────────┘     │                       │
│                                      │                       │
│  ┌─ Paragraph 3 ──────────────┐     │                       │
│  │ Text here...               │     │                       │
│  │ ░░ (cool heatmap)         │     │                       │
│  └────────────────────────────┘     │                       │
│                                      │                       │
│  ─── Consensus Meters ───            │                       │
│  Mind-changing  ████░░░░░ 4.2        │                       │
│  Originality    ███████░░ 7.1        │                       │
│  Clarity        ████████░ 8.4        │                       │
│  [Submit My Rating]                  │                       │
│                                      │                       │
│  ─── Comments ───                    │                       │
│  💬 Comment 1...                     │                       │
│  💬 Comment 2...                     │                       │
│                                      │                       │
├──────────────────────────────────────┴───────────────────────┤
│  Footer                                                      │
└──────────────────────────────────────────────────────────────┘
```

### Page 3 — Author Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  Navbar                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 Author Name           📊 Overall Stats                  │
│  "Software Developer"     Posts: 12 | Views: 4,280          │
│                           Avg Consensus: 7.2/10             │
│                                                              │
│  ┌─ 🧠 AI Writing Insights Card ────────────────────────┐   │
│  │  Based on your last 12 posts                          │   │
│  │                                                        │   │
│  │  🔥 What's working                                    │   │
│  │  → Your tech posts get 4x more engagement             │   │
│  │  → Casual tone → avg 7.8 consensus                    │   │
│  │                                                        │   │
│  │  💡 For your next post                                │   │
│  │  → Write about a tech topic with your casual voice    │   │
│  │  → Your best posts are under 800 words                │   │
│  │  → Posting on weekends gets 2x views                  │   │
│  │                                                        │   │
│  │  [🔄 Refresh Insights]                                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ 📊 Tone Performance Chart ──┐  ┌─ Emoji Heatmap ────┐  │
│  │  Casual:    ████████ 7.8/10  │  │  Your most reacted  │  │
│  │  Technical: ██████░░ 6.1/10  │  │  paragraphs across  │  │
│  │  Humorous:  █████████ 8.9/10 │  │  all posts          │  │
│  │  Formal:    ███░░░░░ 3.2/10  │  │                     │  │
│  └──────────────────────────────┘  └─────────────────────┘  │
│                                                              │
│  📝 My Posts                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Title          Views  Consensus   Credibility  Date  │   │
│  │ "Why React..."  1240   8.1/10      ✅           Jan  │   │
│  │ "My Morning..."  340   5.2/10      ❔           Feb  │   │
│  │ "AI is Not..."   890   7.4/10      ⚠️           Mar  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Page 4 — Admin Panel
```
┌──────────────────────────────────────────┐
│  Navbar [Admin Badge]                    │
├──────────────────────────────────────────┤
│                                          │
│  📊 Platform Stats                       │
│  Users: 145 | Posts: 312 | Comments: 890│
│                                          │
│  👥 User Management                      │
│  [Search users...]                       │
│  Name    | Role   | Posts | [Actions]    │
│  Alice   | user   | 12    | [Make Admin] │
│  Bob     | user   | 8     | [Delete]     │
│                                          │
│  🚩 Flagged Content                      │
│  Disputed claims needing review          │
│  Reported comments                       │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🔧 TECH STACK SUMMARY

```
FRONTEND
├── React 18 (with Vite)
├── React Router v6 (routing)
├── Axios (HTTP client)
├── React Context API (auth state)
├── Tailwind CSS (styling)
├── React Quill or TipTap (rich text editor)
├── Recharts (charts for insights dashboard)
└── Browser Selection API (text highlighting for claims)

BACKEND
├── Node.js
├── Express.js
├── Mongoose (MongoDB ODM)
├── bcryptjs (password hashing)
├── jsonwebtoken (JWT auth)
├── express-validator (input validation)
├── cors (cross-origin)
├── dotenv (environment variables)
└── axios (for AI API calls from backend)

DATABASE
├── MongoDB (Atlas cloud or local)
└── 8 Collections (users, posts, comments, consensusratings,
    paragraphreactions, claims, authorinsights, readingprogress)

EXTERNAL API
└── Anthropic Claude API or OpenAI API (tone analysis + insight generation)
```

---

## 🔐 AUTH FLOW DETAIL

```
┌─────────┐    POST /register     ┌─────────┐    bcrypt.hash()    ┌─────────┐
│  Client  │ ──────────────────► │  Server  │ ──────────────────► │ MongoDB │
│          │    {name,email,pwd}  │          │    Save hashed pwd  │         │
│          │ ◄────────────────── │          │ ◄────────────────── │         │
│          │    { success }       │          │    { user doc }     │         │
└─────────┘                      └─────────┘                      └─────────┘

┌─────────┐    POST /login        ┌─────────┐    Find user         ┌─────────┐
│  Client  │ ──────────────────► │  Server  │ ──────────────────► │ MongoDB │
│          │    {email, pwd}      │          │    bcrypt.compare()  │         │
│          │ ◄────────────────── │          │ ◄────────────────── │         │
│          │    { JWT token }     │          │    { user doc }     │         │
└─────────┘                      └─────────┘                      └─────────┘
       │
       │  Store token in localStorage
       │
       ▼
┌─────────┐    GET /api/posts     ┌─────────┐
│  Client  │ ──────────────────► │  Server  │
│          │    Header:           │          │
│          │    Authorization:    │  authMiddleware:
│          │    Bearer <token>    │  jwt.verify(token)
│          │ ◄────────────────── │  req.user = decoded
│          │    { posts data }   │          │
└─────────┘                      └─────────┘
```

---

## 📦 NPM PACKAGES

### Backend `package.json`
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express-validator": "^7.0.0",
    "axios": "^1.6.0",
    "multer": "^1.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Frontend `package.json`
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.6.0",
    "react-quill": "^2.0.0",
    "recharts": "^2.10.0",
    "tailwindcss": "^3.4.0",
    "react-icons": "^4.12.0",
    "react-hot-toast": "^2.4.0"
  }
}
```

---

## 🌐 ENVIRONMENT VARIABLES

```env
# server/.env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/blogdb
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
AI_API_KEY=sk-ant-xxxxx          # Anthropic API key
AI_API_URL=https://api.anthropic.com/v1/messages
NODE_ENV=development
```

---

## 🏃 HOW TO RUN

```bash
# Clone the repo
git clone https://github.com/your-team/blog-management-system.git

# Backend
cd server
npm install
npm run dev          # starts nodemon on port 5000

# Frontend (new terminal)
cd client
npm install
npm run dev          # starts Vite on port 5173
```

---

## 🎯 WHAT MAKES THIS PROJECT STAND OUT

| What Others Build | What You Build |
|---|---|
| Like button (binary) | Consensus meters (nuanced multi-dimensional feedback) |
| Comments section | Claims system (sentence-level fact checking with community voting) |
| Basic post view | Paragraph-level emoji heatmap (visual engagement layer) |
| No analytics | AI-powered writing coach based on personal post history |
| Generic blog CRUD | Trust-aware publishing platform with credibility badges |

This is not "another blog system." This is a platform where **content quality is visible, measurable, and improvable.**
