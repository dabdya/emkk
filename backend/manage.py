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


def reset_db(args):
    if not args:
        print('Database type not specified. Use Prod or Dev')
        sys.exit(1)

    import os
    import glob
    import shutil

    migrations = [f for f in glob.glob('src/*/migrations/*.py')
                  if '__init__' not in f]

    for migration in migrations:
        os.remove(migration)

    db_type = args[0]
    if db_type == 'Dev':
        try:
            os.remove('db.sqlite3')
        except FileNotFoundError as err:
            print('Database Dev was deleted early')
        os.system('python manage.py makemigrations --configuration=Dev')
        os.system('python manage.py migrate --configuration=Dev')

    elif db_type == 'Prod':
        try:
            shutil.rmtree('data')
        except FileNotFoundError as err:
            print('Database Prod was deleted early')
        print('New migrations apply when docker-compose up running')

    else:
        print('Database type only Prod or Dev')
        sys.exit(2)


def init_db(args):
    if not args:
        print('Need integer count samples')
        sys.exit(3)

    import django
    django.setup()

    from src.emkk_site.utils import EntityGenerator
    from src.emkk_site.models import Trip

    eg = EntityGenerator()
    samples = int(args[0])

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
    # os.environ.setdefault('DJANGO_CONFIGURATION', 'Base')

    from configurations.management import execute_from_command_line

    if sys.argv[1] == 'reset_db':
        reset_db(sys.argv[2:])

    elif sys.argv[1] == 'init_db':
        init_db(sys.argv[2:])

    else:
        execute_from_command_line(sys.argv)
