const patterns = {
  username: /^[A-Za-z0-9_\-\.]{3,30}$/,
  password: /^\S{8,128}$/,
  amount: /^\d{1,12}(\.\d{1,2})?$/
};

function validate(field, regex) { return regex.test(field); }

exports.globalWhitelist = (req, res, next) => {
  const b = req.body || {};
  if (b.username && !validate(b.username, patterns.username)) return res.status(400).json({ error: 'Invalid username' });
  if (b.password && !validate(b.password, patterns.password)) return res.status(400).json({ error: 'Invalid password' });
  if (b.amount && !validate(String(b.amount), patterns.amount)) return res.status(400).json({ error: 'Invalid amount' });
  next();
};
