const regex = {
    enclosingDashes: /---([\s\S]*?)---/,
    hipNum: /hip: \d+\n/,
    title: /title: [\w\W]+/,
    name: /[a-zA-Z\-_\s]+(?:\<(?!.*\))[^>]+?\>|\((?!.*>)[^)]+?\))$/,
    type: /type: (Standards Track|Informational|Process)/,
    category: /category: (Core|Service|API|Mirror|Application)/,
    councilApproval: /needs-council-approval: (\Yes|No)/,
    status: /status: (Idea|Draft|Review|Deferred|Withdrawn|Rejected|Last Call|TSC Review|TSC Approved|Hedera Review|Hedera Accepted|Accepted|Final|Active|Replaced)/,
    createdDate: /created:\s[0-9]{4}-[0-9]{2}-[0-9]{2}/,
    updatedDate: /updated:(\s[0-9]{4}-[0-9]{2}-[0-9]{2},*)+/,
    discussions: /discussions-to: (https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
    lastCallDateTime: /last-call-date-time: (\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/,
    requires: /requires: \d+(, \d+)*\n/,
    replaces: /replaces: \d+(, \d+)*\n/,
    supersededBy: /superseded-by: \d+(, \d+)*\n/
}
module.exports = regex;