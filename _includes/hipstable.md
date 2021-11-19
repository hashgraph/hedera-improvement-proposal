<style type="text/css">
    .hipstable .last-call-date-time {
        width: 21%;
      }

  .hipstable .title {
    width: 45%;
  }

  .hipstable .author {
    width: 25%;
  }
    .hipstable .council-approval {
    width: 5%;
}

.hipstable .hip-number {
    width: 2%;
}
</style>
{% for status in site.data.statuses %}
    {% assign hips = include.hips|where:"status",status|where:"category",category|where:"type",type %}
    {% assign count = hips|size %}
    {% if count > 0 %}
        <h2 id="{{status|slugify}}">{{status}}</h2>
        <table class="hipstable">
            <thead>
                <tr><th>Number</th><th>Title</th><th>Author</th><th>Needs Council Approval</th>
                {% if status == "Last Call" %}
                    <th>Last Call Date Time</th>
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
                {% endif %}
            </tr>
        {% endfor %}
        </table>
    {% endif %}
{% endfor %}