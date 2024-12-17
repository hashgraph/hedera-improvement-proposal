<div class="hip-filters filter-wrap">
    <div class="filter-group">
        <h4>Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h4>
        <select id="type-filter" class="type-filter" multiple>
            <option value="core">Core</option>
            <option value="service">Service</option>
            <option value="mirror">Mirror</option>
            <option value="application">Application</option>
            <option value="informational">Informational</option>
            <option value="process">Process</option>
        </select>
    </div>
    <div class="filter-group">
        <h4>Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h4>
        <select id="status-filter" class="status-filter" multiple>
            <option value="review">Review</option>
            <option value="last call">Last Call</option>
            <option value="tsc review">TSC Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="final">Final</option>
            <option value="active">Active</option>
            <option value="replaced">Replaced</option>
            <option value="stagnant">Stagnant</option>
            <option value="deferred">Deferred</option>
            <option value="withdrawn">Withdrawn</option>
        </select>
    </div>
    <div class="filter-group">
        <h4>TSC Approval&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h4>
        <label><input type="radio" name="tsc-approval-filter" class="tsc-filter" value="true"> Yes</label>
        <label><input type="radio" name="tsc-approval-filter" class="tsc-filter" value="false"> No</label>
    </div>
</div>
<div class="no-hips-message" style="display: none;">No HIPs exist for this filter.</div>
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
            <th>Needs TSC Approval</th>
            {% if status == "Last Call" %}
            <th>Review Period Ends</th>
            {% else %}
            <th class="numeric version">Release</th>
            {% endif %}
        </tr>
    </thead>
    <tbody>
        {% for page in hips %}
        <tr data-type="{{ page.type | downcase }}" data-category="{{ page.category | downcase }}" data-status="{{ page.status | downcase }}" data-tsc-approval="{{ page.needs-council-approval or page.needs-tsc-approval | downcase }}">
            <td class="hip-number"><a href="{{ page.url | relative_url }}">{{ page.hip | xml_escape }}</a></td>
            <td class="title"><a href="{{ page.url | relative_url }}">{{ page.title | xml_escape }}</a></td>
            <td class="author">{% include authorslist.html authors=page.author %}</td>
            <td class="tsc-approval">
                {% if page.needs-council-approval or page.needs-tsc-approval %}
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