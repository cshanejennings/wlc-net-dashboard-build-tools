const mysql = require('mysql');
const DB = require('./db');

const getTimeoutSettings = () => {
  const connection = mysql.createConnection({
    host: DB.HOST,
    user: DB.USER,
    password: DB.PASSWORD
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL: ' + err.stack);
      return;
    }

    console.log('Connected to MySQL as id ' + connection.threadId);

    // Fetch wait_timeout
    connection.query(`SHOW VARIABLES LIKE 'wait_timeout';`, (err, results) => {
      if (err) {
        console.error('Error fetching wait_timeout: ', err);
      } else {
        console.log('wait_timeout:', results[0].Value);
      }

      // Fetch interactive_timeout
      connection.query(`SHOW VARIABLES LIKE 'interactive_timeout';`, (err, results) => {
        if (err) {
          console.error('Error fetching interactive_timeout: ', err);
        } else {
          console.log('interactive_timeout:', results[0].Value);
        }
      });

      connection.query(`SHOW VARIABLES LIKE 'max_allowed_packet';`, (err, results) => {
        if (err) {
          console.error('Error fetching max_allowed_packet: ', err);
        } else {
          console.log('max_allowed_packet:', results[0].Value);
          connection.end();
        }
      });
      
    });
  });
};

getTimeoutSettings();
