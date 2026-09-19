import { describe, it, expect } from 'vitest';

import { HELPERS_OBS, parseObservation, parseObservations } from '../observations';

const API_OBSERVATION = {
  id: '1',
  details: 'Logging outside the FMU',
  hidden: false,
  'evidence-type': 'Uploaded documents',
  'observation-documents': [{ id: 'doc-1' }],
  'evidence-on-report': 'page 4',
  'validation-status-id': 7,
  'litigation-status': 'none',
  'location-accuracy': 'Estimated location',
  lat: '3.5',
  lng: '11.2',
  fmu: { id: '5', name: 'Nkola' },
  severity: { level: 2 },
  subcategory: { name: 'Illegal logging', category: { name: 'Forest management' } },
  country: { name: 'Cameroon', 'country-centroid': { coordinates: [5, 12] } },
  operator: { id: '9', name: 'AFRIWOOD', 'fa-id': 'fa-9', 'is-active': true, 'operator-type': 'Logging company' },
  'observation-report': {
    title: 'Mission report',
    'publication-date': '2023-05-10T00:00:00Z',
    'mission-type': 'mandated',
    attachment: { url: 'https://example.org/report.pdf' }
  },
  observers: [{ name: 'FODER', 'observer-type': 'NGO' }],
  'relevant-operators': [{ name: 'Other Ltd' }]
};

describe('parseObservation', () => {
  it('flattens an api observation', () => {
    expect(parseObservation(API_OBSERVATION)).toEqual({
      category: 'Forest management',
      country: 'Cameroon',
      rawdate: new Date('2023-05-10T00:00:00Z'),
      date: 2023,
      details: 'Logging outside the FMU',
      evidence: [{ id: 'doc-1' }],
      fmu: { id: '5', name: 'Nkola' },
      id: '1',
      level: 2,
      operator: 'AFRIWOOD',
      'operator-profile-id': '9',
      observation: 'Logging outside the FMU',
      location: { lat: 3.5, lng: 11.2 },
      'location-accuracy': 'Estimated location',
      'operator-type': 'Logging company',
      report: 'https://example.org/report.pdf',
      'report-title': 'Mission report',
      subcategory: 'Illegal logging',
      status: 7,
      'litigation-status': 'none',
      'mission-type': 'mandated',
      'observer-types': ['NGO'],
      'observer-organizations': [{ name: 'FODER', 'observer-type': 'NGO' }],
      'relevant-operators': ['Other Ltd'],
      hidden: false
    });
  });

  it('uses the report evidence when evidence is in the report', () => {
    const obs = parseObservation({ ...API_OBSERVATION, 'evidence-type': 'Evidence presented in the report' });

    expect(obs.evidence).toBe('page 4');
  });

  it('falls back to the country centroid for location', () => {
    const obs = parseObservation({ ...API_OBSERVATION, lat: null, lng: null });

    expect(obs.location).toEqual({ lat: 5, lng: 12 });
  });

  it('handles an observation without relations', () => {
    const obs = parseObservation({ id: '2' });

    expect(obs).toMatchObject({
      category: '',
      country: '',
      operator: false,
      'operator-profile-id': null,
      location: {},
      report: null,
      'report-title': null,
      'mission-type': null,
      'observer-types': [],
      'relevant-operators': []
    });
  });

  it('links the operator profile only for active operators with a forest atlas id', () => {
    const inactive = { ...API_OBSERVATION.operator, 'is-active': false };
    const noFaId = { ...API_OBSERVATION.operator, 'fa-id': '' };

    expect(parseObservation({ ...API_OBSERVATION, operator: inactive })['operator-profile-id']).toBeNull();
    expect(parseObservation({ ...API_OBSERVATION, operator: noFaId })['operator-profile-id']).toBeNull();
  });

  it('parses a list', () => {
    expect(parseObservations([API_OBSERVATION, { id: '2' }]).map((o) => o.id)).toEqual(['1', '2']);
  });
});

describe('HELPERS_OBS', () => {
  const data = [
    { date: 2023, category: 'Forest management', subcategory: 'Illegal logging', level: 3, rawdate: new Date('2023-05-10T10:00:00Z') },
    { date: 2023, category: 'Forest management', subcategory: 'Illegal logging', level: 1, rawdate: new Date('2023-05-10T15:00:00Z') },
    { date: 2023, category: 'Labour', subcategory: 'Safety', level: 3, rawdate: new Date('2023-06-01T10:00:00Z') },
    { date: 2022, category: 'Labour', subcategory: 'Safety', level: 0, rawdate: new Date('2022-01-01T10:00:00Z') }
  ];

  it('groups by year and category, optionally within a year', () => {
    expect(Object.keys(HELPERS_OBS.getGroupedByYear(data))).toEqual(['2022', '2023']);
    expect(HELPERS_OBS.getGroupedByCategory(data)['Labour']).toHaveLength(2);
    expect(HELPERS_OBS.getGroupedByCategory(data, 2022)).toEqual({ Labour: [data[3]] });
  });

  it('counts by severity', () => {
    expect(HELPERS_OBS.getGroupedBySeverity(data)).toEqual([{ hight: 2, medium: 0, low: 1, unknown: 1 }]);
    expect(Object.keys(HELPERS_OBS.getGroupedBySeverity(data, true))).toEqual(['0', '1', '3']);
    expect(Object.keys(HELPERS_OBS.getGroupedBySeverity(data, true, 'date'))).toEqual(['2022', '2023']);
  });

  it('groups by illegality', () => {
    expect(Object.keys(HELPERS_OBS.getGroupedByIllegality(data))).toEqual(['Illegal logging', 'Safety']);
  });

  it('finds the largest severity count across groups', () => {
    const byCategory = HELPERS_OBS.getGroupedByCategory(data);

    expect(HELPERS_OBS.getMaxValue(byCategory)).toBe(1);
    expect(HELPERS_OBS.getMaxValue({ a: [{ level: 1 }, { level: 1 }] })).toBe(2);
  });

  it('finds the largest group', () => {
    expect(HELPERS_OBS.getMaxLength(HELPERS_OBS.getGroupedByYear(data))).toBe(3);
  });

  it('counts monitor visits as distinct days', () => {
    expect(HELPERS_OBS.getMonitorVisits(data)).toBe(3);
    expect(HELPERS_OBS.getAvgObservationByMonitors(data)).toBe('1.33');
    expect(HELPERS_OBS.getAvgObservationByMonitors([])).toBe('0.00');
  });
});
