const req = require("supertest");
const app = require("../app");
const { hash } = require("../helpers/bcrypt");
const { Author } = require("../models");
const { test, describe, expect, beforeAll, afterAll } = require("@jest/globals");

beforeAll(async () => {
    // Seed the database with initial user data
    const users = [
        {
            name: "Rina",
            email: "rina@mail.com",
            password: hash("12345"),
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    await Author.bulkCreate(users);
});

afterAll(async () => {
    // Clean up database after tests
    await Author.destroy({ truncate: true, cascade: true, restartIdentity: true });
});

describe("UserController - POST /login", () => {
    describe("POST /login - Success", () => {
        test("Should return a 200 status and an access token", async () => {
            const data = {
                email: "rina@mail.com",
                password: "12345",
            };
            const res = await req(app).post("/login").send(data);
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty("access_token", expect.any(String));
            expect(res.body).toHaveProperty("message", `Success Login with ${data.email}`);
        });
    });

    describe("POST /login - Failed", () => {
        test("Should return 400 when email is undefined", async () => {
            const data = {
                email: "",
                password: "12345",
            };
            const res = await req(app).post("/login").send(data);
            expect(res.status).toBe(400);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty("message", expect.any(String));
        });

        test("Should return 400 when password is undefined", async () => {
            const data = {
                email: "rina@mail.com",
                password: "",
            };
            const res = await req(app).post("/login").send(data);
            expect(res.status).toBe(400);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty("message", expect.any(String));
        });

        test("Should return 401 when email is not found", async () => {
            const data = {
                email: "unknown@mail.com",
                password: "12345",
            };
            const res = await req(app).post("/login").send(data);
            expect(res.status).toBe(401);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty("message", expect.any(String));
        });

        test("Should return 401 when password is incorrect", async () => {
            const data = {
                email: "rina@mail.com",
                password: "wrongpassword",
            };
            const res = await req(app).post("/login").send(data);
            expect(res.status).toBe(401);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty("message", expect.any(String));
        });
    });
});

describe("UserController - POST /register", () => {
    test("Should create a new user and return a 201 status", async () => {
        const data = {
            name: "John Doe",
            email: "john@mail.com",
            password: "12345",
        };
        const res = await req(app).post("/register").send(data);
        expect(res.status).toBe(201);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body).toHaveProperty("message", "Success Create New User");

        // Verify the user was created in the database
        const user = await Author.findOne({ where: { email: data.email } });
        expect(user).not.toBeNull();
        expect(user.name).toBe(data.name);
        expect(user.email).toBe(data.email);
    });

    test("Should return 400 when email is missing", async () => {
      const data = {
          name: "Jane Doe",
          password: "12345",
      };
      const res = await req(app).post("/register").send(data);
      expect(res.status).toBe(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual(expect.arrayContaining(["Email is required"]));
  });
  
  test("Should return 400 when password is missing", async () => {
      const data = {
          name: "Jane Doe",
          email: "jane@mail.com",
      };
      const res = await req(app).post("/register").send(data);
      expect(res.status).toBe(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual(expect.arrayContaining(["Password is required"]));
  });
  
});
