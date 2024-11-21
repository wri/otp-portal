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
