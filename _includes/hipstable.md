{% for status in site.data.statuses %}
{% assign hips = include.hips | where: "status", status | where: "category", category | where: "type", type | sort: "hip" | reverse %}
{% assign count = hips.size %}
{% if count > 0 %}
<h2 id="{{ status | slugify }}">{{ status }} <span class="status-tooltip" data-tooltip="{{ status }}">ⓘ</span></h2>
<table class="hipstable">
    <thead>
        <tr>
            <th class="numeric">Number</th>
            <th>Title</th>
            <th>Author</th>
            <th>Needs Council Approval</th>
            {% if status == "Last Call" %}
            <th>Review Period Ends</th>
            {% else %}
            <th class="numeric version">Release</th>
            {% endif %}
        </tr>
    </thead>
    <tbody>
        {% for page in hips %}
        <tr>
            <td class="hip-number"><a href="{{ page.url | relative_url }}">{{ page.hip | xml_escape }}</a></td>
            <td class="title"><a href="{{ page.url | relative_url }}">{{ page.title | xml_escape }}</a></td>
            <td class="author">{% include authorslist.html authors=page.author %}</td>
            <td class="council-approval">
                {% if page.needs-council-approval %}
                    Yes
                {% else %}
                    No
                {% endif %}
            </td>
            {% if status == "Last Call" %}
            <td class="last-call-date-time">{{ page.last-call-date-time | date_to_rfc822 }}</td>
            {% else %}
                    {% if page.category == "Mirror" %}
                    <td class="release"><a href="https://github.com/hashgraph/hedera-mirror-node/releases/tag/{{page.release}}">{{page.release|xml_escape}}</a></td>
                    {% else %}
                    <td class="release"><a href="https://github.com/hashgraph/hedera-services/releases/tag/{{page.release}}">{{page.release|xml_escape}}</a></td>
                {% endif %}
            {% endif %}
        </tr>
        {% endfor %}
    </tbody>
</table>
{% endif %}
{% endfor %}
