---
hip: HIP number (this is determined by the HIP editor)
title: SOC2 Attestation of controls around Hedera Rent proposal and breaking of immutability
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

The proposed rent implementation for entities on the Hedera network breaks perceived immutability of the ledger, as items can now be removed from the ledger through actions other than the actions of the actor owning those items, this will require an attestation from Hedera in the form of a SOC2 report (or similar) that there are adequate controls in place to guard against accidental / malicious occurrences of this happening.

## Motivation

As TYMLEZ is part of the ESG ecosystem building on Hedera we have a vested interest in ensuring that we can deliver the best possible outcome for our customer, likewise our customers will expect that our processes are immaculate, a big part of the offering of blockchain is immutability, if data cannot be deleted or modified then it reduces the scope of audits required to exclude the blockchain / DLT component.
As Hedera is now introducing a form of mutability to the ledger, our controls will need to cover the blockchain / DLT component of our platform (Hedera), this will mean we will require an attestation in the form of a SOC2 report or equivalent from Hedera describing that the controls have been audited and are adequate.

## Rationale

Most companies will require a SOC2 audit as part of any commercial contract to ensure that there are internal controls capturing how a company safeguards customer data and how well those controls are operating. 
A part of this now includes Hedera as the network itself would not be considered immutable for audit purposes. 
As the internal processes of Hedera are mostly unknown to the outside world, the only way this can be achieved is through an audit report covering it off in the form of a SOC2 attestation or equivalent.
This Audit report will need to be made public so that companies building on Hedera can include it in their own SOC2 reports.

The audit report will likely need to cover:
  - governance around the decisions made to delete data from the state
  - review and control of the code that performs the actual deletion from the state
  - access controls around who can modify or deploy such code
  - ...

## User stories

As a business onwer I want to create a SOC2 report for our company, as part of this process the auditors are requesting an attestation from Hedera in order to be satisfied that the relevant controls are in place to cover the Hedera network portion of the solution.
  
## Specification

N/A - A SOC2 process is different for each company based on its makeup and processes.

## Backwards Compatibility

N/A - A SOC2 shouldnt create any BC issues

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

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
