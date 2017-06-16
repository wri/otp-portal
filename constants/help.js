const TABS_HELP = [{
  label: 'Overview',
  value: 'overview'
}, {
  label: 'How OTP works',
  value: 'how-otp-works'
}, {
  label: 'Legislation and Regulations',
  value: 'legislation-and-regulations'
}, {
  label: 'FAQs',
  value: 'faqs'
}];


const HOW_OTP_WORKS_HELP = [{
  id: 'sources-of-information',
  title: 'Sources of information',
  description: 'The OTP compiles information on timber producers from three different sources: Government, Private sector, Third parties (NGOs and other qualified actors)',
  link: {
    label: 'Read more',
    href: '/help?tab=how-otp-works&article=sources-of-information',
    as: '/help/how-otp-works?article=sources-of-information'
  }
}, {
  id: 'score-calculation',
  title: 'Score calculation',
  description: 'For each operator, a transparency score is calculated based on the percentage of documents the operator provides out of the total number of documents requested.',
  link: {
    label: 'Read more',
    href: '/help?tab=how-otp-works&article=score-calculation',
    as: '/help/how-otp-works?article=score-calculation'
  }
}, {
  id: 'geographical-scope',
  title: 'Geographical scope',
  description: 'Beginning with the Republic of Congo and the Democratic Republic of Congo, the OTP will expand to other major timber exporting countries as resources and opportunities allow.',
  link: {
    label: 'Read more',
    href: '/help?tab=how-otp-works&article=geographical-scope',
    as: '/help/how-otp-works?article=geographical-scope'
  }
}];


const LEGISLATION_AND_REGULATIONS_HELP = [{
  id: 'forest-products-and-legality',
  title: 'Forest products and legality',
  description: 'The Risk Information Tool provides an overview of relevant legislations and regulations, information about most commonly traded species, etc.',
  link: {
    label: 'Read more',
    href: '/help?tab=legislation-and-regulations&article=forest-products-and-legality',
    as: '/help/legislation-and-regulations?article=forest-products-and-legality'
  }
}, {
  id: 'voluntary-partnership-agreement-vpa-process',
  title: 'Voluntary partnership agreement (vpa) process',
  description: 'The Timber Trade Portal provides information regarding legal timber trade, due diligence and on country requirements and exports.',
  link: {
    label: 'Read more',
    href: '/help?tab=legislation-and-regulations&article=voluntary-partnership-agreement-vpa-process',
    as: '/help/legislation-and-regulations?article=voluntary-partnership-agreement-vpa-process'
  }
}, {
  id: 'timber-trade-and-due-diligence',
  title: 'Timber trade and due diligence',
  description: 'The EU FLEGT Facility provides a website containing extensive information on Voluntary Partnership Agreements, the voluntary bilateral trade agreements between the European Union (EU) and timber-exporting countries outside the EU established to fight against illegal logging.',
  link: {
    label: 'Read more',
    href: '/help?tab=legislation-and-regulations&article=timber-trade-and-due-diligence',
    as: '/help/legislation-and-regulations?article=timber-trade-and-due-diligence'
  }
}];

const FAQS_HELP = [{
  id: 'first-faq',
  title: 'First FAQ',
  description: 'The Open Timber Platform aims to track the performance of forest concession operators.',
  link: {
    label: 'Read more',
    href: '/help?tab=faqs&article=first-faq',
    as: '/help/faqs?article=first-faq'
  }
}, {
  id: 'second-faq',
  title: 'Second FAQ',
  description: 'Registered forest operators are ranked according to their performance against standard legality and sustainability indicators.',
  link: {
    label: 'Read more',
    href: '/help?tab=faqs&article=second-faq',
    as: '/help/faqs?article=second-faq'
  }
}, {
  id: 'third-faq',
  title: 'Third FAQ',
  description: 'Sociis natoque casius penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum id ligula porta felis euismod.',
  link: {
    label: 'Read more',
    href: '/help?tab=faqs&article=third-faq',
    as: '/help/faqs?article=third-faq'
  }
}];
export { TABS_HELP, HOW_OTP_WORKS_HELP, LEGISLATION_AND_REGULATIONS_HELP, FAQS_HELP };
