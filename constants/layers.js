const FMU_LEGEND = [
  {
    name: 'Cameroon',
    iso: 'CMR',
    color: '#007A5E',
    items: [
      { name: 'vdc', color: '#8BC2B5' },
      { name: 'ufa', color: '#007A5E' },
      { name: 'cf', color: '#00382B' }
    ]
  },
  {
    name: 'Central African Republic',
    iso: 'CAF',
    color: '#e9D400'
  },
  {
    name: 'Congo',
    iso: 'COG',
    color: '#7B287D'
  },
  {
    name: 'Democratic Republic of the Congo',
    iso: 'COD',
    color: '#5ca2d1'
  },
  {
    name: 'Gabon',
    iso: 'GAB',
    color: '#e95800',
    items: [
      { name: 'cpaet', color: '#e95800' },
      { name: 'cfad', color: '#e9A600' }
    ]
  }
];

export const LAYERS = [
  {
    id: 'integrated-alerts',
    name: 'Integrated deforestation alerts',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://tiles.globalforestwatch.org/gfw_integrated_alerts/latest/default/{z}/{x}/{y}.png'
        ],
        minzoom: 2,
        maxzoom: 12
      }
    },
    legendConfig: {
      enabled: true,
      type: 'basic',
      items: [
        {
          name: 'Detected by a single alert system',
          color: '#eda4c3'
        },
        {
          name: 'High confidence: detected more than once by a single alert system',
          color: '#dc6699'
        },
        {
          name: 'Highest confidence: detected by multiple alert systems',
          color: '#c92a6d'
        }
      ]
    },
    decodeConfig: [
      {
        default: '2021-02-28',
        key: 'startDate',
        required: true
      },
      {
        default: '2022-04-20',
        key: 'endDate',
        required: true
      },
      {
        default: 0,
        key: 'confirmedOnly',
        required: true
      }
    ],
    decodeFunction: `
    // First 6 bits Alpha channel used to individual alert confidence
    // First two bits (leftmost) are GLAD-L
    // Next, 3rd and 4th bits are GLAD-S2
    // Finally, 5th and 6th bits are RADD
    // Bits are either: 00 (0, no alerts), 01 (1, low conf), or 10 (2, high conf)
    // e.g. 00 10 01 00 --> no GLAD-L, high conf GLAD-S2, low conf RADD
    float agreementValue = alpha * 255.;
    float r = color.r * 255.;
    float g = color.g * 255.;
    float b = color.b * 255.;
    float day = r * 255. + g;
    float confidence = floor(b / 100.) - 1.;
    // float confidence = 255.;
    float intensity = mod(b, 100.) * 50.;
    // float intensity = 255.; //this is temporal above one does not work
    if (
      day > 0. &&
      day >= startDayIndex &&
      day <= endDayIndex &&
      agreementValue > 0.
    )
    {
      if (intensity > 255.) {
        intensity = 255.;
      }
      // get high and highest confidence alerts
      float confidenceValue = 0.;
      if (confirmedOnly > 0.) {
        confidenceValue = 255.;
      }
      if (agreementValue == 4. || agreementValue == 16. || agreementValue == 64.) {
        // ONE ALERT LOW CONF: 4,8,16,32,64,128 i.e. 2**(2+n) for n<8
        color.r = 237. / 255.;
        color.g = 164. / 255.;
        color.b = 194. / 255.;
        alpha = (intensity -confidenceValue) / 255.;
      } else if (agreementValue == 8. || agreementValue == 32. || agreementValue ==  128.){
        // ONE HIGH CONF ALERT: 8,32,128 i.e. 2**(2+n) for n<8 and odd
        color.r = 220. / 255.;
        color.g = 102. / 255.;
        color.b = 153. / 255.;
        alpha = intensity / 255.;
      } else {
        // MULTIPLE ALERTS: >0 and not 2**(2+n)
        color.r = 201. / 255.;
        color.g = 42. / 255.;
        color.b = 109. / 255.;
        alpha = intensity / 255.;
      }
    } else {
      alpha = 0.;
    }
    `,
    timelineConfig: {
      step: 7,
      speed: 100,
      interval: 'days',
      dateFormat: 'YYYY-MM-DD',
      trimEndDate: '{maxDate}', // updated after fetching layer metadata
      maxDate: '{maxDate}', // updated after fetching layer metadata
      minDate: '2020-08-30', // timeline min date - updated after fetching layer metadata
      minDataDate: '2014-12-31', // layer data min date - updated after fetching layer metadata
      canPlay: true,
      railStyle: {
        background: '#DDD'
      },
      trackStyle: [
        {
          background: '#eda4c3'
        },
        {
          background: '#dc6699'
        }
      ]
    }
  },
  {
    id: 'gain',
    name: 'Tree cover gain',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://tiles.globalforestwatch.org/umd_tree_cover_gain_from_height/v202206/mode/{z}/{x}/{y}.png'
        ],
        minzoom: 3,
        maxzoom: 12
      }
    },
    legendConfig: {
      type: 'basic',
      items: [
        { name: 'Tree cover gain', color: '#6D6DE5' }
      ]
    }
  },
  {
    id: 'loss',
    name: 'Tree cover loss',
    config: {
      type: 'raster',
      source: {
        tiles: [
          'https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.9/tcd_30/{z}/{x}/{y}.png'
        ],
        minzoom: 3,
        maxzoom: 12
      }
    },
    legendConfig: {
      enabled: true
    },
    decodeConfig: [
      {
        default: '2001-01-01',
        key: 'startDate',
        required: true
      },
      {
        default: '2021-12-31',
        key: 'endDate',
        required: true
      }
    ],
    timelineConfig: {
      step: 1,
      speed: 250,
      interval: 'years',
      dateFormat: 'YYYY',
      trimEndDate: '2021-12-31',
      maxDate: '2021-12-31',
      minDate: '2001-01-01',
      canPlay: true,
      railStyle: {
        background: '#DDD'
      },
      trackStyle: [
        {
          background: '#dc6c9a'
        },
        {
          background: '#982d5f'
        }
      ]
    },
    decodeFunction: `
      // values for creating power scale, domain (input), and range (output)
      float domainMin = 0.;
      float domainMax = 255.;
      float rangeMin = 0.;
      float rangeMax = 255.;

      float exponent = zoom < 13. ? 0.3 + (zoom - 3.) / 20. : 1.;
      float intensity = color.r * 255.;

      // get the min, max, and current values on the power scale
      float minPow = pow(domainMin, exponent - domainMin);
      float maxPow = pow(domainMax, exponent);
      float currentPow = pow(intensity, exponent);

      // get intensity value mapped to range
      float scaleIntensity = ((currentPow - minPow) / (maxPow - minPow) * (rangeMax - rangeMin)) + rangeMin;
      // a value between 0 and 255
      alpha = zoom < 13. ? scaleIntensity / 255. : color.g;

      float year = 2000.0 + (color.b * 255.);
      // map to years
      if (year >= startYear && year <= endYear && year >= 2001.) {
        color.r = 220. / 255.;
        color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
        color.b = (33. - zoom + 153. - intensity / zoom) / 255.;
      } else {
        alpha = 0.;
      }
    `
  },
  {
    id: 'aac-cog',
    name: 'aac',
    iso: 'COG',
    config: {
      type: 'geojson',
      source: {
        type: 'geojson',
        provider: {
          type: 'aac-cog',
          url: 'https://opendata.arcgis.com/datasets/0c31460808d84dfe806127a25fd0de62_29.geojson'
        }
      },
      render: {
        layers: [
          {
            type: 'fill',
            paint: {
              'fill-color': '#CCCCCC',
              'fill-opacity': 0.5
            },
            filter: [
              'all',
              ['in', ['get', 'num_con'], ['literal', '{fmuNames}']]
            ]
          },
          {
            type: 'line',
            paint: {
              'line-color': '#CCCCCC',
              'line-opacity': 0.5
            },
            filter: [
              'all',
              ['in', ['get', 'num_con'], ['literal', '{fmuNames}']]
            ]
          }
        ]
      }
    },
    paramsConfig: [
      { key: 'fmuNames', default: [], required: true }
    ],
    legendConfig: {
      type: 'basic',
      items: [
        { name: 'aac', color: '#CCCCCC' }
      ]
    },
    interactionConfig: {
      enabled: true
    }
  },
  {
    id: 'aac-cod',
    name: 'aac',
    iso: 'COD',
    config: {
      type: 'geojson',
      source: {
        type: 'geojson',
        provider: {
          type: 'aac-cod',
          url: 'https://opendata.arcgis.com/datasets/c60d5bf9e01c45c5ad79208803819db1_30.geojson'
        }
      },
      render: {
        layers: [
          {
            type: 'fill',
            paint: {
              'fill-color': '#CCCCCC',
              'fill-opacity': 0.5
            },
            filter: [
              'all',
              ['in', ['get', 'num_ccf'], ['literal', '{fmuNames}']]
            ]
          },
          {
            type: 'line',
            paint: {
              'line-color': '#CCCCCC',
              'line-opacity': 0.5
            },
            filter: [
              'all',
              ['in', ['get', 'num_ccf'], ['literal', '{fmuNames}']]
            ]
          }
        ]
      }
    },
    paramsConfig: [
      { key: 'fmuNames', default: [], required: true }
    ],
    legendConfig: {
      type: 'basic',
      items: [
        { name: 'aac', color: '#CCCCCC' }
      ]
    },
    interactionConfig: {
      enabled: true
    }
  },
  // {
  //   id: 'aac-cmr',
  //   name: 'aac',
  //   iso: 'CMR',
  //   config: {
  //     type: 'geojson',
  //     source: {
  //       type: 'geojson',
  //       provider: {
  //         type: 'aac-cmr',
  //         url: 'https://opendata.arcgis.com/datasets/951c6b559cc945afb96013361519305b_128.geojson'
  //       }
  //     },
  //     render: {
  //       layers: [
  //         {
  //           type: 'fill',
  //           paint: {
  //             'fill-color': '#CCCCCC',
  //             'fill-opacity': 0.5
  //           },
  //           // filter: [
  //           //   'all',
  //           //   ['in', ['get', 'nom_ufe'], ['literal', '{fmuNames}']]
  //           // ]
  //         },
  //         {
  //           type: 'line',
  //           paint: {
  //             'line-color': '#CCCCCC',
  //             'line-opacity': 0.5
  //           },
  //           // filter: [
  //           //   'all',
  //           //   ['in', ['get', 'nom_ufe'], ['literal', '{fmuNames}']]
  //           // ]
  //         }
  //       ]
  //     }
  //   },
  //   paramsConfig: [
  //     { key: 'fmuNames', default: [], required: true }
  //   ],
  //   legendConfig: {
  //     type: 'basic',
  //     items: [
  //       { name: 'aac', color: '#CCCCCC' }
  //     ]
  //   },
  //   interactionConfig: {
  //     enabled: true
  //   }
  // },
  {
    id: 'fmus',
    name: 'Forest managment units',
    config: {
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [`${process.env.OTP_API}/fmus/tiles/{z}/{x}/{y}`],
        promoteId: 'id'
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']],
              ['==', ['get', 'iso3_fmu'], 'COD']
            ],
            paint: {
              'fill-color': '#5ca2d1',
              'fill-opacity': 0.9
            }
          },
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']],
              ['==', ['get', 'iso3_fmu'], 'COG']
            ],
            paint: {
              'fill-color': '#7B287D',
              'fill-opacity': 0.9
            }
          },
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']],
              ['==', ['get', 'iso3_fmu'], 'CMR']
            ],
            layout: {
              'fill-sort-key': {
                property: 'forest_type',
                type: 'categorical',
                stops: [
                  ['ufa', 1],
                  ['cf', 2],
                  ['vdc', 3]
                ],
                default: 1
              }
            },
            paint: {
              'fill-color': {
                property: 'forest_type',
                type: 'categorical',
                stops: [
                  ['vdc', '#8BC2B5'],
                  ['ufa', '#007A5E'],
                  ['cf', '#00382B']
                ],
                default: '#007A5E'
              },
              'fill-opacity': 0.9
            }
          },
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']],
              ['==', ['get', 'iso3_fmu'], 'GAB']
            ],
            paint: {
              'fill-color': {
                property: 'forest_type',
                type: 'categorical',
                stops: [
                  ['cpaet', '#e95800'],
                  ['cfad', '#e9A600']
                ],
                default: '#e95800'
              },

              'fill-opacity': 0.9
            }
          },
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']],
              ['==', ['get', 'iso3_fmu'], 'CAF']
            ],
            paint: {
              'fill-color': '#e9D400',
              'fill-opacity': 0.9
            }
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['in', ['get', 'iso3_fmu'], ['literal', '{country_iso_codes}']]
            ],
            paint: {
              'line-color': '#000000',
              'line-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                0.1
              ],
              'line-width': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                2,
                1
              ],
              'line-dasharray': [3, 1]
            }
          }
        ]
      }
    },
    paramsConfig: [
      { key: 'country_iso_codes', default: process.env.OTP_COUNTRIES, required: true }
    ],
    legendConfig: {
      type: 'basic',
      color: '#e98300',
      items: process.env.OTP_COUNTRIES.map(iso => FMU_LEGEND.find(i => i.iso === iso))
    },
    interactionConfig: {
      enable: true,
      output: [
        {
          column: 'fmu_name',
          label: 'name'
        },
        {
          column: 'forest_type',
          label: 'type'
        },
        {
          column: 'company_na',
          label: 'operator'
        }
      ]
    }
  },
  {
    id: 'fmusdetail',
    name: 'Forest managment units',
    config: {
      type: 'vector',
      source: {
        type: 'vector',
        tiles: [`${process.env.OTP_API}/fmus/tiles/{z}/{x}/{y}`]
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['==', 'iso3_fmu', 'COD'],
              ['==', 'operator_id', '{operator_id}']
            ],
            paint: {
              'fill-color': '#5ca2d1',
              'fill-opacity': 0.9
            }
          },
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['==', 'iso3_fmu', 'COG'],
              ['==', 'operator_id', '{operator_id}']
            ],
            paint: {
              'fill-color': '#7B287D',
              'fill-opacity': 0.9
            }
          },
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['==', 'iso3_fmu', 'CMR'],
              ['==', 'operator_id', '{operator_id}']
            ],
            layout: {
              'fill-sort-key': {
                property: 'forest_type',
                type: 'categorical',
                stops: [
                  ['ufa', 1],
                  ['cf', 2],
                  ['vdc', 3]
                ],
                default: 1
              }
            },
            paint: {
              'fill-color': {
                property: 'forest_type',
                type: 'categorical',
                stops: [
                  ['vdc', '#8BC2B5'],
                  ['ufa', '#007A5E'],
                  ['cf', '#00382B']
                ],
                default: '#007A5E'
              },
              'fill-opacity': 0.9
            }
          },
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['==', 'iso3_fmu', 'GAB'],
              ['==', 'operator_id', '{operator_id}']
            ],
            paint: {
              'fill-color': {
                property: 'forest_type',
                type: 'categorical',
                stops: [
                  ['cpaet', '#e95800'],
                  ['cfad', '#e9A600']
                ],
                default: '#e95800'
              },

              'fill-opacity': 0.9
            }
          },
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['==', 'iso3_fmu', 'CAF'],
              ['==', 'operator_id', '{operator_id}']
            ],
            paint: {
              'fill-color': '#e9D400',
              'fill-opacity': 0.9
            }
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['==', 'operator_id', '{operator_id}']
            ],
            paint: {
              'line-color': '#000000',
              'line-opacity': 0.1
            }
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['==', 'id', '{clickId}']
            ],
            paint: {
              'line-opacity': 1,
              'line-width': 2
            }
          },
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['==', 'id', '{clickId}']
            ],
            paint: {
              'fill-color': '#333'
            }
          },

          {
            type: 'line',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['==', 'id', '{hoverId}'],
              ['!=', 'id', '{clickId}']
            ],
            paint: {
              'line-dasharray': [3, 1],
              'line-opacity': 1,
              'line-width': 2
            }
          },
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['==', 'id', '{hoverId}'],
              ['!=', 'id', '{clickId}']
            ],
            paint: {
              'fill-color': '#333'
            }
          }

        ]
      }
    },
    paramsConfig: [
      { key: 'operator_id', default: null, required: true }
    ],
    legendConfig: {},
    interactionConfig: {
      enable: true
    }
  },
  {
    id: 'protected-areas',
    name: 'Protected areas',
    config: {
      type: 'vector',
      source: {
        type: 'vector',
        provider: {
          type: 'carto',
          account: 'wri-01',
          layers: [
            {
              options: {
                cartocss: '#wdpa_protected_areas {  polygon-opacity: 1.0; polygon-fill: #704489 }',
                cartocss_version: '2.3.0',
                sql: 'SELECT * FROM wdpa_protected_areas'
              },
              type: 'mapnik'
            }
          ]
        }
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            filter: [
              'all',
              ['in', ['get', 'iso3'], ['literal', '{country_iso_codes}']]
            ],
            paint: {
              'fill-color': '#CCCCCC',
              'fill-opacity': 1
            }
          }
        ]
      }
    },
    paramsConfig: [],
    legendConfig: {
      type: 'basic',
      items: [
        { name: 'Protected areas', color: '#CCCCCC' }
      ]
    }
  }
];
