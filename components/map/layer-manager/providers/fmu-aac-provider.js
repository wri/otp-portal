import slugify from 'slugify';
import { omit } from 'utils/general';
import { fetch } from 'layer-manager';

export default function fmuAccProvider(property) {
  return function (layerModel, layer, resolve, reject) {
    const { source } = layerModel;
    const { provider } = source;

    fetch('get', provider.url, provider.options, layerModel)
      .then((data) => {
        const parsedData = {
          ...data,
          features: data.features.map(f => ({
            ...f,
            properties: {
              ...f.properties,
              [property]: slugify(f.properties[property] || '', {
                lower: true
              })
            }
          }))
        };

        return resolve({
          ...layer,
          source: {
            ...omit(layer.source, 'provider'),
            data: parsedData
          }
        });
      })
      .catch(e => {
        reject(e);
      });
  }
}
