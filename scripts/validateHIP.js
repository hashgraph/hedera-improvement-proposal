const fs = require('fs');
const readline = require('readline');
const regexs = require('../assets/regex');

/**
 * Validates a hip's headers by looking for enclosing '---' substrings and calls functions that validate the contents.
 *
 * @async
 * @function captureHeaderValidation
 * @param {string} hipPath - Path to the hip.
 */
async function captureHeaderValidation(hipPath) {
  const hip = hipPath || process.argv[2];
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
    
    if (lineCount ===  17) {
      throw new Error('header must be enclosed by "---"')
    }
    lineCount++;
  }
}

/**
 * Takes a hip's header and runs regexs against the contained properties.
 *
 * @async
 * @function validateHeaders
 * @param {string} headers
 */
function validateHeaders(headers) {
  try {
    if (!regexs.hipNum.test(headers)) {
      throw 'hip num must be a number use 000 if not yet assigned';
    }

    if (!regexs.title.test(headers)) {
      throw 'header must include a title';
    }

    if (!regexs.councilApproval.test(headers)) {
      throw 'header must specify "needs-council-approval: Yes/No';
    }

    if (!regexs.status.test(headers)) {
      throw 'header must include "status: Idea | Draft | Review | Deferred | Withdrawn | Rejected ' + 
      '| Last Call | Council Review | Accepted | Final | Active | Replaced';
    }

    if (!regexs.type.test(headers)) {
      throw 'header must mast one of the following types exactly ' +
      '"type: Standards Track | Informational | Process"';
    }

    if (!regexs.discussions.test(headers)) {
      throw 'header must include discussions page ' +
      '"discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/xxx"';
    }

    if (/needs-council-approval: Yes/.test(headers) && /category: Application/.test(headers)) {
      throw 'Application category HIPs do not need council approval';
    }

    if (/needs-council-approval: No/.test(headers)
      && (/category: Service/.test(headers) || /category: Core/.test(headers))) {
      throw 'Service and Core categories require council approval';
    }

    if (!regexs.createdDate.test(headers)) {
      throw 'created date must be in the form "created: YYYY-MM-DD';
    }

    if (/category:/.test(headers) && !regexs.category.test(headers)) {
      throw 'header must match one of the following categories ' +
      'exactly "category: Core | Service | API | Mirror | Application"';
    }

    if (/updated:/.test(headers) && !regexs.updatedDate.test(headers)) {
      throw 'updated date must be in the form "updated: YYYY-MM-DD, YYYY-MM-DD, etc';
    }

    if(/last-call-date-time:/.test(headers) && ! regexs.lastCallDateTime.test(headers)) {
      throw 'last-call-date-time should be in the form "last-call-date-time: YYYY-MM-DDTHH:MM:SSZ"';
    }

    if (/requires:/.test(headers) && !regexs.requires.test(headers)) {
      throw 'require field must specify the hip number(s) its referring "requires: hipnum, hipnum(s)"';
    }

    if (/replaces:/.test(headers) && !regexs.replaces.test(headers)) {
      throw 'replaces field must specify the hip number(s) its referring "replaces: hipnum, hipnum(s)"';
    }

    if (/superseded-by/.test(headers) && !regexs.supersededBy.test(headers)) {
      throw 'superseded-by field must specify the hip number(s) its referring "superseded-by: hipnum, hipnum(s)"';
    }
  } catch (error) {
    console.log(Error(error));
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
                    throw 'name is improperly formatted, resubmit PR in the form ex: author: Firstname Lastname <@gitName or email>'
                  }
                }
              )
  } catch (error) {
    if (require.main === module) {
      console.log(Error(error));
      process.exit(1);
    }
    throw Error(error)
  }
}

captureHeaderValidation().catch(error => {
  console.log(error);
  process.exit(1);
});
