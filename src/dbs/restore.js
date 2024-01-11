const fs = require('fs');
const { ungzip } = require('node-gzip');
const mysql = require('mysql');
const path = require('path');
const latestFileName = require('./util');
const DB = require('./db.js');

const BACKUP_FOLDER_NAME = 'sqldump';
const DB_NAME = 'dashboard_stage';
const BACKUP_FOLDER = path.join(__dirname, '../../', BACKUP_FOLDER_NAME);

const restoreDatabase = (fileName = '') => {
  console.log(BACKUP_FOLDER);
  const filename = (fileName) ? fileName :  latestFileName(BACKUP_FOLDER, '.sql.gz');
  console.log('filename', filename);
  const pathToFile = path.join(BACKUP_FOLDER, filename);
  ungzip(fs.readFileSync(pathToFile))
    .then((decompressed) => {
      const decompressedFilePath = `./${fileName}.sql`;
      fs.writeFileSync(decompressedFilePath, decompressed);
      const stats = fs.statSync(decompressedFilePath);
      const fileSizeInBytes = stats.size;
      console.log(`Size of decompressed file: ${fileSizeInBytes} bytes`);

      // MySQL connection configuration (adjust as needed)
      const connection = mysql.createConnection({
        host: DB.HOST,
        user: DB.USER,
        password: DB.PASSWORD,
        multipleStatements: true
      });

      connection.connect((err) => {
        if (err) {
          console.error('Error connecting to MySQL: ' + err.stack);
          return;
        }
        // 
        // 27509146
        const allowedSize = fileSizeInBytes + 1000000;
        
        // connection.query(`SET GLOBAL max_allowed_packet=16777216;`, (err, results) => {
        // connection.query(`SET GLOBAL max_allowed_packet=${allowedSize};`, (err, results) => {
        connection.query(`SET GLOBAL max_allowed_packet=33554432;`, (err, results) => {
            if (err) {
              console.error('Error setting max_allowed_packet: ', err);
            } else {
                connection.query(`SHOW VARIABLES LIKE 'max_allowed_packet';`, (err, results) => {
                    if (err) {
                      console.error('Error fetching max_allowed_packet: ', err);
                    } else {
                      console.log('max_allowed_packet:', results[0].Value);
                    }
                  });
                console.log('Connected to MySQL as id ' + connection.threadId);
                const sql = fs.readFileSync(decompressedFilePath, 'utf8');
        
                // Adjust the database name as needed
                connection.query(`USE ${DB_NAME}; ${sql}`, (err, results, fields) => {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log('Database restored successfully!');
                  }
                  connection.end();
                  fs.unlinkSync(decompressedFilePath); // Clean up the uncompressed file
                });
            }
          });
      });
    })
    .catch((err) => {
      console.error('Error during file decompression or database restoration:', err);
    });
}

// restoreDatabase('dashboard_prod-2024-01-11T164113976Z.sql.gz');
restoreDatabase();
// Example usage: restoreDatabase('dashboard_prod-2024-01-11T164113976Z.sql.gz');
