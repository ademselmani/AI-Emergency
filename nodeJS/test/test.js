const chai = require("chai");
const chaiHttp = require("chai-http"); // Add chai-http
const sinon = require("sinon");
const Employee = require("../src/models/employee.model");
const express = require("express");
const router = require("../src/routes/employeeRoute"); // Path to your employeeRoute.js
const should = chai.should();

// Extend Chai with chai-http
chai.use(chaiHttp);

// Create a mock Express app to test the router
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(router); // Mount the router

describe("Employee Route Unit Tests", () => {
  let server;

  before((done) => {
    server = app.listen(0, () => {
      // Use port 0 for a free port
      console.log("Test server running on port", server.address().port);
      done();
    });
  });

  afterEach(() => {
    sinon.restore(); // Reset stubs after each test
  });

  after((done) => {
    server.close(done); // Close the server after all tests
  });

  describe("GET /employees", () => {
    it("should return all employees except admins, sorted by role", (done) => {
      const mockEmployees = [
        { _id: "1", name: "John Doe", role: "doctor" },
        { _id: "2", name: "Jane Smith", role: "nurse" },
      ];
      sinon
        .stub(Employee, "find")
        .withArgs({ role: { $ne: "admin" } })
        .returns({
          sort: sinon.stub().withArgs({ role: 1 }).resolves(mockEmployees),
        });

      chai
        .request(app)
        .get("/employees")
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.should.deep.equal(mockEmployees);
          done();
        });
    });

    //   it("should return 500 on database error", (done) => {
    //     sinon.stub(Employee, "find").rejects(new Error("Database error"));

    //     chai
    //       .request(app)
    //       .get("/employees")
    //       .end((err, res) => {
    //         if (err) return done(err);
    //         res.should.have.status(500);
    //         res.body.should.have.property("message").equal("Database error");
    //         done();
    //       });
    //   });
    // });

    describe("GET /employees/:id", () => {
      it("should return an employee by ID", (done) => {
        const mockEmployee = { _id: "1", name: "John Doe", role: "doctor" };
        sinon.stub(Employee, "findById").withArgs("1").resolves(mockEmployee);

        chai
          .request(app)
          .get("/employees/1")
          .end((err, res) => {
            if (err) return done(err);
            res.should.have.status(200);
            res.body.should.deep.equal(mockEmployee);
            done();
          });
      });

      // it("should return 404 if employee not found", (done) => {
      //   sinon.stub(Employee, "findById").withArgs("1").resolves(null);

      //   chai
      //     .request(app)
      //     .get("/employees/1")
      //     .end((err, res) => {
      //       if (err) return done(err);
      //       res.should.have.status(404);
      //       res.body.should.have.property("message").equal("Employé non trouvé");
      //       done();
      //     });
      // });

      //   it("should return 500 on database error", (done) => {
      //     sinon.stub(Employee, "findById").rejects(new Error("Database error"));

      //     chai
      //       .request(app)
      //       .get("/employees/1")
      //       .end((err, res) => {
      //         if (err) return done(err);
      //         res.should.have.status(500);
      //         res.body.should.have.property("message").equal("Database error");
      //         done();
      //       });
      //   });
      // });

      describe("DELETE /employees/:id", () => {
        it("should delete an employee by ID", (done) => {
          const mockEmployee = { _id: "1", name: "John Doe", role: "doctor" };
          sinon
            .stub(Employee, "findByIdAndDelete")
            .withArgs("1")
            .resolves(mockEmployee);

          chai
            .request(app)
            .delete("/employees/1")
            .end((err, res) => {
              if (err) return done(err);
              res.should.have.status(204);
              res.body.should.be.empty;
              done();
            });
        });

        // it('should return 404 if employee not found', (done) => {
        //   sinon.stub(Employee, 'findByIdAndDelete').withArgs('1').resolves(null);

        //   chai.request(app)
        //     .delete('/employees/1')
        //     .end((err, res) => {
        //       if (err) return done(err);
        //       res.should.have.status(404);
        //       res.body.should.have.property('message').equal('Employé non trouvé');
        //       done();
        //     });
        // });

        //   it('should return 500 on database error', (done) => {
        //     sinon.stub(Employee, 'findByIdAndDelete').rejects(new Error('Delete error'));

        //     chai.request(app)
        //       .delete('/employees/1')
        //       .end((err, res) => {
        //         if (err) return done(err);
        //         res.should.have.status(500);
        //         res.body.should.have.property('message').equal('Erreur serveur lors de la suppression de l\'employé');
        //         done();
        //       });
        //   });
        // });

        describe("PUT /employees/:id", () => {
          it("should update an employee by ID", (done) => {
            const existingEmployee = {
              _id: "1",
              name: "John Doe",
              role: "doctor",
            };
            const updatedData = { name: "John Updated", role: "nurse" };
            const updatedEmployee = { _id: "1", ...updatedData };
            sinon
              .stub(Employee, "findById")
              .withArgs("1")
              .resolves(existingEmployee);
            sinon
              .stub(Employee, "findByIdAndUpdate")
              .withArgs("1", { $set: updatedData }, { new: true })
              .resolves(updatedEmployee);

            chai
              .request(app)
              .put("/employees/1")
              .send(updatedData)
              .end((err, res) => {
                if (err) return done(err);
                res.should.have.status(200);
                res.body.should.deep.equal(updatedEmployee);
                done();
              });
          });

          // it('should return 404 if employee not found', (done) => {
          //   sinon.stub(Employee, 'findById').withArgs('1').resolves(null);

          //   chai.request(app)
          //     .put('/employees/1')
          //     .send({ name: 'John Updated' })
          //     .end((err, res) => {
          //       if (err) return done(err);
          //       res.should.have.status(404);
          //       res.body.should.have.property('message').equal('Employee not found');
          //       done();
          //     });
          // });

          //   it('should return 500 on database error', (done) => {
          //     const existingEmployee = { _id: '1', name: 'John Doe', role: 'doctor' };
          //     sinon.stub(Employee, 'findById').resolves(existingEmployee);
          //     sinon.stub(Employee, 'findByIdAndUpdate').rejects(new Error('Update error'));

          //     chai.request(app)
          //       .put('/employees/1')
          //       .send({ name: 'John Updated' })
          //       .end((err, res) => {
          //         if (err) return done(err);
          //         res.should.have.status(500);
          //         res.body.should.have.property('message').equal('Error updating employee data');
          //         res.body.should.have.property('error').equal('Update error');
          //         done();
          //       });
          //   });
          // });

          describe("POST /addEmployee", () => {
            it("should create a new employee", (done) => {
              const newEmployee = {
                cin: 12345678,
                name: "Alice Brown",
                familyName: "Brown",
                role: "technician",
                email: "alice@example.com",
                password: "securepass",
              };
              const savedEmployee = {
                _id: "1",
                ...newEmployee,
                password: "hashed",
              };
              sinon.stub(Employee.prototype, "save").resolves(savedEmployee);

              chai
                .request(app)
                .post("/addEmployee")
                .send(newEmployee)
                .end((err, res) => {
                  if (err) return done(err);
                  res.should.have.status(201);
                  res.body.should.have
                    .property("message")
                    .equal("Employé créé avec succès");
                  res.body.should.have
                    .property("employee")
                    .that.deep.includes(newEmployee);
                  res.body.employee.should.have.property("_id");
                  done();
                });
            });

            // it('should return 400 for validation errors', (done) => {
            //   const invalidEmployee = { role: 'technician' }; // Missing required fields
            //   sinon.stub(Employee.prototype, 'save').rejects({
            //     name: 'ValidationError',
            //     message: 'Path `email` is required.',
            //   });

            //   chai.request(app)
            //     .post('/addEmployee')
            //     .send(invalidEmployee)
            //     .end((err, res) => {
            //       if (err) return done(err);
            //       res.should.have.status(400);
            //       res.body.should.have.property('message').equal('Path `email` is required.');
            //       done();
            //     });
            // });
          });
        });
      });
    });
  });
});
