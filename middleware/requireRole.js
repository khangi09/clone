const jwt = require('jsonwebtoken');

function requireRole(role) {
  return (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ error: 'Not authenticated' });
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.role !== role) return res.status(403).json({ error: 'Forbidden' });
      req.user = { id: payload.sub, role: payload.role };
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

module.exports = requireRole;
