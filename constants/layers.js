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
    description: 'Here is description',
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
    },
    metadata: {
      title: 'Integrated deforestation alerts',
      subtitle: 'daily, 10m, tropics, UMD/GLAD and WUR',
      overview: `
      <p>
      This dataset, assembled by Global Forest Watch, aggregates deforestation alerts from three alert systems (GLAD-L, GLAD-S2, RADD) into a single, integrated deforestation alert layer.
      This integration allows users to detect deforestation events faster than any single system alone, as the integrated layer is updated when any of the source alert systems are updated.
      </p>
      <p>
      The source alert systems are derived from satellites of varying spectral and spatial resolutions.
      30m GLAD Landsat-based alerts are up-sampled to match the 10m spatial resolution of Sentinel-based alerts (GLAD-S2, RADD).
      This avoids the double counting of overlapping alerts, which are instead classified at a higher confidence level, indicated by darker pixels.
      </p>
      <p>
      Alerts are classified as high confidence when detected twice by a single alert system.
      This can occur in areas and at times when only one alert system was operating.
      Where multiple alert systems are operating, alerts detected by multiple (two or three) of these systems are classified as highest confidence.
      With multiple sensors picking up change in the same location, we can be more confident that an alert was not a false positive and do not need to wait for additional satellite imagery to increase confidence in detected loss, thus providing more confident alerting faster than with a single system.
      </p>
      `,
      source: `
      <h4>GLAD Alerts:</h4>
      <p>
      Hansen, M.C., A. Krylov, A. Tyukavina, P.V. Potapov, S. Turubanova, B. Zutta, S. Ifo, B. Margono, F. Stolle, and R. Moore. 2016.
      Humid tropical forest disturbance alerts using Landsat data. Environmental Research Letters, 11 (3). https://dx.doi.org/10.1088/1748-9326/11/3/034008
      </p>
      <h4>GLAD-S2 Alerts:</h4>
      <p>
      Pickens, A.H., Hansen, M.C., Adusei, B., and Potapov P. 2020. Sentinel-2 Forest Loss Alert. Global Land Analysis and Discovery (GLAD), University of Maryland.
      </p>
      <h4>RADD Alerts:</h4>
      <p>
      Reiche, J., Mullissa, A., Slagter, B., Gou, Y., Tsendbazar, N.E., Braun, C., Vollrath, A., Weisse, M.J., Stolle, F., Pickens, A., Donchyts, G., Clinton, N., Gorelick, N., Herold, M. 2021. Forest disturbance alerts for the Congo Basin using Sentinel-1.
      Environmental Research Letters. https://doi.org/10.1088/1748-9326/abd0a8
      </p>
      `
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
    },
    metadata: {
      title: 'Tree cover gain',
      subtitle: '(20 years, 30 m, global, UMD/NASA GEDI)',
      dateOfContent: '2000-2020',
      overview: `
      <p>
      This data set from the GLAD (Global Land Analysis & Discovery) lab at the University of Maryland measures areas of tree cover gain from the year 2000 to 2020 across the globe at 30 × 30 meter resolution,
      displayed as a 20-year cumulative layer. Tree cover gain was determined using tree height information from the years 2000 and 2020.
      Tree height was modeled by the integration of the Global Ecosystem Dynamics Investigation (GEDI) lidar forest structure measurements and Landsat analysis-ready data time-series.
      The NASA GEDI is a spaceborne lidar instrument operating onboard the International Space Station since April 2019.
      It provides point-based measurements of vegetation structure, including forest canopy height at latitudes between 52°N and 52°S globally.
      Gain was identified where pixels had tree height ≥5 m in 2020 and tree height <5 m in 2000.
      </p>
      <p>
      Tree cover gain may indicate a number of potential activities, including natural forest growth, the tree crop rotation cycle, or tree plantation management.
      </p>
      <p>
      When zoomed out (< zoom level 12), pixels of gain are shaded according to the density of gain at the 30 x 30 meter scale.
      Pixels with darker shading represent areas with a higher concentration of tree cover gain, whereas pixels with lighter shading indicate a lower concentration of tree cover gain.
      There is no variation in pixel shading when the data is at full resolution (≥ zoom level 12).
      </p>
      `,
      source: `
      <p>
      Potapov, P., Hansen, M.C., Pickens, A., Hernandez-Serna, A., Tyukavina, A., Turubanova, S., Zalles, V., Li, X., Khan, A., Stolle, F., Harris, N., Song, X-P., Baggett, A., Kommareddy, I., and Kommareddy, A. 2022.
      The Global 2000-2020 Land Cover and Land Use Change Dataset Derived From the Landsat Archive: First Results. Frontiers in Remote Sensing, 13, April 2022. https://doi.org/10.3389/frsen.2022.856903
      </p>`
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
    `,
    metadata: {
      title: 'Tree cover loss',
      subtitle: '(annual, 30m, global, Hansen/UMD/Google/USGS/NASA)',
      dateOfContent: '2001-2021',
      disclaimer: `
        Tree cover loss <span class="highlight">is not always deforestation</span>.
      `,
      disclaimerTooltip: `
      Loss of tree cover may occur for many reasons, including deforestation, fire, and logging within the course of sustainable forestry operations.
      In sustainably managed forests, the “loss” will eventually show up as “gain”, as young trees get large enough to achieve canopy closure.
      `,
      overview: `
      <p>
      This data set, a collaboration between the GLAD (Global Land Analysis & Discovery) lab at the University of Maryland, Google, USGS, and NASA,
      measures areas of tree cover loss across all global land (except Antarctica and other Arctic islands) at approximately 30 × 30 meter resolution.
      The data were generated using multispectral satellite imagery from the Landsat 5 thematic mapper (TM), the Landsat 7 thematic mapper plus (ETM+), and the Landsat 8 Operational Land Imager (OLI) sensors.
      Over 1 million satellite images were processed and analyzed, including over 600,000 Landsat 7 images for the 2000-2012 interval, and more than 400,000 Landsat 5, 7, and 8 images for updates for the 2011-2021 interval.
      The clear land surface observations in the satellite images were assembled and a supervised learning algorithm was applied to identify per pixel tree cover loss.
      </p>
      <p>
      In this data set, “tree cover” is defined as all vegetation greater than 5 meters in height, and may take the form of natural forests or plantations across a range of canopy densities.
      Tree cover loss is defined as “stand replacement disturbance,” or the complete removal of tree cover canopy at the Landsat pixel scale.
      Tree cover loss may be the result of human activities, including forestry practices such as timber harvesting or deforestation (the conversion of natural forest to other land uses), as well as natural causes such as disease or storm damage.
      Fire is another widespread cause of tree cover loss, and can be either natural or human-induced.
      </p>
      <p>
      This data set has been updated five times since its creation, and now includes loss up to 2021 (Version 1.9).
      The analysis method has been modified in numerous ways, including new data for the target year, re-processed data for previous years (2011 and 2012 for the Version 1.1 update, 2012 and 2013 for the Version 1.2 update, and 2014 for the Version 1.3 update), and improved modelling and calibration.
      These modifications improve change detection for 2011-2021, including better detection of boreal loss due to fire, smallholder rotation agriculture in tropical forests, selective losing, and short cycle plantations.
      Eventually, a future “Version 2.0” will include reprocessing for 2000-2010 data, but in the meantime integrated use of the original data and Version 1.7 should be performed with caution.
      Read more about the Version 1.7 update here. (link is: https://storage.googleapis.com/earthenginepartners-hansen/GFC-2021-v1.9/download.html)
      </p>
      <p>
      When zoomed out (< zoom level 13), pixels of loss are shaded according to the density of loss at the 30 x 30 meter scale.
      Pixels with darker shading represent areas with a higher concentration of tree cover loss, whereas pixels with lighter shading indicate a lower concentration of tree cover loss.
      There is no variation in pixel shading when the data is at full resolution (≥ zoom level 13).
      </p>
      <p>
      The tree cover canopy density of the displayed data varies according to the selection - use the legend on the map to change the minimum tree cover canopy density threshold.
      </p>
      `,
      source: `
      <p>
      Hansen, M. C., P. V. Potapov, R. Moore, M. Hancher, S. A. Turubanova, A. Tyukavina, D. Thau, S. V. Stehman, S. J. Goetz, T. R. Loveland, A. Kommareddy, A. Egorov, L. Chini, C. O. Justice, and J. R. G. Townshend. 2013.
      “High-Resolution Global Maps of 21st-Century Forest Cover Change.” Science 342 (15 November): 850–53.
      Data available on-line from: http://earthenginepartners.appspot.com/science-2013-global-forest/.
      </p>
      `
    }
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
