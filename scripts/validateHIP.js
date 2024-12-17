const fs = require('fs');
const readline = require('readline');
const regexs = require('../assets/regex');
const errs = [];

/**
* Validates a hip's headers by looking for enclosing '---' substrings and calls functions that validate the contents.
*
* @async
* @function captureHeaderValidation
* @param {string} hipPath - Path to the hip.
*/
async function captureHeaderValidation(hipPath) {
  const hip = hipPath || process.argv[2];
  if (hip.includes('hipstable')) {
    console.log("Great Success");
    return
  }
  console.log(`Validating ${hip}`)
  const fileStream = fs.createReadStream(hip);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let lineCount = 1;
  let headerBoundaries = [];
  let headers = '';
  for await (const line of rl) {
    if (/---$/.test(line)) {
      headerBoundaries.push(line)
    } else {
      headers += `${line}\n`;
    }
    if (headerBoundaries.length === 2) {
      validateHeaders(headers);
      console.log("Great Success")
      break
    }
    if (/author: /.test(line) || /working-group/.test(line)) {
      validateNames(line);
    }
    if (/updated: 2/.test(line)) { // excludes empty updates dates which happens when new hips are created
      const lastUpdatedDate = new Date(line.split(',').pop());
      if (lastUpdatedDate.toDateString() !== new Date().toDateString()) {
        errs.push(Error('updated date doesnt match current date in header, add current day'));
      }
    }

    if (lineCount === 17) {
      throw new Error('header must be enclosed by "---"');
    }
    lineCount++;
  }
}

/**
* Takes a hip's header and runs regexs against the contained properties to validate them.
*
* @async
* @function validateHeaders
* @param {string} headers
*/
function validateHeaders(headers) {
  try {
    if (!regexs.hipNum.test(headers)) {
      errs.push(Error('hip num must be a number use 000 if not yet assigned'));
    }

    if (!regexs.title.test(headers)) {
      errs.push(Error('header must include a title'));
    }

    if (!regexs.councilApproval.test(headers) && !regexs.tscApproval.test(headers)) {
      errs.push(Error('header must specify either "needs-council-approval: Yes/No" or "needs-tsc-approval: Yes/No"'));
    }

    if (!regexs.status.test(headers)) {
      errs.push(Error('header must include "status: Idea | Draft | Review | Deferred | Withdrawn | Rejected ' +
        '| Last Call | TSC Review | Accepted | Final | Active | Replaced'));
    }

    if (!regexs.type.test(headers)) {
      errs.push(Error('header must match one of the following types exactly ' +
        '"type: Standards Track | Informational | Process"'));
    }

    if (!regexs.discussions.test(headers)) {
      errs.push(Error('header must include discussions page ' +
        '"discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/xxx"'));
    }

    if (!/requested-by:/.test(headers)) {
      errs.push(Error('header must include "requested-by" with the requester\'s name and contact information'));
    }

    if ((/needs-council-approval: Yes/.test(headers) || /needs-tsc-approval: Yes/.test(headers)) &&
      (/category: Application/.test(headers) || /type: Informational/.test(headers) || /type: Process/.test(headers))) {
      errs.push(Error('Application Standards Track/Informational/Process HIPs do not need TSC/Council approval'));
    }

    if ((/needs-council-approval: No/.test(headers) || /needs-tsc-approval: No/.test(headers))
      && (/category: Service/.test(headers) || /category: Core/.test(headers) || /category: Mirror/.test(headers))) {
      errs.push(Error('Service/Core/Mirror categories require TSC/Council approval'));
    }

    if (!regexs.createdDate.test(headers)) {
      errs.push(Error('created date must be in the form "created: YYYY-MM-DD'));
    }

    if (/category:/.test(headers) && !regexs.category.test(headers)) {
      errs.push(Error('header must match one of the following categories ' +
        'exactly "category: Core | Service | API | Mirror | Application"'));
    }

    if (/updated:/.test(headers) && !regexs.updatedDate.test(headers)) {
      errs.push(Error('updated date must be in the form "updated: YYYY-MM-DD, YYYY-MM-DD, etc'));
    }

    if (/last-call-date-time:/.test(headers) && !regexs.lastCallDateTime.test(headers)) {
      errs.push(Error('last-call-date-time should be in the form "last-call-date-time: YYYY-MM-DDTHH:MM:SSZ"'));
    }

    if (/requires:/.test(headers) && !regexs.requires.test(headers)) {
      errs.push(Error('require field must specify the hip number(s) its referring "requires: hipnum, hipnum(s)"'));
    }

    if (/replaces:/.test(headers) && !regexs.replaces.test(headers)) {
      errs.push(Error('replaces field must specify the hip number(s) its referring "replaces: hipnum, hipnum(s)"'));
    }

    if (/superseded-by/.test(headers) && !regexs.supersededBy.test(headers)) {
      errs.push(Error('superseded-by field must specify the hip number(s) its referring "superseded-by: hipnum, hipnum(s)"'));
    }
    if (errs.length > 0) {
      throw errs
    }
  } catch (error) {
    console.log('You must correct the following header errors to pass validation: ', error);
    process.exit(1);
  }
}

/**
* Takes an author: or a working-group: list and validates it.
*
* @async
* @function validateHeaders
* @param {string} line - line in header containing author or working-group
*/
function validateNames(line) {
  try {
    line.split(',')
      .forEach(
        element => {
          const words = element.split(': ');
          if (!regexs.name.test(words[words.length - 1])) {
            errs.push(Error('name is improperly formatted, resubmit PR in the form ex: (author|working-group): Firstname Lastname <@gitName or email>'));
          }
        }
      )
  } catch (error) {
    errs.push(Error(error));
  }
}

captureHeaderValidation().catch(error => {
  console.log(error);
  process.exit(1);
});