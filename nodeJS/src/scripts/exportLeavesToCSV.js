const fs = require('fs');
const { Parser } = require('json2csv');
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'emergencyDepartement';
const leaveCollectionName = 'leaverequests';
const employeeCollectionName = 'employees';

async function exportToCSV() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const leaveCollection = db.collection(leaveCollectionName);
  const employeeCollection = db.collection(employeeCollectionName);

  const leaves = await leaveCollection.find({}).toArray();

  const parsed = await Promise.all(
    leaves.map(async (l) => {
      let employeeName = 'Inconnu';
      let role = 'Inconnu'; // Ajout de l'initialisation de role

      try {
        // Assurez-vous que l'identifiant de l'employé est valide (ObjectId)
        if (ObjectId.isValid(l.employee)) {
          const employee = await employeeCollection.findOne({ _id: new ObjectId(l.employee) });
          
          if (employee && employee.name && employee.role) {
            employeeName = employee.name;
            role = employee.role; // Affectation correcte du role
          }
        }
      } catch (e) {
        console.warn('⚠️ Erreur lors de la recherche d\'employé pour', l.employee);
      }

      return {
        employee: employeeName,
        role: role,  // Ajout du role dans le résultat
        startDate: l.startDate,
        endDate: l.endDate,
        leaveType: l.leaveType,
      };
    })
  );

  const parser = new Parser();
  const csv = parser.parse(parsed);
  fs.writeFileSync('./src/leave-ai/leave_data.csv', csv);
  console.log('✅ Exporté vers leave_data.csv avec les noms des employés');

  await client.close();
}

exportToCSV().catch(console.error);

const fs = require('fs');
const { Parser } = require('json2csv');
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'emergencyDepartement';
const leaveCollectionName = 'leaverequests';
const employeeCollectionName = 'employees';

async function exportToCSV() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const leaveCollection = db.collection(leaveCollectionName);
  const employeeCollection = db.collection(employeeCollectionName);

  const leaves = await leaveCollection.find({}).toArray();

  const parsed = await Promise.all(
    leaves.map(async (l) => {
      let employeeName = 'Inconnu';
      let role = 'Inconnu'; // Ajout de l'initialisation de role

      try {
        // Assurez-vous que l'identifiant de l'employé est valide (ObjectId)
        if (ObjectId.isValid(l.employee)) {
          const employee = await employeeCollection.findOne({ _id: new ObjectId(l.employee) });
          
          if (employee && employee.name && employee.role) {
            employeeName = employee.name;
            role = employee.role; 
          }
        }
      } catch (e) {
        console.warn('⚠️ Erreur lors de la recherche d\'employé pour', l.employee);
      }

      return {
        employee: employeeName,
        role: role,  // Ajout du role dans le résultat
        startDate: l.startDate,
        endDate: l.endDate,
        leaveType: l.leaveType,
      };
    })
  );

  const parser = new Parser();
  const csv = parser.parse(parsed);
  fs.writeFileSync('./src/leave-ai/leave_data.csv', csv);
  console.log('✅ Exporté vers leave_data.csv avec les noms des employés');

  await client.close();
}

exportToCSV().catch(console.error);
