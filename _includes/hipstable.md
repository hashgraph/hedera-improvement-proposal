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
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="last call">Last Call</option>
            <option value="tsc review">TSC Review</option>
            <option value="tsc approved">TSC Approved</option>
            <option value="hiero approved">Hiero Approved</option>
            <option value="hedera accepted">Hedera Accepted</option>
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
        <h4>Council Approval&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h4>
        <label>
            <input type="radio" name="council-approval-filter" class="council-filter" value="true"> Yes
        </label>
        <label>
            <input type="radio" name="council-approval-filter" class="council-filter" value="false"> No
        </label>
    </div>
</div>

<div class="no-hips-message" style="display: none;">
    No HIPs exist for this filter.
</div>

<!-- First render the draft section -->
<h2 id="draft">Draft <span class="status-tooltip" data-tooltip="Draft">ⓘ</span></h2>
<table class="hipstable draft-table">
    <thead>
        <tr>
            <th class="numeric">Number</th>
            <th>Title</th>
            <th>Author</th>
            <th>Needs TSC Review</th>
            <th>Needs Hedera Review</th>
        </tr>
    </thead>
    <tbody class="draft-tbody"></tbody>
</table>

<!-- Then render the rest of the statuses -->
{% for status in site.data.statuses %}
    {% assign combined_hips = include.hips %}
    {% if status == "hedera accepted" %}
        {% assign hips = combined_hips | where_exp: "hip", "hip.status == 'accepted' or hip.status == 'hedera accepted'" | where: "category", category | where: "type", type | sort: "hip" | reverse %}
    {% else %}
        {% assign hips = combined_hips | where: "status", status | where: "category", category | where: "type", type | sort: "hip" | reverse %}
    {% endif %}
    {% assign count = hips.size %}
    {% if count > 0 %}
        <h2 id="{{ status | slugify }}">
            {{ status | capitalize }}
            <span class="status-tooltip" data-tooltip="{{ status }}">ⓘ</span>
        </h2>
        
        <table class="hipstable">
            <thead>
                <tr>
                    <th class="numeric">Number</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Needs TSC Review</th>
                    <th>Needs Hedera Review</th>
                    {% if status == "Last Call" %}
                        <th>Review Period Ends</th>
                    {% else %}
                        <th class="numeric version">Release</th>
                    {% endif %}
                </tr>
            </thead>
            <tbody>
                {% for page in hips %}
                    <tr data-type="{{ page.type | downcase }}"
                        data-category="{{ page.category | downcase }}"
                        data-status="{{ page.status | downcase }}"
                        data-council-approval="{{ page.needs-council-approval | downcase }}"
                        data-tsc-review="{{ page.needs-tsc-review | default: page.needs-council-approval | downcase }}"
                        data-hedera-review="{{ page.needs-hedera-review | default: page.needs-council-approval | downcase }}">
                        
                        <td class="hip-number">
                            <a href="{{ page.url | relative_url }}">{{ page.hip | xml_escape }}</a>
                        </td>
                        
                        <td class="title">
                            <a href="{{ page.url | relative_url }}">{{ page.title | xml_escape }}</a>
                        </td>
                        
                        <td class="author">
                            {% include authorslist.html authors=page.author %}
                        </td>

                        <td class="tsc-review">
                            {% if page.needs-tsc-review %}
                                Yes
                            {% else %}
                                No
                            {% endif %}
                        </td>

                        <td class="hedera-review">
                            {% if page.needs-hedera-review %}
                                Yes
                            {% elsif page.needs-council-approval %}
                                Yes
                            {% else %}
                                No
                            {% endif %}
                        </td>
                        
                        {% if status == "Last Call" %}
                            <td class="last-call-date-time">
                                {{ page.last-call-date-time | date_to_rfc822 }}
                            </td>
                        {% else %}
                            {% if page.category == "Mirror" %}
                                <td class="release">
                                    <a href="https://github.com/hashgraph/hedera-mirror-node/releases/tag/{{page.release}}">
                                        {{page.release|xml_escape}}
                                    </a>
                                </td>
                            {% else %}
                                <td class="release">
                                    <a href="https://github.com/hashgraph/hedera-services/releases/tag/{{page.release}}">
                                        {{page.release|xml_escape}}
                                    </a>
                                </td>
                            {% endif %}
                        {% endif %}
                    </tr>
                {% endfor %}
            </tbody>
        </table>
    {% endif %}
{% endfor %}