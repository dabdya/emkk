FROM python:3.8-alpine
ENV PYTHONUNBUFFERED=1
WORKDIR /emkk
COPY requirements.txt /emkk/
RUN apk update
RUN apk add postgresql-dev gcc python3-dev musl-dev
RUN pip install -r requirements.txt
COPY . /emkk/