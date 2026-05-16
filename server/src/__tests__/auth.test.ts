import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app";

describe("Auth API", () => {

  it("should register user", async () => {

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Raunak",
        email: `raunak${Date.now()}@test.com`,
        password: "123456",
        role: "admin"
      });

    console.log("REGISTER RESPONSE:", res.body);

    expect(res.statusCode).toBe(201);

    expect(res.body.success).toBe(true);

  });

  it("should login user", async () => {

    const email = `login${Date.now()}@test.com`;

    // create user first
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email,
        password: "123456",
        role: "admin"
      });

    // login
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "123456"
      });

    console.log("LOGIN RESPONSE:", res.body);

    expect(res.statusCode).toBe(200);

    expect(res.body.token).toBeDefined();

  });

});