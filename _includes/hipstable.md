<style type="text/css">
  .hipstable .title {
    width: 67%;
  }

  .hipstable .author {
    width: 33%;
  }
</style>
{% for status in site.data.statuses %}
    {% assign hips = include.hips|where:"status",status|where:"category",category|where:"type",type %}
    {% assign count = hips|size %}
    {% if count > 0 %}
        <h2 id="{{status|slugify}}">{{status}}</h2>
        <table class="hipstable">
            <thead>
                <tr><th>Number</th><th>Title</th><th>Author</th></tr>
            </thead>
        {% for page in hips %}
            <tr>
                <td><a href="{{page.url|relative_url}}">{{page.hip|xml_escape}}</a></td>
                <td class="title">{{page.title|xml_escape}}</td>
                <td class="author">{% include authorslist.html authors=page.author %}</td>
            </tr>
        {% endfor %}
        </table>
    {% endif %}
{% endfor %}