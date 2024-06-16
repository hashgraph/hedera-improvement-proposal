---
hip: 0000
title: Itemized auto-creation fees
author: Michael Tinker <@tinker-michaelj>
working-group: Neeharika Sompalli <@Neeharika-Sompalli>
requested-by: Swirlds Labs
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2024-06-16
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/992
---

## Abstract

When the network automatically creates an account as a side effect of a `CryptoTransfer` sending assets to an unused account alias, it "squashes" the fees for the implicit `CryptoCreate` into the record of the `CryptoTransfer` instead of being itemized in the preceding auto-creation record.

For example, take [this](https://hashscan.io/mainnet/transaction/1718150303.526849003) `CryptoTransfer` from HashScan. Its `transactionFee` is given as `$0.0474`, even though `$0.0473` of that amount was actually charged for the work done in the preceding child [here](https://hashscan.io/mainnet/transaction/1718150303.526849002).

We propose the network instead itemize the auto-creation fees in the preceding child record. 

## Motivation

It is more intuitive to externalize fees payments in the record of the work they were charged for. Furthermore, as the Services codebase adopts a standardized "unit of work" that can be dispatched from multiple sources (user transaction business logic, the scheduling service, auto-renewal and archival processes, etc.); it would take material effort to _avoid_ itemizing these fee payments.

## Rationale

There is no advantage to the to current behavior, so given the above motivations we should change it.

## User stories

- As a HashScan user, I want to see exactly what fees were charged for my parent `CryptoTransfer` versus what fees were charged for its `CryptoCreate` child.
- As a Services developer, I want to align the fees charged for a "unit of work" with its own record instead of its parent record when dispatched from a handler.
  
## Specification

Given the [example transactions](https://hashscan.io/mainnet/transactionsById/0.0.3929606-1718150300-262000000) from the abstract, instead of externalizing the two record excerpts below,
```
*** <<<Current preceding child>>> ***
receipt {
  status: SUCCESS
  accountID {
    accountNum: 6134246
  }
}
...
transactionID {
...
  nonce: 1
}
memo: "auto-created account"
transactionFee: 54047391
transferList {
}

*** <<<Current following parent>>> ***
receipt {
  status: SUCCESS
...
}
...
transactionFee: 54162549
transferList {
  accountAmounts {
    accountID {
      accountNum: 8
    }
    amount: 4664
  }
  accountAmounts {
    accountID {
      accountNum: 98
    }
    amount: 48742097
  }
  accountAmounts {
    accountID {
      accountNum: 800
    }
    amount: 5415788
  }
  accountAmounts {
    accountID {
      accountNum: 3929606
    }
    amount: -55162549
  }
  accountAmounts {
    accountID {
      accountNum: 6134246
    }
    amount: 1000000
  }
}
```
The network should externalize,
```
*** <<<Proposed preceding child>>> ***
receipt {
  status: SUCCESS
  accountID {
    accountNum: 6134246
  }
}
...
transactionID {
...
  nonce: 1
}
memo: "auto-created account"
transactionFee: 54047391
transferList {
  accountAmounts {
    accountID {
      accountNum: 98
    }
    amount: 48642652
  }
  accountAmounts {
    accountID {
      accountNum: 800
    }
    amount: 5404739
  }
  accountAmounts {
    accountID {
      accountNum: 3929606
    }
    amount: -54047391
  }
}

*** <<<Proposed following parent>>> ***
receipt {
  status: SUCCESS
...
}
...
transactionFee: 115158
transferList {
  accountAmounts {
    accountID {
      accountNum: 8
    }
    amount: 4664
  }
  accountAmounts {
    accountID {
      accountNum: 98
    }
    amount: 99445
  }
  accountAmounts {
    accountID {
      accountNum: 800
    }
    amount: 11049
  }
  accountAmounts {
    accountID {
      accountNum: 3929606
    }
    amount: -1115158
  }
  accountAmounts {
    accountID {
      accountNum: 6134246
    }
    amount: 1000000
  }
}
```

## Backwards Compatibility

This HIP is backward-compatible. Any mirror node capable of ingesting the current record stream will also be able to ingest the new record stream. 

## Security Implications

This HIP does not have any obvious security implications. It leaves untouched the impact of an auto-creation on state and user balances, and only changes how the charged fees are itemized in the record stream.

## How to Teach This

Instead of squashing the auto-creation record fee into its parent `CryptoTransfer` record, itemize the fee in the preceding `CryptoCreate` child record.

## Reference Implementation

[This PR](https://github.com/hashgraph/hedera-services/pull/13639) implements the desired behavior by adopting a standard unit of work for both user and child transactions.

## Rejected Ideas

We considered continuing to simulate the current behavior; but that behavior existed only for ease of implementation in the pre-`v0.49` Services codebase, and has only disadvantages going forward.

## Open Issues

There are no known issues. The reference implementation has been tested on mainnet event streams and has the desired behavior.

## References

1. [Example auto-creation records on HashScan](https://hashscan.io/mainnet/transactionsById/0.0.3929606-1718150300-262000000)
2. [The parent record in the example](https://hashscan.io/mainnet/transaction/1718150303.526849003)
3. [The child record in the example](https://hashscan.io/mainnet/transaction/1718150303.526849002)
4. [Reference implementation for the HIP](https://github.com/hashgraph/hedera-services/pull/13639)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
