const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const db = new sqlite3.Database('./mydb.sqlite');
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY, title TEXT, content TEXT, username TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS comments(id INTEGER PRIMARY KEY, postId INTEGER, name TEXT, FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE)');

  // Add indexes to speed up common queries
  db.run('CREATE INDEX IF NOT EXISTS idx_posts_username ON posts(username)');
  db.run('CREATE INDEX IF NOT EXISTS idx_comments_postId ON comments(postId)');
  // (No FTS table: we keep B-Tree indexes for username and postId)
});

// ==================== GET CALLS ==================== //

// Get all posts
app.get('/posts', (req, res) => {
  console.log("Get Called")
  db.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log(rows)
    res.json(rows);
  });
});

// Get post by id
app.get('/posts/post/:id', (req, res) => {
  console.log("Get Post Called")
  db.all('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log(row)
    res.json(row);
  });
});

// // Get post by search
// app.get('/posts/search/:query', (req, res) => {
//   const searchTerm = req.params.query;
//   // Simple LIKE-based search (keeps implementation small and portable)
//   function escapeLike(s) {
//     return s.replace(/[\\%_]/g, match => '\\' + match); // backslash escape
//   }
//   const q = req.params.query;
//   const p = '%' + escapeLike(q) + '%';
//   db.all('SELECT * FROM posts WHERE title LIKE ? ESCAPE \'\\\' OR username LIKE ? ESCAPE \'\\\'', [p, p], (err, row) => {
//     if (err) return res.status(500).json({ error: err.message });
//     console.log(row)
//     res.json(row);
//   });
// });

// Get post by search using query parameter (safer for raw input like '%')
app.get('/posts/search', (req, res) => {
  const q = String(req.query.q || '');
  // Limit length to avoid abuse
  const searchTerm = q.length > 200 ? q.slice(0, 200) : q;
  db.all('SELECT * FROM posts WHERE title LIKE ? OR username LIKE ?', [`%${searchTerm}%`, `%${searchTerm}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Gets comments for a certain post
app.get('/comments/:id', (req, res) => {
  console.log("Get Comments Called");
  db.all('SELECT * FROM comments WHERE postId = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log(row)
    res.json(row);
  });
});

// ==================== POST CALLS ==================== //

// Adds new post to the posts table
app.post('/posts', (req, res) => {
  console.log("Post a Post Called");
  const { title, content, username } = req.body;
  db.run('INSERT INTO posts(title, content, username) VALUES(?, ?, ?)', [title, content, username], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Adds new comment to the comments table
app.post('/comments', (req, res) => {
  console.log("GetPost Comment Called");
  const { name, postId } = req.body;
  db.run('INSERT INTO comments(postId, name) VALUES(?, ?)', [postId, name], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name });
  });
});

// ==================== DELETE CALLS ==================== //

// Deletes a post by id
app.delete('/posts/:id', (req, res) => {
  console.log("Delete Post  Called");
  const id = req.params.id;
  db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id });
  });
});

// Deletes a comment by id
app.delete('/comments/:id', (req, res) => {
  console.log("Delete Comment Called");
  const id = req.params.id;
  db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, id });
  });
});

// Deletes comments by postId
app.delete('/posts/comments/:id', (req, res) => {
  console.log("Delete Comments by Post Called");
  const id = req.params.id;
  db.run('DELETE FROM comments WHERE postId = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, id });
  });
});

// ==================== PUT CALLS ==================== //

// Update an existing post
// app.put('/posts/:id', (req, res) => {
//   console.log("Update Post Called");
//   const { content } = req.body;
//   const id = req.params.id;
//   db.run(
//     'UPDATE posts SET content = ? WHERE id = ?',
//     [content, id],
//     function (err) {
//       if (err) return res.status(500).json({ error: err.message });

//       if (this.changes === 0) {
//         return res.status(404).json({ message: 'Post not found' });
//       }

//       res.json({ message: 'Post updated successfully', id });
//     }
//   );
// });

// Append to an existing post instead of replacing it
app.put('/posts/:id', (req, res) => {
  console.log("Update Post Called (append mode)");
  const { content } = req.body;
  const id = req.params.id;

  // Step 1: Get the existing content
  db.get('SELECT content FROM posts WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existing = row.content || "";
    const updatedContent = existing + content;  
    // Or use `existing + "\n" + content` if you want spacing

    // Step 2: Update with appended content
    db.run(
      'UPDATE posts SET content = ? WHERE id = ?',
      [updatedContent, id],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        res.json({ 
          message: 'Post updated (appended) successfully', 
          id 
        });
      }
    );
  });
});


app.listen(3000, () => console.log('Backend running on http://localhost:3000'));
