const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// In-memory storage
// ใน Production ควรใช้ redis หรือ database แทน
const sessions = {}; // { sessionId: username }

// Mock user
const users = [
    {
        id: 1,
        username: 'admin',
        password: 'password', // ใน Production ควรเก็บ hashed password
        role: 'admin'
    }
];

// Middleware to check authentication
function requireAuth(req, res, next) {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
        return res.status(401).json({
            message: "No session cookie. Please login first.",
        });
    }

    const session = sessions[sessionId];

    if (!session) {
        return res.status(401).json({
            message: "Invalid or expired session. Please login again.",
        });
    }

    req.user = session;
    next();
}

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid username or password.",
        });
    }

    const sessionId = crypto.randomUUID();

    sessions[sessionId] = {
        user: {
            id: user.id,
            username: user.username,
            role: user.role
        },
        createdAt: Date.now()
    };

    res.cookie("sessionId", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // secure for production with HTTPS
        maxAge: 1000 * 60 * 30 // 30 hour
    });

    res.json({
        message: "Login successful.",
        sessionIdForLearningOnly: sessionId
    });
});

// Get profile route
app.get('/profile', requireAuth, (req, res) => {
    res.json({
        message: "You are authenticated.",
        user: req.user
    });
});

// Logout route
app.post('/logout', (req, res) => {
    const sessionId = req.cookies.sessionId;

    if (sessionId) {
        delete sessions[sessionId];
        res.clearCookie("sessionId");
        res.json({
            message: "Logout successful."
        });
    } else {
        res.status(400).json({
            message: "No session cookie found."
        });
    }
})

// Debug sessions
app.get('/debug-sessions', (req, res) => {
    res.json({
        sessions
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});