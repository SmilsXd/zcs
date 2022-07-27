// *** SET THESE VARIABLES ***

module.exports = {
  DATA_FILE_LOC: "/home/user/NAD_r10.txt",
  POSTGRESQL_CONN: "postgres://postgres:1234@localhost/street_data",
  LOG_INTERVAL: 10000,
};

/* ************************** 
  HOW TO RUN THIS SCRIPT
    1. Add above variables

    2. Run `node csv-transform.js`

    3. Apply data dump.
      a. Create db named street_data
      b. create table:
        `CREATE TABLE data (
          name text,
          number text, 
          zip_code text,
          zip_index text,
          unit text,
          mgrs text
          )`
      c. Copy dump file to postgres 'street_data.data' table:
          a. Connect to databas using `psql street_data`
          b. Run the following with your path to dump the data:
            `COPY data(name, number, zip_code, zip_index, unit, mgrs)
              FROM '/home/user/zcs/scripts/nad-streets-units-mgrs/dumps/streets.txt'
              DELIMITER ',';`

    4. Run `node write-output.js`.
    5. Run 'node compress-files.js`.

    Note: checked in output files are placeholders only. Run script to generate data.
*/
