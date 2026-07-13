const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const users = require('../shared/users');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());

const sessions = {};

function requireAuth(req, res, next) {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
        return res.status(401).json({
            message: 'No session cookie. Please login first.'
        });
    }

    const session = sessions[sessionId];

    if (!session) {
        return res.status(401).json({
            message: 'Invalid or expired session. Please login again.'
        });
    }

    req.user = session;
    next();
}

function requireAdmin(req, res, next) {
    if (req.user.user.role !== 'admin') {
        return res.status(403).json({
            message: 'You do not have permission to access this resource.'
        });
    }

    next();
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        (item) => item.username === username && item.password === password
    );

    if (!user) {
        return res.status(401).json({
            message: 'Invalid username or password.'
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

    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 30
    });

    res.json({
        message: 'Login successful.',
        sessionIdForLearningOnly: sessionId
    });
});

app.get('/profile', requireAuth, (req, res) => {
    res.json({
        message: 'You are authenticated.',
        user: req.user
    });
});

app.get('/admin', requireAuth, requireAdmin, (req, res) => {
    res.json({
        message: 'You are authorized as admin.',
        user: req.user
    });
});

app.delete('/users', requireAuth, requireAdmin, (req, res) => {
    res.json({
        message: 'User deleted successfully.',
        user: req.user
    });
});

app.post('/logout', (req, res) => {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
        return res.status(400).json({
            message: 'No session cookie found.'
        });
    }

    delete sessions[sessionId];
    res.clearCookie('sessionId');

    res.json({
        message: 'Logout successful.'
    });
});

app.get('/debug-sessions', (req, res) => {
    res.json({ sessions });
});

app.listen(PORT, () => {
    console.log(`Lab 2 running on http://localhost:${PORT}`);
});
