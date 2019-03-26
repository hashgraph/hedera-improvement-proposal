HIPs 
Hashgraph Improvement Proposals (HIPs) describe standards for the Hashgraph platform, including protocol specifications, client APIs, and contract standards.

Contributing
Review HIP-1.
Fork the repository by clicking "Fork" in the top right.
Add your HIP to your fork of the repository. There is a template HIP here.
Submit a Pull Request to Hashing Systems's HIPs repository.
Your first PR should be a first draft of the final HIP. It must meet the formatting criteria enforced by the build (largely, correct metadata in the header). An editor will manually review the first PR for a new HIP and assign it a number before merging it. Make sure you include a discussions-to header with the URL to a discussion forum or open GitHub issue where people can discuss the HIP as a whole.

If your HIP requires images, the image files should be included in a subdirectory of the assets folder for that HIP as follow: assets/HIP-X (for HIP X). When linking to an image in the HIP, use relative links such as ../assets/HIP-X/image.png.

Once your first PR is merged, we have a bot that helps out by automatically merging PRs to draft HIPs. For this to work, it has to be able to tell that you own the draft being edited. Make sure that the 'author' line of your HIP contains either your Github username or your email address inside. If you use your email address, that address must be the one publicly shown on your GitHub profile.

When you believe your HIP is mature and ready to progress past the draft phase, you should do one of two things:

For HIPs, open a PR changing the state of your HIP to 'Final'. An editor will review your draft and ask if anyone objects to its being finalised. If the editor decides there is no rough consensus - for instance, because contributors point out significant issues with the HIP - they may close the PR and request that you fix the issues in the draft before trying again.

##HIP Status Terms

Draft - an HIP that is undergoing rapid iteration and changes
Last Call - an HIP that is done with its initial iteration and ready for review by a wide audience
Accepted - a core HIP that has been in Last Call for at least 2 weeks and any technical changes that were requested have been addressed by the author
Final - an HIP that the Devs have decide to implement and release.
Deferred - an HIP that is not being considered for immediate adoption.
