const req = require("supertest");
const app = require("../app");
const { Review, Author } = require("../models");
const { test, describe, expect, beforeAll, afterAll } = require("@jest/globals");
const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");

jest.mock('cloudinary');
jest.mock('@google/generative-ai');

beforeAll(async () => {
  // Setup test data
  const authors = [
    {
      username: "testuser@gmail.com",
      password: "password",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await Author.bulkCreate(authors);

  const review = [
    {
      name: "Test Hotel",
      rate: 4.5,
      address: "123 Test St",
      review: "Great place!",
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await Review.bulkCreate(review);
});

afterAll(async () => {
  // Clean up database
  await Review.destroy({ truncate: true, cascade: true, restartIdentity: true });
  await Author.destroy({ truncate: true, cascade: true, restartIdentity: true });
});

describe("ReviewController", () => {

  describe("GET /review", () => {
    test("Success Read Review", async () => {
      const res = await req(app).get("/review");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Success Read Review");
      expect(res.body).toHaveProperty("reviewed", expect.any(Array));
    });
  });

  describe("POST /review", () => {
    beforeAll(() => {
      // Mock Cloudinary upload stream function
      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(null, { secure_url: "http://cloudinary.com/testimage.jpg" });
      });
    });

    test("Success Add Review", async () => {
      const data = {
        name: "New Hotel",
        rate: 4.0,
        address: "456 New St",
        review: "Very comfortable!",
        authorId: 1
      };

      const res = await req(app)
        .post("/review")
        .field("name", data.name)
        .field("rate", data.rate)
        .field("address", data.address)
        .field("review", data.review)
        .field("authorId", data.authorId);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Success Add Review");
      expect(res.body.reviewed).toHaveProperty("image", "http://cloudinary.com/testimage.jpg");
    });

    test("Failed Add Review: Unauthorized", async () => {
      const data = {
        name: "Unauthorized Hotel",
        rate: 3.0,
        address: "789 Unauthorized St",
        review: "Not so good.",
        authorId: null // Invalid user
      };

      const res = await req(app)
        .post("/review")
        .field("name", data.name)
        .field("rate", data.rate)
        .field("address", data.address)
        .field("review", data.review);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", expect.any(String));
    });
  });

  describe("GET /review/:id", () => {
    test("Success Read Review Detail", async () => {
      const res = await req(app).get("/review/1");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Success read Review with id 1");
      expect(res.body).toHaveProperty("reviewed", expect.any(Object));
    });

    test("Failed Read Review Detail: Not Found", async () => {
      const res = await req(app).get("/review/999");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", expect.any(String));
    });
  });

  describe("DELETE /review/:id", () => {
    test("Success Delete Review", async () => {
      const res = await req(app).delete("/review/1");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Success Delete Review with id 1");
    });

    test("Failed Delete Review: Not Found", async () => {
      const res = await req(app).delete("/review/999");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", expect.any(String));
    });
  });

  describe("PUT /review/:id", () => {
    beforeAll(() => {
      // Mock Cloudinary upload stream function for update
      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(null, { secure_url: "http://cloudinary.com/updatedimage.jpg" });
      });
    });

    test("Success Edit Review", async () => {
      const data = {
        name: "Updated Hotel",
        rate: 4.5,
        address: "123 Updated St",
        review: "Much better!",
        authorId: 1
      };

      const res = await req(app)
        .put("/review/1")
        .field("name", data.name)
        .field("rate", data.rate)
        .field("address", data.address)
        .field("review", data.review)
        .field("authorId", data.authorId);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Success Update Review with id 1");
    });

    test("Failed Edit Review: Not Found", async () => {
      const data = {
        name: "Nonexistent Hotel",
        rate: 3.5,
        address: "Unknown St",
        review: "No update."
      };

      const res = await req(app)
        .put("/review/999")
        .field("name", data.name)
        .field("rate", data.rate)
        .field("address", data.address)
        .field("review", data.review);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", expect.any(String));
    });
  });

  describe("POST /gemini", () => {
    test("Success Gemini AI Recommendation", async () => {
      const data = {
        harga: "500000",
        lokasi: "Jakarta"
      };

      // Mock GoogleGenerativeAI generateContent method
      const genAI = require('@google/generative-ai');
      genAI.GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: () => ({
            response: {
              text: () => `
                1. Hotel A - 450000 Rupiah: A luxurious stay in the heart of Jakarta.
                2. Hotel B - 400000 Rupiah: Comfortable and affordable accommodation.
                3. Hotel C - 550000 Rupiah: Premium service at a prime location.
              `
            }
          })
        })
      }));

      const res = await req(app).post("/gemini").send(data);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Success");
      expect(res.body).toHaveProperty("data", expect.any(String));
    });

    test("Failed Gemini AI Recommendation: Missing Key", async () => {
      const res = await req(app).post("/gemini").send({});
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", expect.any(String));
    });
  });
});

