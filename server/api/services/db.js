const dotenv = require('dotenv');
dotenv.config();
const Pool = require('pg').Pool;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('connect', () => console.log('connected to the Database'));

const poolQuery = (qt) => {
  return pool.query(`CREATE TABLE IF NOT EXISTS ${qt}`)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
};

const dropTable = (table_name) => {
  const queryText = `DROP TABLE IF EXISTS ${table_name} returning *`;
  return pool.query(queryText)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
};

const createAdminUser = () => {
  pool.query(`
    INSERT INTO users(first_name, last_name, email, password, is_admin)
    VALUES('fuser1', 'luser1', 'user1@site.com', '$2y$12$u2MuNPRz4B0yvnzcIR0bV.xfHM7Gj9LgIu3zjO1fskGheo3bG6ze.', 't')
    `);
};

const createUserTable = () => {
  const queryText = `
        users(
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(128) NOT NULL,
          last_name VARCHAR(128) NOT NULL,
          email VARCHAR(128) NOT NULL,
          password VARCHAR(128) NOT NULL,
          is_admin BOOL DEFAULT 'f'
        )`;
  poolQuery(queryText);
  createAdminUser();
};

const dropUserTable = () => dropTable('users');

const createTripTable = () => {
  const queryText = `
        trips(
          id SERIAL PRIMARY KEY,
          seating_capacity SMALLINT NOT NULL,
          bus_license_number VARCHAR(128) NOT NULL,
          origin VARCHAR(128) NOT NULL,
          destination VARCHAR(128) NOT NULL,
          trip_date TIMESTAMP,
          status BOOL DEFAULT 't'
        )`;
  poolQuery(queryText);
};

const dropTripTable = () => dropTable('trips');

const createBookingTable = () => {
  const queryText = `
        bookings(
          id SERIAL PRIMARY KEY,
          trip_id SMALLINT NOT NULL,
          user_id SMALLINT NOT NULL,
          seat_number SMALLINT NOT NULL,
          FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )`;
  poolQuery(queryText);
};
const dropBookingTable = () => dropTable('bookings');

const createAllTables = () => {
  createUserTable();
  createTripTable();
  createBookingTable();
};

const deleteAllTables = () => {
  dropUserTable();
  dropTripTable();
  dropBookingTable();
};

pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});

module.exports = {
  createUserTable,
  createTripTable,
  createBookingTable,
  createAllTables,
  //
  dropUserTable,
  dropTripTable,
  dropBookingTable,
  deleteAllTables,
  //
  pool,
};

require('make-runnable');
