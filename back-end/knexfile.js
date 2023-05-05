/**
 * Knex configuration file.
 *
 * You will not need to make changes to this file.
 */

require('dotenv').config();
const path = require("path");

const {
  DATABASE_URL = "postgres://poyfvflq:tk4lZIINAh-zLEedpWf0HudRjHqYNxGu@lallah.db.elephantsql.com/poyfvflq",
  DATABASE_URL_DEVELOPMENT = "postgres://kxbywtsn:GR2fTQsyND9ak1uFj2ZCPtasatBd7cK6@lallah.db.elephantsql.com/kxbywtsn",
  DATABASE_URL_TEST = "postgres://igknobfg:yz2Hjl2WEmGRX87R_MS62k-60VVCY5-F@lallah.db.elephantsql.com/igknobfg",
  DATABASE_URL_PREVIEW = "postgres://dyspxjwa:DdOiX3dzwTitDH6ECVxGtc2Il7mdTqpU@lallah.db.elephantsql.com/dyspxjwa",
  DEBUG,
} = process.env;

module.exports = {
  development: {
    client: "postgresql",
    pool: { min: 1, max: 5 },
    connection: DATABASE_URL_DEVELOPMENT,
    migrations: {
      directory: path.join(__dirname, "src", "db", "migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "src", "db", "seeds"),
    },
    debug: !!DEBUG,
  },
  test: {
    client: "postgresql",
    pool: { min: 1, max: 5 },
    connection: DATABASE_URL_TEST,
    migrations: {
      directory: path.join(__dirname, "src", "db", "migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "src", "db", "seeds"),
    },
    debug: !!DEBUG,
  },
  preview: {
    client: "postgresql",
    pool: { min: 1, max: 5 },
    connection: DATABASE_URL_PREVIEW,
    migrations: {
      directory: path.join(__dirname, "src", "db", "migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "src", "db", "seeds"),
    },
    debug: !!DEBUG,
  },
  production: {
    client: "postgresql",
    pool: { min: 1, max: 5 },
    connection: DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, "src", "db", "migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "src", "db", "seeds"),
    },
    debug: !!DEBUG,
  },
};
