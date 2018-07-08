#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Debug = _interopDefault(require('debug'));
var amqplib = _interopDefault(require('amqplib'));
var redis = require('redis');
var SystemEvents = _interopDefault(require('@mark48evo/system-events'));
var SystemState = _interopDefault(require('@mark48evo/system-state'));

const debug = Debug('system:state:events');
const config = {
  host: process.env.RABBITMQ_HOST || 'amqp://localhost',
  redisURL: process.env.REDIS_URL || 'redis://127.0.0.1:6379/3'
};

async function main() {
  const connect = await amqplib.connect(config.host);
  const channel = await connect.createChannel();
  const redis$$1 = redis.createClient(config.redisURL);
  const systemEvents = await SystemEvents(channel);
  const systemState = await SystemState(redis$$1, channel);
  systemState.on('*', async (stateName, value) => {
    debug(`Published "state.change" for state: "${stateName}"`);
    systemEvents.publish('state.change', {
      stateName,
      value
    });
  });
}

main();
//# sourceMappingURL=system-state-events.js.map
