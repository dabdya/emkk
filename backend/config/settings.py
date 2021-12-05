import os

PRODUCTION = os.environ.get('PRODUCTION', False)

if PRODUCTION:
    from settings_prod import *
else:
    from settings_dev import *
