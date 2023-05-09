<style type="text/css">
.hipstable {
    width: 100%;
    table-layout: auto;
}

@media screen and (max-width: 600px) {
    .hipstable, .hipstable thead, .hipstable tbody, .hipstable th, .hipstable td, .hipstable tr { 
        display: block; 
    }

    .hipstable thead tr { 
        position: absolute;
        top: -9999px;
        left: -9999px;
    }

    .hipstable tr { border: 1px solid #ccc; }

    .hipstable td { 
        border: none;
        border-bottom: 1px solid #eee; 
        position: relative;
        padding-left: 60%; 
        word-break: break-word;
        padding-top: 0px; /* added this line */
        min-height: 50px; /* added this line */
    }

    .hipstable td:before { 
        position: absolute;
        top: 6px;
        left: 6px;
        width: 45%; 
        padding-right: 10px; 
        white-space: nowrap;
        word-break: break-word;
    }

    .hipstable .hip-number:before { content: "Number"; }
    .hipstable .title:before { content: "Title"; }
    .hipstable .author:before { content: "Author"; }
    .hipstable .council-approval:before { content: "Needs Council Approval"; }
    .hipstable .last-call-date-time:before { content: "Review Period Ends"; }
    .hipstable .release:before { content: "Release"; }
}


.status-tooltip {
    margin-left: 5px;
    position: relative;
    display: inline-block;
    cursor: pointer;
    text-decoration: underline;
    color: #069;
    font-size: 14px;
}

.status-tooltip-box {
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 5px;
    border-radius: 3px;
    white-space: nowrap;
    z-index: 1000;
    font-size: 12px;
    line-height: 1.2;
    max-width: 300px;
    word-wrap: break-word;
}
</style>

{% for status in site.data.statuses %}
    {% assign hips = include.hips|where:"status",status|where:"category",category|where:"type",type %}
    {% assign count = hips|size %}
    {% if count > 0 %}
        <h2 id="{{status|slugify}}">{{status}} <span class="status-tooltip" data-tooltip="{{status}}" style="text-decoration:none">ⓘ</span></h2>
        <table class="hipstable">
            <thead>
                <tr><th>Number</th><th>Title</th><th>Author</th><th>Needs Council Approval</th>
                {% if status == "Last Call" %}
                    <th>Review Period Ends</th>
                {% else %}
                <th>Release</th>
                {% endif %}
                </tr>
            </thead>
        {% for page in hips %}
            <tr>
                <td class="hip-number"><a href="{{page.url|relative_url}}">{{page.hip|xml_escape}}</a></td>
                <td class="title"><a href="{{page.url|relative_url}}">{{page.title|xml_escape}}</a></td>
                <td class="author">{% include authorslist.html authors=page.author %}</td>
                <td class="council-approval">
                    {% if page.needs-council-approval != undefined %}
                    {% if page.needs-council-approval == true %}
                        Yes
                    {% else %}
                        No
                    {% endif %}
                    {% endif %}
                </td>
                {% if status == "Last Call" %}
                <td  class="last-call-date-time">{{page.last-call-date-time | date_to_rfc822 }}</td>
                {% else %}
                <td class="release"><a href="https://github.com/hashgraph/hedera-services/releases/tag/{{page.release}}">{{page.release|xml_escape}}</a></td>
                {% endif %}
            </tr>
        {% endfor %}
        </table>
    {% endif %}
{% endfor %}

<script>
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
    Stagnant: "🚧 This HIP had no activity for at least 6 months.",
    Withdrawn: "🛑 This HIP has been withdrawn.",
    Active: "🌟 Informational or Process HIPs have a status of 'Active' after the last call period"
      + ". This is the last stage for these two HIPs unless they are replaced by another hip",
    Final: "✅ This HIP means the feature has been implemented in code and has been released.",
    Replaced: "🔄 'Replaced' HIPs are overwritten by a newer standard or implementation.",
    Accepted: "👍 An accepted HIP is a HIP that went through the 'Last Call' status period without changes to the content and is considered ready for implementation.",
    Rejected: "❌ This HIP has been rejected, and the proposed idea will not be implemented or pursued further.",
  };
  return statusMeanings[status] || "No information available for this status.";
}
</script>

