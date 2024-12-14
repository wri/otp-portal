const fs = require('fs');

const dirname = './lang/';

fs.readdir(dirname, (err, filenames) => {
  filenames.map(filename => dirname + filename).filter(file => fs.lstatSync(file).isFile()).forEach((file) => {
    fs.readFile(file, 'utf-8', (_err, content) => {
      fs.writeFile(file, JSON.stringify(JSON.parse(content), null, 2), () => {});
    });
  });
});
