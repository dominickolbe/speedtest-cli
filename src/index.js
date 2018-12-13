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
  const download = stats.download ? `${stats.download.toFixed()} Mbit/s (${(stats.download * multiplier).toFixed()} MB/s)` : placeholder;
  const upload = stats.upload ? `${Math.round(stats.upload)} Mbit/s (${Math.round(stats.upload * multiplier)} MB/s)` : placeholder;

  spinner.text = `${stats.finished ? 'Test done' : 'In progress ...'}

    Ping: ${ping}
Download: ${download}
  Upload: ${upload}

`;
};

render();

const test = speedTest({ maxTime: 20000 });

// test.on('data', speed => {
//   render();
// });

// test.on('downloadspeedprogress', speed => {
//   render();
// });

// test.on('uploadspeedprogress', speed => {
//   render();
// });

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

test.on('data', data => {
  render(false);
  spinner.succeed();
  process.exit();
});

test.on('error', err => {
  render(false);
  spinner.fail();
  console.error(err);
  process.exit(1);
});
