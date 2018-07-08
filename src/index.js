import Debug from 'debug';
import amqplib from 'amqplib';
import { createClient } from 'redis';
import SystemEvents from '@mark48evo/system-events';
import SystemState from '@mark48evo/system-state';

const debug = Debug('system:state:events');

const config = {
  host: process.env.RABBITMQ_HOST || 'amqp://localhost',
  redisURL: process.env.REDIS_URL || 'redis://127.0.0.1:6379/3',
};

async function main() {
  const connect = await amqplib.connect(config.host);
  const channel = await connect.createChannel();
  const redis = createClient(config.redisURL);

  const systemEvents = await SystemEvents(channel);
  const systemState = await SystemState(redis, channel);

  systemState.on('*', async (stateName, value) => {
    debug(`Published "state.change" for state: "${stateName}"`);

    systemEvents.publish('state.change', {
      stateName,
      value,
    });
  });
}

main();
