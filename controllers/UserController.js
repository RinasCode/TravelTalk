const { UPSERT } = require("sequelize/lib/query-types");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { Author } = require("../models");
const {OAuth2Client} = require('google-auth-library');
const { hash } = require("../helpers/bcrypt");

class UserController {
  static async googleLogin(req, res, next) {
    try {
        const { token } = req.headers

        const client = new OAuth2Client();

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        console.log(payload,"yuuhuuuuu menyaalaaaa");
        

        const [user, created] = await Author.findOrCreate({
            where: {
                email: payload.email
            },
            defaults: {
                name: payload.name,
                email: payload.email,
                password: hash("sebuah_rahasia")
            },
            hooks: false
        })

        const iniload = {
          id: user.id,
          email: user.email,
        };

        console.log(iniload)

        const access_token = signToken(iniload)

        res.status(200).json({ access_token })
    } catch (err) {
        console.log(err);
        next(err)
    }
}
  static async addUser(req, res, next) {
    try {
      // res.send("test")
      const { name, email, password} = req.body;
      const user = await Author.create({
        name,
        email,
        password
      });
      res.status(201).json({
        message: "Success Create New User",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw { name: "Bad Request" };

      const login = await Author.findOne({
        where: {
          email,
        },
      });
      // console.log(login);
      if (!login) throw { name: "Login Error" };

      const isPasswordValid = comparePassword(password, login.password);
      if (!isPasswordValid) throw { name: "Login Error" };

      // let data = await compare(password, login.password)
      // console.log(data);
      const payload = {
        id: login.id,
        email: login.email,
        role: login.role,
      };
      const access_token = signToken(payload);

      res.status(200).json({
        access_token,
        message: `Success Login with ${email}`,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = UserController;
