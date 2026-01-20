import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

async function test() {
  console.log('Testing Redis Connection...');
  const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };
  
  const redis = new Redis(connection.port, connection.host);
  try {
    await redis.ping();
    console.log('✅ Redis PING successful');
  } catch (e) {
    console.error('❌ Redis Connection Failed:', e);
    process.exit(1);
  }

  console.log('Testing Queue...');
  const queueName = 'document-processing';
  const queue = new Queue(queueName, { connection });

  const counts = await queue.getJobCounts();
  console.log('Queue Status:', counts);

  await queue.add('test-job', { foo: 'bar' });
  console.log('Added test job');
  
  console.log('Waiting for worker...');
  
  // Simple worker to consume it
  const worker = new Worker(queueName, async job => {
      console.log('Worker processed job:', job.id);
  }, { connection });

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await worker.close();
  await queue.close();
  await redis.quit();
}

test().catch(console.error);
