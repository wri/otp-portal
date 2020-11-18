import { createSelector } from 'reselect';
import minBy from 'lodash/minBy';

// Get the datasets and filters from state
const operatorsDetail = (state) => state.operatorsDetail;
const operatorDocumentation = (state) => state.operatorsDetail.documentation;
export const getFMUs = (state) => state.operatorsDetail.data.fmus;
export const getOperatorDocumentationDate = (state) =>
  state.operatorsDetail.date;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedDocumentation = createSelector(
  operatorDocumentation,
  (documentation) => {
    return (
      documentation.data
        .filter(
          (doc) => !doc['required-operator-document']['contract-signature']
        )
        // TODO: filter by FMU id = state.fmu
        .map((doc) => {
          try {
            return {
              id: doc.id,
              fmu: doc.fmu,
              requiredDocId: doc['required-operator-document'].id,
              url: doc.attachment?.url,
              type: doc.type,
              source: doc.source,
              sourceInfo: doc['source-info'],
              title: doc['required-operator-document'].name,
              public: doc.public,
              explanation: doc['required-operator-document'].explanation,
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
          } catch (error) {
            return null;
          }
        })
    );
  }
);

export const getDocumentationMinDate = createSelector(
  operatorDocumentation,
  (documentation) => {
    if (!documentation) return null;
    const sortKey = 'created-at';
    return minBy(documentation.data, (doc) => doc[sortKey])[sortKey];
  }
);

const getContractSignatureDocumentation = createSelector(
  operatorDocumentation,
  (documentation) => {
    let contractSignature = {};

    if (documentation.data) {
      const doc = documentation.data.find(
        (d) => d['required-operator-document']['contract-signature']
      );

      if (doc) {
        contractSignature = {
          id: doc.id,
          requiredDocId: doc['required-operator-document'].id,
          url: doc.attachment?.url,
          type: doc.type,
          public: doc.public,
          title: doc['required-operator-document'].name,
          explanation: doc['required-operator-document'].explanation,
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
    }

    return contractSignature;
  }
);

export { getParsedDocumentation, getContractSignatureDocumentation };
