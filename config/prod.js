module.exports = {
    JWT_SECRET: '9104b291d48a4844d2a346a695d2602fa4d8ffe7328f7c98c27270b32a6b636f', // sha256 gp-content-gp-content-distribution
    // MONGO_DB: 'mongodb://gpcontent:c9yJ2gBFkp7U6@mongo-gp-content-distribution-1.localhost:1302,mongo-gp-content-distribution-2.localhost:1302,mongo-gp-content-distribution-3.localhost:1302/distribution'
    MONGO_DB: 'mongodb://user:password@mongo-gp-content-distribution-1.localhost:1302,mongo-gp-content-distribution-2.localhost:1302,mongo-gp-content-distribution-3.localhost:1302/distribution'
};

// db.createUser({user: 'user', pwd: 'password', roles: [{role: 'readWrite', db: 'distribution'}]});

