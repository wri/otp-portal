import { omit } from 'utils/general';
import { fetch } from 'layer-manager';

export default function (layerModel, layer, resolve, reject) {
  const { source } = layerModel;
  const { provider } = source;

  fetch('get', provider.url, provider.options, layerModel)
    .then(({ data }) => {
      return resolve({
        ...layer,
        source: {
          ...omit(layer.source, 'provider'),
          data: data.attributes.geojson
        }
      });
    })
    .catch(e => {
      reject(e);
    });
}
