const fs = require('fs');
const mysql = require('mysql');
const mysqldump = require('mysqldump');
const {gzip, ungzip} = require('node-gzip');
const path = require('path');
const DB = require('./db.js');

/**
 * uses config.json to backup all databases listed in the databases array
 */
const BACKUP_FOLDER = "sqldump";
const databases = [
    {"database": "dashboard_prod"},
  ];

const update_all = (db_array) => {

  const ts = new Date().toISOString().replace(/[:.]/g, '');
  const backup_db = ({
      database
    }) => {
    (async () => {
      const temp_file_path = `./${database}.dump.sql`;
      try {
        const db_dump = await mysqldump({
            connection: {
                host: DB.HOST,
                user: DB.USER,
                password: DB.PASSWORD,
                database,
            },
            dumpToFile: temp_file_path,
        });
      } catch (e) { console.log(e); }
      const dump_string = fs.readFileSync(temp_file_path, 'utf8');
      const sqlDump = dump_string.replace(
        /CREATE TABLE IF NOT EXISTS `([^`]+)`/g,
        'DROP TABLE IF EXISTS `$1`;\nCREATE TABLE IF NOT EXISTS `$1`'
      );
      fs.unlinkSync(temp_file_path);
      const compressed = await gzip(sqlDump);
      const file_name = `${database}-${ts}.sql.gz`;
      const path_array = path.join(__dirname, '../../', BACKUP_FOLDER);
      const file_path = path.join(path_array, file_name);
      fs.writeFile(file_path, compressed, function(err) {
        if(err) return next(console.log(err));
        console.log(`created ${file_name}`);
        next();
      });
    })();
  }
  const next = () => {
    const db = db_array.pop();
    console.log(`backing up ${db}`);
    return (db) ? backup_db(db) : null;
  }
  next();
}

console.log(databases);
update_all([...databases]);
