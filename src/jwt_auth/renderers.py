from rest_framework.renderers import JSONRenderer
import json


class UserJSONRenderer(JSONRenderer):
    charset = 'utf-8'

    def render(self, data, media_type=None, renderer_context=None):
        return json.dumps({
            'user': data
        })
