const express    = require( 'express' );
const bodyParser = require( 'body-parser' );
const jwt        = require( 'jsonwebtoken' );
const router     = express.Router();
const config     = require( './config' );
const tokenList  = {};
const app        = express();

const insertUser = ( name, email ) => {
  return new Promise(
    ( resolve, reject ) => {
      if ( name && email ) {
        const user = {
          name,
          email
        };

        resolve( user );
      }
      else {
        reject();
      }
    }
  )
};

const getUser = ( name, email ) => {
  return new Promise(
    ( resolve, reject ) => {
      if ( name && email ) {
        const user = {
          name,
          email
        };

        resolve();
      }
      else {
        reject();
      }
    }
  )
};

router.get(
  '/',
  ( req, res ) => {
    res.send( 'OKAY' );
  }
);

router.post(
  '/signup',
  ( req, res ) => {
    const { name, email } = req.body;
    getUser( name, email ).
      then(
        user => {

          if ( user ) {
            return res.send( 'okay' )
          }
          else {
            return insertUser( name, email );
          }
        }
      ).
      then(
        newUser => { console.log( newUser ); return res.send( newUser ) }
      ).
      catch( err => {console.log( "error" ); res.send( err )} )
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
        expiresIn: config.refreshTokenLife
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
const PORT = config.port || process.env.port || 300;
app.listen(
  PORT,
  () => {
    console.log( `*frasier crane voice* Hello localhost:${ PORT }. I'm listening.` );
  }
);
