const env = process.env.NODE_ENV || 'development';
require('dotenv').config();

// Need a better way of handing test config, but if present overwrite
if (env === 'test') {
    process.env.PORT = process.env.TEST_PORT || process.env.PORT;
    process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI
}