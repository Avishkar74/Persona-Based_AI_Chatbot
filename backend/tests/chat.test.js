import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { createApp } from "../server.js";

const mockClient = {
  chat: {
    completions: {
      create: async () => ({
        choices: [{ message: { content: "Test reply" } }],
      }),
    },
  },
};

test("POST /chat returns 400 when message is missing", async () => {
  const app = createApp({ client: mockClient });
  const response = await request(app).post("/chat").send({ persona: "kshitij" });
  assert.equal(response.status, 400);
  assert.match(response.body.error, /Message is required/);
});

test("POST /chat returns 400 when persona is unknown", async () => {
  const app = createApp({ client: mockClient });
  const response = await request(app)
    .post("/chat")
    .send({ persona: "unknown", message: "Hello" });
  assert.equal(response.status, 400);
  assert.match(response.body.error, /Unknown persona/);
});

test("POST /chat returns reply for valid request", async () => {
  const app = createApp({ client: mockClient });
  const response = await request(app)
    .post("/chat")
    .send({ persona: "kshitij", message: "Hello" });
  assert.equal(response.status, 200);
  assert.equal(response.body.reply, "Test reply");
});
