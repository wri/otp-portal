const Canvas = require('canvas');
const request = require('request');
const moment = require('moment');

const Image = Canvas.Image;
const MAX_ZOOM = 12;
const START_DATE = '2015-01-01';

function doRequest(requestConfig) {
  return new Promise((resolve, reject) => {
    request(requestConfig, (error, res, body) => {
      if (!error && res.statusCode === 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

async function getTile(z, x, y) {
  const zsteps = z - MAX_ZOOM;
  let coords = { x, y, z };

  if (zsteps > 0) {
    const relation = Math.pow(2, zsteps);
    coords = {
      x: (x % relation) * (256 / relation) || 0,
      y: (y % relation) * (256 / relation) || 0,
      z: MAX_ZOOM
    };
  }

  const TILE_URL = `https://wri-tiles.s3.amazonaws.com/glad_prod/tiles/${coords.z}/${coords.x}/${coords.y}.png`;

  const response = await doRequest({
    uri: TILE_URL,
    method: 'GET',
    encoding: null
  });
  return response;
}

function getConfidence(number) {
  let confidence = -1;
  if (number >= 100 && number < 200) {
    confidence = 0;
  } else if (number >= 200) {
    confidence = 1;
  }
  return confidence;
}

function getIntensity(number) {
  let intensity = (number % 10) * 50;
  if (intensity > 255) {
    intensity = 255;
  }
  return intensity;
}

class GladAlerts {
  constructor(z, x, y) {
    this.opts = { z, x, y };

    this.currentDate = [
      moment.utc(START_DATE), moment.utc()
    ];
  }

  static filterdata(data, w, h, z) {
    const startDate = moment(START_DATE);
    const endDate = moment.utc();
    const numberOfDays = endDate.diff(startDate, 'days');
    const imgData = data;

    if (this.timelineExtent === undefined) {
      this.timelineExtent = [
        moment.utc(startDate),
        endDate
      ];
    }

    const timeLinesStartDay = this.timelineExtent[0].diff(
      startDate,
      'days'
    );
    const timeLinesEndDay =
      numberOfDays - endDate.diff(this.timelineExtent[1], 'days');

    const confidenceValue = -1;

    const pixelComponents = 4; // RGBA
    let pixelPos;
    let i;
    let j;

    for (i = 0; i < w; ++i) {
      for (j = 0; j < h; ++j) {
        pixelPos = ((j * w) + i) * pixelComponents;

        // find the total days of the pixel by
        // multiplying the red band by 255 and adding
        // the green band to that
        const day = (imgData[pixelPos] * 255) + imgData[pixelPos + 1];
        const band3 = imgData[pixelPos + 2];
        const confidence = getConfidence(imgData[band3]);

        if (
          confidence >= confidenceValue &&
          (day >= timeLinesStartDay && day <= timeLinesEndDay)
        ) {
          const intensity = getIntensity(band3);
          if (day >= numberOfDays - 7 && day <= numberOfDays) {
            imgData[pixelPos] = 219;
            imgData[pixelPos + 1] = 168;
            imgData[pixelPos + 2] = 0;
            imgData[pixelPos + 3] = intensity;
          } else {
            imgData[pixelPos] = 220;
            imgData[pixelPos + 1] = 102;
            imgData[pixelPos + 2] = 153;
            imgData[pixelPos + 3] = intensity;
          }

          continue;
        }

        imgData[pixelPos + 3] = 0;
      }
    }

    return imgData;
  }

  async getCanvasTile(callback) {
    'use asm';

    const { z, x, y } = this.opts;
    const canvas = new Canvas(256, 256);
    const ctx = canvas.getContext('2d');
    const zsteps = z - MAX_ZOOM;
    const tile = await getTile(z, x, y);
    const image = new Image();
    image.src = tile;

    // this will allow us to sum up the dots when the timeline is running
    ctx.clearRect(0, 0, 256, 256);

    if (zsteps < 0) {
      ctx.drawImage(image, 0, 0);
    } else {
      // over the maxzoom, we'll need to scale up each tile
      ctx.imageSmoothingEnabled = false;
      // disable pic enhancement
      ctx.mozImageSmoothingEnabled = false;

      // tile scaling
      const srcX = (256 / Math.pow(2, zsteps) * (x % Math.pow(2, zsteps))) | 0;
      const srcY = (256 / Math.pow(2, zsteps) * (y % Math.pow(2, zsteps))) | 0;
      const srcW = (256 / Math.pow(2, zsteps)) | 0;
      const srcH = (256 / Math.pow(2, zsteps)) | 0;

      ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, 256, 256);
    }

    const I = ctx.getImageData(0, 0, canvas.width, canvas.height);
    GladAlerts.filterdata(I.data, canvas.width, canvas.height, z);
    ctx.putImageData(I, 0, 0);

    if (callback && typeof callback === 'function') callback(canvas);

    return canvas;
  }

  async getImageTile(format = 'image/png', callback) {
    const canvasTile = await this.getCanvasTile();
    const imageString = canvasTile.toDataURL(format);
    const imageResult = new Buffer(imageString.split(',')[1], 'base64');
    if (callback && typeof callback === 'function') callback(imageResult);
    return imageResult;
  }
}


module.exports = GladAlerts;
