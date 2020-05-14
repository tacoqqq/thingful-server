const bcrypt = require('bcryptjs')
const xss = require('xss')
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const userService = {

    sanitizedContent(userInfo){
        return sanitizedUserInfo = {
            id: userInfo.id,
            full_name: xss(userInfo.full_name),
            user_name: xss(userInfo.user_name),
            nick_name: xss(userInfo.nickname),
            created_date: userInfo.created_date
        }
    },

    insertUser(db,userInfo){
        return db('thingful_users')
            .insert(userInfo)
            .returning('*')
            .then(userRow => userRow[0])
    },

    hashPassword(password){
        return bcrypt.hash(password,12)
    },

    hasSameUsername(db,username){
        return db('thingful_users')
            .where('user_name', username)
            .first()
            .then(res => !!res)
    },

    passwordValidation(password){
        if (password.length < 8) {
            return res.status(400).json({error: `Password must be longer than 8 characters!`})
        }

        if (password.length > 72){
            return res.status(400).json({error: `Password must be less than 72 characters!`})
        }

        if (password.startsWith(' ') || password.endsWith(' ')){
            return res.status(400).json({error: `Password cannot start with or end with white spaces`})
        }

        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)){
            return res.status(400).json({error: `Password must contain 1 upper case, lower case, number and special character`})
        }
    }
}

module.exports = userService