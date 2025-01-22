![](./assets/hedera_logo.png)

[![](https://img.shields.io/discord/373889138199494658)](https://discord.com/channels/373889138199494658/813488589773471774)
[![](https://img.shields.io/badge/view-published-blue)](https://hips.hedera.com)

## Submit a HIP
1. Fork this repository
1. Fill out this template: [hip template](hip-0000-template.md)
   1. If the proposal contains exceptionally large specification text,
      particularly API changes or source code, place those changes
      in `assets` and link them as described in the template document.
1. Create a pull request against hashgraph/hedera-improvement-proposal main
<dl>
<dt>But what category do I make my HIP?</dt>
<dd>See <a href="HIP/hip-1.md#hip-types">hip-1 HIP types</a>.</dd>
</dl>

See [hip-1](HIP/hip-1.md) for details on the HIP process or watch
[this video](https://www.youtube.com/watch?v=Gbk8EbtibA0)

## What is a HIP?
HIP stands for "Hedera Improvement Proposal". These improvement proposals can
range from core protocol changes, to the applications, frameworks, and protocols
built on top of the Hedera public network and used by the community. The HIP
author is responsible for building consensus within the community and
documenting dissenting opinions, as well as tracking their HIP through
the process outlined below.

You can see the list of all HIPs on [the official HIPs site](https://hips.hedera.com).

## What is Hedera Hashgraph?
[Hedera Hashgraph](https://hedera.com) is the only public network built on top
of [Dr. Leemon Baird](http://www.leemon.com/)’s
[Hashgraph consensus algorithm](http://www.leemon.com/papers/2016b.pdf).
Hedera goes beyond blockchain to provide the fast, fair, and secure environment
needed to enable enterprise adoption of distributed ledger technologies. You
can learn more about Hedera by
[reading the Hedera whitepaper](https://hedera.com/whitepaper), and for a more
detailed understanding of the Hashgraph Consensus Algorithm you can check out
the [hashgraph algorithm whitepaper](http://www.leemon.com/papers/2016b.pdf).

## Purpose
The goal of HIPs is to have a place to propose new features, to collect
community thoughts and input on a particular issue, and further to document
all these subject matters in one place. It’s a great way to document these
discussions and proposals
[here on GitHub](https://github.com/hashgraph/hedera-improvement-proposal),
because any
[revisions made on these text files will be recorded](https://github.com/hashgraph/hedera-improvement-proposal/commits/master).

## Qualifications
Each HIP should only be one single key proposal and/or idea. The idea should be
focused and only issue to one subject matter to be successful. A HIP must meet
certain minimum criteria: it must be clear and have a complete description of
the proposed enhancement, the enhancement must represent a net improvement,
the proposed implementation, if applicable, must be solid and must not
complicate the protocol unduly.

## Before Submitting
1. Evaluate your idea: consider why you’d like to request changes or
   improvements, and how it benefits the Hedera Hashgraph community.
1. Thoroughly look through those proposals already submitted to ensure there
   are no duplicates.
1. Ask the Hedera Hashgraph community first if your idea is original, or has
   already been through the HIP process.
1. Reevaluate your proposal to ensure sure the idea is applicable
   to the entire community and not just to one particular author, application,
   project, or protocol.

## Local Jekyll Site
Pre-requisites:
- `ruby`: `2.7.8p225`
- `gem`: `3.4.10`
- `bundler`: `1.17.3`
You can run a local version of the HIPs dashboard site:
```shell
bundle install
bundle exec jekyll serve --livereload
```
The site will be available on `http://localhost:4000`.

You can read more about Jekyll on its official [website](https://jekyllrb.com/)

##### Note
An excellent place to discuss your proposal and get feedback is in the
[issues section of this repository](https://github.com/hashgraph/hip/issues),
or on [Hedera's Discord Server](https://hedera.com/discord); there you can
start formalizing the language around your HIP and ensuring it has broad
community support.

## Disclaimer(s):
These proposals and discussions have no effect regarding private (permissioned)
implementations of the Hashgraph consensus algorithm; additionally, this
repository and it’s contents are run by the Hedera Hashgraph community, which
means they do not necessarily reflect the views and opinions of
Hedera Hashgraph LLC.
