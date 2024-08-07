const { verifyToken } = require("../helpers/jwt");
const { Author } = require("../models")

async function authentication(req, res, next){
    try {

        const {authorization} = req.headers

        // console.log(authorization, "<,<<<<<>>>>>>>>>>");

        if(!authorization) throw {name: "Unauthorized"}

        const access_token = authorization.split(" ")[1]
        // console.log(access_token);

        const payload = verifyToken(access_token)

        // console.log(payload);

        const user = await Author.findOne({
            where: {
                email: payload.email
            }
        })
        // console.log(user);
        
        if(!user) throw {name: "Unauthorized"}

        req.loginInfo = {
            userId: user.id,
            email: user.email,
        }
        // console.log(req.loginInfo)
        next()
    } catch (error) {
        console.log(error)
        next(error)
    }
} 

module.exports = authentication