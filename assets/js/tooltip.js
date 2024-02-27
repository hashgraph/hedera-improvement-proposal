document.addEventListener("DOMContentLoaded", function () {
    const statusTooltipElements = document.querySelectorAll(".status-tooltip");
    statusTooltipElements.forEach(tooltip => {
        tooltip.addEventListener("mouseover", () => {
            const tooltipText = tooltip.getAttribute("data-tooltip");
            const tooltipBox = document.createElement("div");
            tooltipBox.classList.add("status-tooltip-box");
            tooltipBox.innerText = getTooltipContent(tooltipText);
            tooltip.appendChild(tooltipBox);
        });

        tooltip.addEventListener("mouseout", () => {
            const tooltipBox = tooltip.querySelector(".status-tooltip-box");
            if (tooltipBox) tooltip.removeChild(tooltipBox);
        });

        tooltip.addEventListener("mousemove", (event) => {
            const tooltipBox = tooltip.querySelector(".status-tooltip-box");
            if (tooltipBox) {
                const boxRect = tooltipBox.getBoundingClientRect();
                const contentLength = tooltipBox.innerText.length;
                const offset = contentLength < 125 ? 100 : 200;
                const tooltipLeft = Math.max(0, event.clientX + offset);
                tooltipBox.style.left = tooltipLeft + "px";
                tooltipBox.style.maxWidth = (window.innerWidth - event.clientX) * 2 + "px";
            }
        });

    });
});

function getTooltipContent(status) {
    const statusMeanings = {
        Draft: "⚠️ This is a draft HIP - it's not recommended for general use or implementation as it is likely to change.",
        Review: "📖 This HIP is in the review stage. It is subject to changes and feedback is appreciated.",
        "Last Call": "📢 This HIP is in the last call for review stage. The authors wish to finalize the HIP and appreciate feedback.",
        "Council Review": "⚖️ This HIP is under review by the Council. Changes may occur based on their feedback and final approval.",
        Stagnant: "🚧 This HIP had no activity for at least 6 months.",
        Withdrawn: "🛑 This HIP has been withdrawn.",
        Active: "🌟 Informational or Process HIPs have a status of 'Active' after the last call period"
            + ". This is the last stage for these two HIPs unless they are replaced by another hip",
        Final: "✅ This HIP means the feature has been implemented in code and has been released to mainnet.",
        Replaced: "🔄 'Replaced' HIPs are overwritten by a newer standard or implementation.",
        Accepted: "👍 An accepted HIP is a HIP that went through the 'Last Call' status period without changes to the content and is considered ready for implementation.",
        Rejected: "❌ This HIP has been rejected, and the proposed idea will not be implemented or pursued further.",
    };
    return statusMeanings[status] || "No information available for this status.";
}