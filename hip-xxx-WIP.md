---
hip: HIP number (this is determined by the HIP editor)
title: SOC2 Attestation of controls related to the ability to delete data from the chain
author: Daniel Voyce Eoin Flynn
working-group: a list of the technical and business stakeholders' name(s) and/or username(s), or name(s) and email(s).
type: Process
category: Core
needs-council-approval: Yes
status: Draft
created: 09-Feb-2023
discussions-to: Slack Guardian Tech Meetup channel
updated: comma separated list of dates
requires: HIP number(s)
replaces: HIP number(s)
superseded by: HIP number(s)
---
## Abstract

The proposed rent implementation for entities on the Hedera network impacts upon the persistence of data on chain as items can now be removed from the ledger through actions other than the actions of the actor owning those items. Given that Hedera has the ability to delete data from chain, it will need to have publicly available SOC2 report which has been conducted by an external auditor on an annual (usually) basis. The SOC report will ensure that there are adequate controls in place so that:

In relation to the rent deletion script:
- The rent deletion script only deletes content where no rent has been paid
- There is a change management control process in place to ensure there are no unauthorised changes made to the deletion script
- Changes to the script are tested prior to being deployed on Mainnnet
- Only authorised users have access to modify the script and to deploy changes

In relation to any other deletion abilities (e.g., the removal of illegal content from Mainnet):
- Only authorised users have the ability to delete content
- Where there is a control in place (e.g., require 10 Council members), that the control is in place and is operating effectively

## Motivation

As TYMLEZ is part of the ESG ecosystem building on Hedera we have a vested interest in ensuring that we can deliver the best possible outcome for our customers - a big part of the offering of distributed ledger technology is immutability, if data cannot be deleted or modified then it reduces the scope of audits as they can guarantee the completeness and accuracy of all information which can materially impact upon the financial statements of an organisation.
As Hedera is has the ability to delete data from the network (or intends to have this functionality), our controls will need to cover the DLT component of our platform (Hedera), this will mean we will require an attestation in the form of a SOC2 report or equivalent from Hedera describing that adequate controls are in place and have been operating effectively for the duration of the audit period.

## Rationale

Most companies will require a SOC2 audit as part of any commercial contract to ensure that there are internal controls capturing how a company safeguards customer data and that those controls have been operating effectively. Given that Hedera has the ability to delete data from chain which an auditor may deem relevant to the financial statements of an organisation, auditors will seek assurance that there is an adequate controls environment in-place which covers the duration of the audit period. Auditors in this scenario will have two options:
- Perform an audit on Hedera for each customer which it deems the Hedera network in-scope (e.g., 10 of the same audits each year)
- Place reliance upon a SOC2 conducted by an external auditor 

The audit report will likely need to cover:
  - Access management (who can access provision access to tools, modify tools, deploy tools, etc.)
  - Change management (change management process related to any tools which can delete data from Mainnet)

While this document focuses primarily on the tool/script which will be used for the deletion of assets which have not had rent paid for, these controls will need to be tested for any methods/tools/scripts which Hedera can use to delete data from Mainnet.

## User stories

As a business owner I want to create a SOC2 report for our company, as part of this process the auditors are requesting an attestation from Hedera in order to be satisfied that the relevant controls are in place to cover the Hedera network portion of the solution.
  
## Specification

N/A - A SOC2 process is different for each company based on its makeup and processes.

## Backwards Compatibility

N/A - A SOC2 should not create any BC issues

## Security Implications

SOC2 reports are designed to be publicised, however there might be controls put in place that Hedera might be unhappy with

## How to Teach This

N/A

## Reference Implementation

N/A

## Rejected Ideas

Throughout the discussion of a HIP, various ideas will be proposed which are not accepted. Those rejected ideas should be recorded along with the reasoning as to why they were rejected. This both helps record the thought process behind the final version of the HIP as well as preventing people from bringing up the same rejected idea again in subsequent discussions.

In a way, this section can be thought of as a breakout section of the Rationale section that focuses specifically on why certain ideas were not ultimately pursued.

## Open Issues

While a HIP is in draft, ideas can come up which warrant further discussion. Those ideas should be recorded so people know that they are being thought about but do not have a concrete resolution. This helps make sure all issues required for the HIP to be ready for consideration are complete and reduces people duplicating prior discussions.

## References

[Rent on Hedera](https://hedera.com/blog/rent-on-hedera)

[Example SOC2 Report](https://secureframe.com/hub/soc-2/report-example)

[SOC Report Information](https://www.mossadams.com/articles/2021/05/what-is-a-soc-report)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
