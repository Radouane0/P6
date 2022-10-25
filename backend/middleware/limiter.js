const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15*60*1000,
  max: 3,
  message: "Trop de demandes ont été faites depuis cette IP, veuillez réessayer dans 15 minutes."
});

module.exports = limiter;