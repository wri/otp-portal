import dayjs from 'dayjs';

import { fetchApi } from 'services/fetch-api';
import { parseDocument } from 'utils/documents';
import { sortBy } from 'utils/general';

const INCLUDE = [
  'operator',
  'required-operator-document',
  'required-operator-document.required-operator-document-group',
  'operator-document-annexes',
  'fmu',
].join(',');


// Normalizes an annex date into the 'YYYY/MM/DD' format used by parsed documents.
const formatDate = (date) => {
  if (!date) return null;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format('YYYY/MM/DD') : null;
};

// One entry per operator, its documents grouped by category, for the reuse picker
function groupByOperator(docs) {
  if (!docs || !docs.length) return [];

  const byOperator = new Map();

  docs.forEach((doc) => {
    const opId = doc.operatorId;
    const opName = doc.operatorName || '';
    if (!byOperator.has(opId)) {
      byOperator.set(opId, { operatorId: opId, operatorName: opName, categoriesMap: new Map() });
    }
    const opEntry = byOperator.get(opId);

    const catKey = doc.category || '';
    if (!opEntry.categoriesMap.has(catKey)) {
      opEntry.categoriesMap.set(catKey, {
        categoryName: catKey,
        categoryPosition: doc.categoryPosition ?? 0,
        documents: [],
      });
    }
    const catEntry = opEntry.categoriesMap.get(catKey);

    catEntry.documents.push({
      docId: doc.docId,
      historyId: doc.id,
      title: doc.title,
      fmuName: doc.fmu?.name || null,
      status: doc.status,
      url: doc.url,
      startDate: doc.startDate,
      endDate: doc.endDate,
      position: doc.position ?? 0,
      annexes: sortBy(
        (doc.annexes || []).map((a) => ({
          id: a.id,
          name: a.name,
          status: a.status,
          url: a.attachment?.url,
          startDate: formatDate(a['start-date']),
          endDate: formatDate(a['expire-date']),
        })),
        (a) => (a.name || '').toLowerCase()
      ),
    });
  });

  const operators = Array.from(byOperator.values()).map((op) => ({
    operatorId: op.operatorId,
    operatorName: op.operatorName,
    categories: sortBy(
      Array.from(op.categoriesMap.values()).map((cat) => ({
        categoryName: cat.categoryName,
        categoryPosition: cat.categoryPosition,
        documents: sortBy(cat.documents, ['position', (d) => (d.title || '').toLowerCase()]),
      })),
      ['categoryPosition', 'categoryName']
    ),
  }));

  return sortBy(operators, (o) => (o.operatorName || '').toLowerCase());
}

// Documents with a file, from every operator the user manages, for reusing one as another's
export async function fetchReusableDocuments(operatorIds, locale) {
  const responses = await Promise.all(
    operatorIds.map((operatorId) => fetchApi('operator-documents', {
      locale,
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

  return groupByOperator(data);
}
