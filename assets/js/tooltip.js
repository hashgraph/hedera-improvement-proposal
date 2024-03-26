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
        Draft: "⚠️ Initial stage. Formally tracked once merged by a HIP Editor when properly formatted.",
        Review: "📖 Ready for Editorial Review. Subject to changes; feedback appreciated.",
        Deferred: "⏸ Addressed in another HIP. Paused in progress.",
        Withdrawn: "🛑 Withdrawn by the Author(s), finality achieved. Can be resurrected as a new proposal.",
        Stagnant: "🚧 No activity for 6+ months. Can return to Draft by Authors or Editors.",
        Rejected: "❌ Not accepted. Rejected ideas are recorded with reasoning.",
        "Last Call": "📢 Final review window before 'Accepted'. Subject to change if issues found.",
        "Council Review": "⚖️ Under Council review. Awaiting approval, subject to feedback.",
        Accepted: "👍 Went through 'Last Call' without content changes. Ready for implementation.",
        Final: "✅ Implemented in code and released. Represents a standard in a state of finality.",
        Active: "🌟 Informational/Process HIPs not meant to be completed. Can be 'Withdrawn' or 'Replaced'.",
        Replaced: "🔄 Overwritten by a newer standard or implementation."
      },;
    return statusMeanings[status] || "No information available for this status.";
}