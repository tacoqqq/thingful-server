const express = require('express')
const path = require('path')
const userService = require('./users-service')

const userRouter = express.Router()
const bodyParser = express.json()

userRouter
    .route('/')
    .post(bodyParser, (req,res,next) => {
       const { user_name, password, full_name, nick_name = '' } = req.body
       const newUser = { user_name, password, full_name }
    
       //check if includes necessary info in request body
       for (const [ key , value ] of Object.entries(newUser))
            if (value == null) {
                return res.status(400).json({error: `Missing ${key} in request body`})
            }
        
        //verify password
        const passwordError = userService.passwordValidation(password)

        if (passwordError) {
            return res.status(400).json({error: passwordError})
        }

        //check if same username registered   
        userService.hasSameUsername(
            req.app.get('db'),
            user_name
            )
            .then(hasSameUsername => {
                if (hasSameUsername) {  
                    return res.status(400).json({error: `Username has already taken`})
                }
            
                //hash password and then insert into database
                userService.hashPassword(password)
                    .then(hashedPassword => {
                        newUserInfoToBeInserted = {
                            user_name: user_name,
                            full_name: full_name,
                            password: hashedPassword,
                            nickname: nick_name,
                            date_created: new Date()
                        } 

                        userService.insertUser(
                            req.app.get('db'),
                            newUserInfoToBeInserted
                            )
                            .then(insertedUserRes => {
                                return res.status(201)
                                    .location(path.posix.join(req.originalUrl, `/${insertedUserRes.id}`))
                                    .json(userService.sanitizedContent(insertedUserRes))
                            })
                            .catch(next)
                    })
                .catch(next)
            })
    })


module.exports = userRouter