const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, server } = require("../app");
const User = require("../src/models/employee.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

chai.use(chaiHttp);
const { expect } = chai;

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect("mongodb://localhost:27017/test_db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected for tests");
  }

  if (!server.listening) {
    await new Promise((resolve) => {
      server.listen(3000, () => {
        console.log("🚀 Serveur lancé pour les tests !");
        resolve();
      });
    });
  }
});

after(async () => {
  await mongoose.disconnect();
  if (server.listening) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe("POST /api/auth/login", () => {
  // let hashedPassword;

  // before(async () => {
  //   hashedPassword = await bcrypt.hash("password", 10);
  // });

  beforeEach(async () => {
    try {
      await User.deleteOne({ email: "john@example.com" });
      await User.create({
        name: "John",
        email: "john@example.com",
        role: "admin",
        phone: "123456789",
        password: "password",
      });
      console.log("User created:", await User.findOne({ email: "john@example.com" }));
    } catch (error) {
      console.error("Error in beforeEach:", error);
      throw error;
    }
  }).timeout(5000);

  it("✅ Devrait connecter un utilisateur valide", async () => {
    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "password"
      });
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("token");
  });

  it("❌ Devrait échouer avec un mauvais mot de passe", async () => {
    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "wrongpassword"
      });
  
    expect(res).to.have.status(401);
    expect(res.body).to.have.property("message");
  });

  it("❌ Devrait échouer si utilisateur inexistant", async () => {
    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send({
        email: "notfound@example.com",
        password: "password",
      });
    expect(res).to.have.status(404);
    // expect(res.body).to.have.property("message", "Utilisateur non trouvé");
  });
});