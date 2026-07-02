import { createSelector } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import sortBy from 'lodash/sortBy';

// Normalizes an annex date into the 'YYYY/MM/DD' format used by parsed documents.
const formatDate = (date) => {
  if (!date) return null;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format('YYYY/MM/DD') : null;
};

const getReusableDocumentsData = (state) => state.documentReuse.data;

export const getReusableDocumentsLoading = (state) => state.documentReuse.loading;
export const getReusableDocumentsError = (state) => state.documentReuse.error;

export const getReusableDocumentsGrouped = createSelector(
  [getReusableDocumentsData],
  (docs) => {
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
);
