const QRious = require('qrious');
const fs = require('fs');
const imagemagick = require('imagemagick');
const list = fs.readFileSync('./list.txt').toString().split('\n').filter(s => !!s);
const baseURL = 'https://www.google.co.jp/#q=';

const tasks = list.map(code => generate.bind(null, code));
tasks.reduce((a, b) => {
  return a.then(b);
}, Promise.resolve(null)).then(() => {
  console.log('==== done ====');
}).catch(err => {
  console.log('==== failed ====\n', err);
});

function generate(code) {
  console.log('generating...', code);
  return new Promise((resolve, reject) => {
    const qr = new QRious({
      level: 'H',
      padding: 25,
      size: 1500,
      value: `${baseURL}${code}`,
    });

    const file = `./png/${code}.png`;
    const data = qr.toDataURL().replace(/^data:image\/png;base64,/, '');

    fs.writeFile(file, data, 'base64', err => {
      if (err) {
        reject(err);
      } else {
        resolve([ code, file ]);
      }
    });
  })
  .then(([ code, file ]) => {
    return convertToTiff(code, file);
  })
  .catch(e => Promise.reject(e));
}

function convertToTiff(code, file) {
  return new Promise((resolve, reject) => {
    imagemagick.convert([
      file,
      '-colorspace', 'gray',
      '-background', 'white',
      '-alpha', 'remove',
      `./tiff/${code}.tiff`
    ], err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
