const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, server } = require("../../app");
const User = require("../models/employee.model");
const bcrypt = require("bcryptjs");

chai.use(chaiHttp);
const { expect } = chai;

before(async () => {
  if (!server.listening) {
    // Démarrer le serveur uniquement s'il n'est pas déjà en cours d'exécution
    await new Promise((resolve) => {
      server.listen(3000, () => {
        console.log("🚀 Serveur lancé pour les tests !");
        resolve();
      });
    });
  }
});

describe("POST /api/auth/login", () => {
  let hashedPassword;

  before(async () => {
    hashedPassword = await bcrypt.hash("password", 10);
  });

  beforeEach(async () => {
    await User.deleteOne({ email: "john@example.com" });
    await User.create({
      name: "John",
      email: "john@example.com",
      role: "admin",
      phone: "123456789",
      password: hashedPassword, // Réutilisation du hash fixe
    });
  });

  it("✅ Devrait connecter un utilisateur valide", async () => {
    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "password",
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
        password: "wrongpassword",
      });

    expect(res).to.have.status(401);
    expect(res.body).to.have.property("message", "Email ou mot de passe incorrect");
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
    expect(res.body).to.have.property("message", "Utilisateur non trouvé");
  });
});
