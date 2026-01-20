const { Queue, Worker } = require('bullmq');

async function test() {
  console.log('Testing BullMQ Queue Connection...');
  const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };
  console.log('Connecting to:', connection);

  const queueName = 'document-processing';
  const queue = new Queue(queueName, { connection });

  try {
     const counts = await queue.getJobCounts();
     console.log('✅ Queue Connection Successful! Job Counts:', counts);
  } catch (e) {
     console.error('❌ Queue getJobCounts Failed:', e.message);
     process.exit(1);
  }

  const job = await queue.add('test-job', { foo: 'bar', timestamp: Date.now() });
  console.log('Added test job:', job.id);
  
  console.log('Waiting for worker...');
  
  // Simple worker to consume it
  const worker = new Worker(queueName, async job => {
      console.log('✅ Worker processed job:', job.id);
  }, { connection });

  // Wait 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await worker.close();
  await queue.close();
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
