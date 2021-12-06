#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


def reset_db():
    import os
    import glob
    import shutil

    migrations = [f for f in glob.glob('src/*/migrations/*.py')
                  if '__init__' not in f]

    for migration in migrations:
        os.remove(migration)

    db_type = os.environ.get('DEFAULT_DATABASE')
    if db_type == 'sqlite':
        try:
            os.remove('db.sqlite3')
        except FileNotFoundError as err:
            print('Database Dev was deleted early')
        os.system('python manage.py makemigrations')
        os.system('python manage.py migrate')

    else:
        try:
            shutil.rmtree('data')
        except FileNotFoundError as err:
            print('Database prod was deleted early')
        print('New migrations apply when docker-compose up running')


def init_db(samples=5):

    import django
    django.setup()

    from src.emkk_site.utils import EntityGenerator
    from src.emkk_site.models import Trip

    eg = EntityGenerator()
    if samples > 6:
        from src.emkk_site.utils import generate_3_trips_and_users

        generate_3_trips_and_users()
        samples -= 3

    for i in range(samples):
        instance = eg.generate_instance_by_model(Trip)
        instance.save()

    print('Instances was created successfully')


if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

    if 'dev' in sys.argv:
        os.environ.setdefault('DEFAULT_DATABASE', 'sqlite')
        sys.argv.remove('dev')

    if sys.argv[1] == 'reset_db':
        reset_db()

    elif sys.argv[1] == 'init_db':
        init_db(samples=10)

    else:
        main()
