const config = {};

config.port = process.env.PORT || 3000;
config.dbName = "firstappusers";
config.dbHost = "Tvolex:Tvolex3913@ds031895.mlab.com";
config.dbPort = "31895";
config.DBurl = `mongodb://${config.dbHost}:${config.dbPort}/${config.dbName}`;

module.exports = config;