import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app";

describe("Auth API", () => {

  it("should register user", async () => {

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Raunak",
        email: "raunak@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should login user", async () => {

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "raunak@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

});