import RedisServer from 'redis-server';
import mongo from 'mongodb';
import Queue from './libs/queue';

const mongoClient = mongo.MongoClient;

const server = new RedisServer(6379);

server.open((err) => {
	if (err === null) {
	// You may now connect a client to the Redis
	// server bound to `server.port` (e.g. 6379).
		process.stdout.write('Redis up&running');
	} else {
		process.stderr.write('Redis start error', err);
	}
});

mongoClient.connect('mongodb://localhost:27017/mdm', (err, db) => {
	if (err && !db) {
		console.log('MongoDB err:', err.message);
		const { exec } = require('child_process');
		exec('mongod --config ./mongod.cfg --logpath ./logs/mongodb.log --dbpath ./db', (err, stdout, stderr) => {
			if (err) {
				console.log('err', err);
				process.exit();
				return;
			}
			// the *entire* stdout and stderr (buffered)
			console.log(`MongoDB: ${stdout}`);
		});
	} else {
		console.log('MongoDB up&running');
	}
});

const api = module.exports = require('express').Router();
const products = require('./products');
const reviews = require('./reviews');


api
  .get('/express-test', (req, res) => res.send({ express: 'working!' })) // demo route to prove api is working
  .use('/products', products)
  .use('/reviews', reviews);
// No routes matched? 404.
api.use((req, res) => res.status(404).end());
