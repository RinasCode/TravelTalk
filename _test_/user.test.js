const req = require("supertest");
const app = require("../app");
const { Author } = require("../models");
const { hash } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");
const { test, describe, expect, beforeAll, afterAll } = require("@jest/globals");

beforeAll(async () => {
  const users = [
    {
      username: "testuser@gmail.com",
      password: hash("sebuah_rahasia"),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  await Author.bulkCreate(users);
});

afterAll(async () => {
  await Author.destroy({ truncate: true, cascade: true, restartIdentity: true });
});

describe("UserController", () => {

  describe("POST /login", () => {
    test("Success Login", async () => {
      const data = {
        email: "testuser@gmail.com",
        password: "sebuah_rahasia"
      };
      const res = await req(app).post("/login").send(data);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("access_token", expect.any(String));
    });

    test("Login Error: Invalid email or password", async () => {
      const data = {
        email: "wronguser@gmail.com",
        password: "wrongpassword"
      };
      const res = await req(app).post("/login").send(data);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", expect.any(String));
    });
  });

  describe("POST /googleLogin", () => {
    test("Success Google Login", async () => {
      const token = createToken({ id: 1, email: "testuser@gmail.com" });
      const res = await req(app).post("/googleLogin").set("token", token);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("access_token", expect.any(String));
    });

    test("Google Login Error: Invalid Token", async () => {
      const token = "invalidToken";
      const res = await req(app).post("/googleLogin").set("token", token);
      expect(res.status).toBe(500); // Status dapat berubah tergantung dari error handling yang dilakukan
      expect(res.body).toHaveProperty("message", expect.any(String));
    });
  });

  describe("POST /users", () => {
    test("Success Create New User", async () => {
      const data = {
        name: "New User",
        email: "newuser@gmail.com",
        password: "newpassword"
      };
      const res = await req(app).post("/users").send(data);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Success Create New User");
    });

    test("Create User Error: Missing fields", async () => {
      const data = {
        email: "newuser@gmail.com",
        password: "newpassword"
      };
      const res = await req(app).post("/users").send(data);
      expect(res.status).toBe(400); // Status dapat berubah tergantung dari error handling yang dilakukan
      expect(res.body).toHaveProperty("message", expect.any(String));
    });
  });

});
