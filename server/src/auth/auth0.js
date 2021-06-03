/** Middleware that utilizes auth0 for request token auth
 * @module Auth0 */

import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";

/**
 * Middleware that is utilized when authenticating requests
 * reference: https://auth0.com/docs/quickstart/backend/nodejs
 */ 
const auth0 = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.AUTH0_DOMAIN + ".well-known/jwks.json"
    }),
  
    // Validate the audience and the issuer.
    audience: process.env.AUTH0_CLIENT_ID,
    issuer: [process.env.AUTH0_DOMAIN],
    algorithms: ['RS256']
});

export default auth0;