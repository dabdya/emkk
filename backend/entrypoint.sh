#!bin/sh

echo "Waiting for database..."

while ! nc -z $DB_HOST $DB_PORT; do
  echo "Database in not ready yet" $(date)
  sleep 2
done

echo "Database started"

python manage.py makemigrations
python manage.py migrate

if [ $DEBUG -eq 0 ]
then
  gunicorn --certfile=certs/server.crt --keyfile=certs/server.key --bind 0.0.0.0:9000 config.wsgi
else
  python manage.py runserver 0.0.0.0:9000
fi
