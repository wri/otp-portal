import API from 'services/api';
import { fetchApi } from 'services/fetch-api';

// An operator document (or history entry) as the document cards and tables use it
export function parseDocument(doc) {
  if (!doc) return null;

  return {
    id: doc.id,
    docId: doc['operator-document-id'] || doc.id,
    fmu: doc.fmu,
    requiredDocId: doc['required-operator-document'].id,
    url: doc.attachment?.url,
    type: doc.type,
    source: doc['source-type'],
    sourceInfo: doc['source-info'],
    title: doc['required-operator-document'].name,
    public: doc.public,
    explanation: doc['required-operator-document'].explanation,
    position: doc['required-operator-document'].position,
    category:
      doc['required-operator-document'][
        'required-operator-document-group'
      ].name,
    categoryPosition:
      doc['required-operator-document'][
        'required-operator-document-group'
      ].position,
    status: doc.status,
    reason: doc.reason,
    adminComment: doc['admin-comment'],
    startDate: new Date(doc['start-date'])
      .toJSON()
      .slice(0, 10)
      .replace(/-/g, '/'),
    endDate: new Date(doc['expire-date'])
      .toJSON()
      .slice(0, 10)
      .replace(/-/g, '/'),
    annexes: doc['operator-document-annexes']
      ? doc['operator-document-annexes']
      : [],
  };
}

const INCLUDE = [
  'operator',
  'required-operator-document',
  'required-operator-document.required-operator-document-group',
  'operator-document-annexes',
  'fmu',
].join(',');


// Documents with a file, from every operator the user manages, for reusing one as another's.
// Flat, one entry per document with its operatorId and operatorName.
export async function fetchReusableDocuments(operatorIds, locale) {
  const responses = await Promise.all(
    operatorIds.map((operatorId) => fetchApi('operator-documents', {
      locale,
      // no session on purpose: only published documents can be reused
      cache: true,
      params: {
        include: INCLUDE,
        'page[size]': 1000,
        'fields[fmus]': 'name',
        'fields[operators]': 'name',
        'filter[operator-id]': operatorId,
      }
    }).then((data) => ({ operatorId, data })))
  );

  const data = [];
  responses.forEach(({ operatorId, data: docs }) => {
    (docs || []).forEach((doc) => {
      try {
        if (!doc.attachment?.url) return;
        const parsed = parseDocument(doc);
        if (!parsed) return;
        const operator = doc.operator || null;
        data.push({
          ...parsed,
          operatorId: operator?.id || operatorId,
          operatorName: operator?.name || null,
        });
      } catch (e) {
        // skip malformed doc
      }
    });
  });

  return data;
}

// `url` is the document's own endpoint, e.g. gov-documents/:id
export function saveDocument({ url, body }) {
  return API.patch(url, { body });
}

export function deleteDocument(id, path = 'operator-documents') {
  return API.delete(`${path}/${id}`);
}

export function addAnnex({ body }) {
  return API.post('operator-document-annexes', { body });
}

export function editAnnex({ id, body }) {
  return API.patch(`operator-document-annexes/${id}`, { body });
}

export function deleteAnnex(id) {
  return API.delete(`operator-document-annexes/${id}`);
}
