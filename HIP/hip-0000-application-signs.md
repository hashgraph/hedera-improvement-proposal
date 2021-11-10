---
hip: <HIP number (this is determined by the HIP editor)>
title: <HIP title>
author: <a list of the author’s or authors’ name(s) and/or username(s), or name(s) and email(s).>
working-group: a list of the technical and business stakeholders' name(s) and/or username(s), or name(s) and email(s).
type: Informational
category: Application
needs-council-approval: <Yes | No>
status: Draft
created: <date created on>
discussions-to: <a URL pointing to the official discussion thread>
updated: <comma separated list of dates>
requires: <HIP number(s)>
replaces: <HIP number(s)>
superseded-by: <HIP number(s)>
---

## Abstract

Describes the concept of how transactions can be issued by one account, but paid for by another account.

## Motivation

Oftentimes it is appropriate for the application to pay fees associated with a transation rather than the end user.

## Rationale

N/A

## User stories

N/A
  
## Specification

```
Client client = Client.forTestnet();
client.setOperator(OPERATOR_ID, OPERATOR_KEY);

PrivateKey userKey = PrivateKey.generate();

AccountId userId = new AccountCreateTransaction()
        .setKey(userKey.getPublicKey())
        .setInitialBalance(new Hbar(5))
        .execute(client).getReceipt(client).accountId;

TransferTransaction transaction = new TransferTransaction()
        .addHbarTransfer(userId, new Hbar(-1))
        .addHbarTransfer(OPERATOR_ID, new Hbar(1))
        .freezeWith(client)
        .sign(OPERATOR_KEY);

byte[] transBytes = transaction.toBytes();
// The transaction bytes are sent to the client.
// The client could sign the bytes and return the signature to the application
// or the client could sign the bytes and submit them to the Hedera network.

Transaction<?> transaction1 = Transaction.fromBytes(transBytes);
transaction1.sign(userKey);
//these lines represent a given user (created above) signing a TransferTransaction

Client client2 = Client.forTestnet();
TransactionResponse response = transaction1.execute(client2);
System.out.println("Getting receipt");

TransactionReceipt receipt = response.getReceipt(client2);
System.out.println("Transaction id " + receipt.status);

return userId;
```

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
