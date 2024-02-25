<style type="text/css">
.hipstable th {
    position: relative;
    cursor: pointer;
    padding-right: 30px; /* Ensure there's space for the arrow */
}

.hipstable th::after {
    content: "\2195"; /* Default: double arrow for neutral */
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8em;
}

.hipstable th.asc::after {
    content: "\25BC";
}

.hipstable th.desc::after {
    content: "\25B2";
}
</style>

{% for status in site.data.statuses %}
    {% assign hips = include.hips|where:"status",status|where:"category",category|where:"type",type|sort:"hip"|reverse %}
    {% assign count = hips|size %}
    {% if count > 0 %}
        <h2 id="{{status|slugify}}">{{status}} <span class="status-tooltip" data-tooltip="{{status}}" style="text-decoration:none">ⓘ</span></h2>
        <table class="hipstable">
            <thead>
                <tr><th class="numeric">Number</th><th>Title</th><th>Author</th><th>Needs Council Approval</th>
                {% if status == "Last Call" %}
                    <th>Review Period Ends</th>
                {% else %}
                <th class="numeric version">Release</th>
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
                    {% if page.category == "Mirror" %}
                    <td class="release"><a href="https://github.com/hashgraph/hedera-mirror-node/releases/tag/{{page.release}}">{{page.release|xml_escape}}</a></td>
                    {% else %}
                    <td class="release"><a href="https://github.com/hashgraph/hedera-services/releases/tag/{{page.release}}">{{page.release|xml_escape}}</a></td>
                    {% endif %}
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
</script>

<script>
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.hipstable th').forEach(header => {
    header.addEventListener('click', function () {
      const table = header.closest('.hipstable');
      const tbody = table.querySelector('tbody');
      const index = Array.from(header.parentNode.children).indexOf(header);
      const isAscending = header.classList.contains('asc');
      const isNumeric = header.classList.contains('numeric');
      const isVersion = header.classList.contains('version'); // Add 'version' class to your Release header

      Array.from(tbody.querySelectorAll('tr'))
        .sort((rowA, rowB) => {
          let cellA = rowA.querySelectorAll('td')[index].textContent;
          let cellB = rowB.querySelectorAll('td')[index].textContent;

          if (isVersion) {
            cellA = cellA.replace('v', '').split('.').map(Number);
            cellB = cellB.replace('v', '').split('.').map(Number);
            for (let i = 0; i < Math.max(cellA.length, cellB.length); i++) {
              if ((cellA[i] || 0) < (cellB[i] || 0)) return isAscending ? -1 : 1;
              if ((cellA[i] || 0) > (cellB[i] || 0)) return isAscending ? 1 : -1;
            }
            return 0;
          }

          if (isNumeric) {
            return (isAscending ? 1 : -1) * (parseFloat(cellA) - parseFloat(cellB));
          }

          return (isAscending ? 1 : -1) * cellA.toString().localeCompare(cellB);
        })
        .forEach(tr => tbody.appendChild(tr));

      header.classList.toggle('asc', !isAscending);
      header.classList.toggle('desc', isAscending);

      Array.from(header.parentNode.children)
        .filter(th => th !== header)
        .forEach(th => th.classList.remove('asc', 'desc'));
    });
  });
});
</script>


