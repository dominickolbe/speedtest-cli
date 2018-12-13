#!/usr/bin/env node

import ora from 'ora';
import chalk from 'chalk';
import speedTest from 'speedtest-net';

const spinner = new ora();
const multiplier = 1 / 8;

spinner.start();

const stats = {
  download: null,
  upload: null,
  ping: null,
};

const render = finished => {
  const placeholder = '...';
  const ping = stats.ping ? `${stats.ping}ms` : placeholder;
  const download = stats.download ? `${(stats.download).toFixed(2)} Mbit/s (${(stats.download * multiplier).toFixed(2)} MB/s)` : placeholder;
  const upload = stats.upload ? `${(stats.upload).toFixed(2)} Mbit/s (${(stats.upload * multiplier).toFixed(2)} MB/s)` : placeholder;
  const info = finished ? `Your IP: ${stats.client.ip} | Testserver: ${stats.server.host} in ${stats.server.location} ${stats.server.country}` : '';

  spinner.text = `${finished ? 'Test done': 'In progress ...'}

    Ping: ${ping}
Download: ${download}
  Upload: ${upload}

${info}
`;
};

render();

const test = speedTest({ maxTime: 20000 });

test.on('downloadspeedprogress', speed => {
  stats.download = speed;
  render();
});

test.on('uploadspeedprogress', speed => {
  stats.upload = speed;
  render();
});

test.once('testserver', server => {
  stats.ping = Math.round(server.bestPing);
  render();
});

test.on('downloadspeed', speed => {
  stats.download = speed;
  render();
});

test.on('uploadspeed', speed => {
  stats.upload = speed;
  render();
});

test.once('data', data => {
  stats.client = data.client;
  stats.server = data.server;
  render(true);
  spinner.succeed();
  process.exit();
});

test.on('error', err => {
  spinner.fail();
  console.error(err);
  process.exit(1);
});
