const AuthService = require('../auth/auth-service')
const bcrypt = require('bcryptjs')

function requireAuth(req,res,next){
    const authToken = req.get('Authorization') || '' //'Basic f3819ejfaksdlf831r'
    
    let basicToken

    //check for basic token
    if (!authToken.toLowerCase().startsWith('basic ')){
        return res.status(401).json({error: 'Missing basic token'})
    } else {
        basicToken = authToken.slice('Basic '.length , authToken.lengh) // f3819ejfaksdlf831r
    }

    //check for username and password: turn f3819ejfaksdlf831r to 'username:password' format
    const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken)

    if (!tokenUserName || !tokenPassword) {
        return res.status(401).json({error: `Unauthorized request`})
    }

    //check if user exists in database 
    AuthService.getUserWithUserName(
        req.app.get('db'),
        tokenUserName
    )
        .then(user => {
            if (!user){
                return res.status(401).json({error: `Unauthorized request`})
            }
    //and if password is correct

            return bcrypt.compare(tokenPassword,user.password)
                .then(passwordMatch => {
                    if (!passwordMatch){
                        return res.status(401).json({error: `Unauthorized request`})
                    }

                    req.user = user
                    next()
                })
        })
        .catch(next)
}

module.exports = { requireAuth }