const express = require('express')
const AuthService = require('./auth-service')
const authRouter = express.Router()
const bodyParser = express.json()


authRouter
    .route('/')
    .post(bodyParser, (req,res,next) => {
        const { user_name, password } = req.body
        const loginUser = { user_name, password }

        //verify if lack user_name or password in request
        for (const [key,value] of Object.entries(loginUser))
            if (value == null) {
                return res.status(400).json(`Missing ${key} in the request`)
            }
        
        //verify if username is in database
        AuthService.getUserWithUserName(
            req.app.get('db'),
            loginUser.user_name
        )
            .then(user => {
                if (!user) {
                    return res.status(400).json({error: 'Incorrect username or password'})
                }
        //username found, verify if password is also correct
                AuthService.comparePasswords(loginUser.password, user.password)
                    .then(passwordMatch => {
                        if(!passwordMatch) {
                            return res.status(400).json({error: 'Incorrect username or password'})
                        }
        //password also correct, grant JWT 
                        const payload = { user_id: user.id }
                        const sub = user.user_name
                        const authToken = AuthService.createJwt(sub,payload)
                        res.send({ authToken: authToken })
                    })
                    .catch(next)
            })
            .catch(next)
    })


module.exports = authRouter