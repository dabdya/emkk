FROM python:3.9-alpine
ENV PYTHONUNBUFFERED=1

WORKDIR /emkk

RUN apk update
RUN apk add postgresql-dev gcc python3-dev musl-dev

COPY requirements.txt /emkk/
RUN pip install -r requirements.txt

COPY . /emkk/

RUN chmod +x /emkk/entrypoint.sh
ENTRYPOINT ["/bin/sh", "/emkk/entrypoint.sh"]