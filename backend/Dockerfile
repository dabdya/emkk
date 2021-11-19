FROM python:3.9-alpine
ENV PYTHONUNBUFFERED=1

WORKDIR /emkk/backend

RUN apk update
RUN apk add postgresql-dev gcc python3-dev musl-dev

COPY requirements.txt /emkk/backend/
RUN pip install -r requirements.txt

COPY . /emkk/backend/

RUN chmod +x /emkk/backend/entrypoint.sh
ENTRYPOINT ["/bin/sh", "/emkk/backend/entrypoint.sh"]