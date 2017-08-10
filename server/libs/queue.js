import kue from 'kue';
import config from '../config';

/**
 * How to use the service !
 *
 *  First, import the Queue instance in your file
 *
	    import {Queue} from '../path-to-service/queueService'
 *
 *  create a specific job for the logged in user ( based on uuid)

 		let myJob = Queue.createJob('test job for ' + uuid, 'high', {title: 'My job'});

 *  Process the created job, perform any required actions and flag that the process has ended using
 *  the done() function - which can return data that can be seen on the during the 'complete'
 *  event handling

		Queue.processJob('test job for ' + uuid, 10, (job, done) => {
			done(null, {type: job.type, id: job.id, user: job.data.user});
		});

 *  Handle the 'complete' event for your created job. Additionally, we can listen for other events
 *  like 'failed' or 'progress'

		myJob.on('complete', (result) => {
			console.log('Job done!', result);
		});
 */

const queue = kue.createQueue({
	redis: {
		port: config.REDIS.PORT,
		host: config.REDIS.HOST,
		auth: config.REDIS.PASSWORD,
	},
});

class QueueClass {
	constructor(_queue) {
		this.queue = _queue;

		this.queue.watchStuckJobs(3000);

		this.queue.on('error', (err) => {
			err;
		});
	}

	createJob(jobName, priority, options) {
		return this.queue.create(jobName, options)
			.priority(priority)
			.attempts(3)
			.backoff({ delay: 60 * 1000, type: 'fixed' })
			.removeOnComplete(true)
			.save();
	}

	processJob(jobName, fn) {
		this.queue.process(jobName, (job, done) => {
			fn(job, done);
		});
	}

	checkInactive() {
		this.queue.inactiveCount((err, total) => {
			if (total > 100000) {
				// do something
			}
		});
	}

	checkFailed(jobName) {
		this.queue.failedCount(jobName, (err, total) => {
			if (total > 10000) {
				// do something
			}
		});
	}

	shutdown() {
		this.queue.shutdown(5000, (err) => {
			err;
		});
	}
}

const Queue = new QueueClass(queue);

export default Queue;
