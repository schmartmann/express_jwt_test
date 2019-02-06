const express    = require( 'express' );
const bodyParser = require( 'body-parser' );
const jwt        = require( 'jsonwebtoken' );
const router     = express.Router();
const config     = require( './config' );
const tokenList  = {};
const app        = express();

router.get(
  '/',
  ( req, res ) => {
    res.send( 'OKAY' );
  }
);

//creating token
router.post(
  '/login',
  ( req, res ) => {
    const postData = req.body;
    const { name, email } = postData;
    const user = {
      name,
      email
    };

    const token = jwt.sign(
      user,
      config.secret,
      {
        expiresIn: config.tokenLife
      }
    );

    const refreshToken = jwt.sign(
      user,
      config.refreshTokenSecret,
      {
        expiresIn: config.refreshTokenLIfe
      }
    );

    const response = {
      "status": "Logged In",
      "token": token,
      "refreshToken": refreshToken
    };

    tokenList[ refreshToken ] = response;
    res.status( 200 ).json( response );
  }
);

//refreshing token if it exists
router.post(
  '/token',
  ( req, res ) => {
    const postData = req.body;
    const { refreshToken, email, name } = postData;

    if ( refreshToken && tokenList.includes( refreshToken ) ) {
      const user = {
        email,
        name
      };

      const token = jwt.sign(
        user,
        config.secret,
        {
          expiresIn: config.tokenLife
        }
      );

      const response = { token };

      tokenList[ refreshToken ].token = token;

      res.status( 200 ).json( response );
    }
    else {
      res.status( 404 ).send( 'Invalid request' );
    }
  }
);

router.use( require( './tokenChecker' ) );

router.get(
  '/secure',
  ( req, res ) => {
    res.send( 'Secure' );
  }
 );

app.use( bodyParser.json() );
app.use( '/api', router );
app.listen( config.port || process.env.port || 300 );
