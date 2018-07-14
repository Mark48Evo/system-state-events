import pmx from 'pmx';
import Debug from 'debug';
import amqplib from 'amqplib';
import { createClient } from 'redis';
import SystemEvents from '@mark48evo/system-events';
import SystemState from '@mark48evo/system-state';

pmx.init({});

const statesProcessed = pmx.probe().counter({
  name: 'State Changes Processed',
});

const statesProcessedPerMin = pmx.probe().meter({
  name: 'req/min',
  samples: 1,
  timeframe: 60,
});

const debug = Debug('system:state:events');

const config = {
  host: process.env.RABBITMQ_HOST || 'amqp://localhost',
  redisURL: process.env.REDIS_URL || 'redis://127.0.0.1:6379/3',
};

async function main() {
  const connect = await amqplib.connect(config.host);
  const channel = await connect.createChannel();
  const redis = createClient(config.redisURL);

  const systemEvents = await SystemEvents(channel, { consume: false });
  const systemState = await SystemState(redis, channel);

  debug('Init Completed');

  systemState.on('*', async (stateName, value) => {
    debug(`Published "state.change" for state: "${stateName}"`);
    statesProcessed.inc();
    statesProcessedPerMin.mark();

    systemEvents.publish('state.change', {
      stateName,
      value,
    });
  });
}

main().catch(e => console.error(e));
